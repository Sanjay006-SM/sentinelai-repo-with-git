from sqlalchemy.orm import Session
from neo4j import Session as GraphSession
from typing import Dict, Any

from app.models.machine_identity import MachineIdentity
from app.models.risk_score import RiskScore
from app.models.access_log import AccessLog
from app.services.attack_path_service import AttackPathService

class EvidenceCollector:
    def __init__(self, db: Session, graph: GraphSession):
        self.db = db
        self.graph = graph
        self.attack_path_svc = AttackPathService(graph)

    def collect_evidence(self, identity_id: str) -> Dict[str, Any]:
        evidence = {}
        
        # 1. Identity Metadata
        # Try to find by UUID first, then fallback to ARN if the string doesn't look like a UUID
        try:
            import uuid
            uuid_obj = uuid.UUID(identity_id)
            identity = self.db.query(MachineIdentity).filter(MachineIdentity.id == uuid_obj).first()
        except ValueError:
            identity = self.db.query(MachineIdentity).filter(MachineIdentity.arn == identity_id).first()
            
        if not identity:
            return {"error": f"Identity '{identity_id}' not found."}
            
        evidence["identity"] = {
            "arn": identity.arn,
            "type": identity.identity_type,
            "first_seen": identity.first_seen.isoformat() if identity.first_seen else None,
            "last_seen": identity.last_seen.isoformat() if identity.last_seen else None,
            "total_events": identity.total_events
        }
        
        # 2. Risk Score & Reasons
        score = self.db.query(RiskScore).filter(RiskScore.identity_id == identity.id).first()
        if score:
            evidence["risk"] = {
                "score": score.score,
                "severity": score.severity,
                "reasons": score.reasons
            }
        else:
            evidence["risk"] = {"score": 0, "severity": "Low", "reasons": []}
            
        # 3. Recent Activity (Sampled) - Limit to top 20 to optimize token usage
        recent_logs = self.db.query(AccessLog).filter(AccessLog.identity_arn == identity.arn)\
            .order_by(AccessLog.event_time.desc()).limit(20).all()
            
        evidence["recent_activity"] = [
            {
                "event_name": log.event_name,
                "event_source": log.event_source,
                "time": log.event_time.isoformat(),
                "resource": log.resource_arn,
                "source_ip": log.source_ip
            } for log in recent_logs
        ]
        
        # 4. Attack Path Graph Data & Summary
        path_data = self.attack_path_svc.get_attack_path(identity.arn)
        edges_summary = [edge['label'] for edge in path_data.get("edges", [])]
        
        evidence["attack_path"] = {
            "nodes_count": len(path_data.get("nodes", [])),
            "edges_count": len(path_data.get("edges", [])),
            "traversal_summary": f"Graph shows {len(edges_summary)} relationships.",
            "edges": list(set(edges_summary)) # Unique relationship types in path
        }

        # 5. Relationship Counts (Neo4j)
        rel_counts = {}
        for rel_type in ["ACCESSED_RESOURCE", "ORIGINATED_FROM", "ASSUMED_ROLE"]:
            query = f"MATCH (i:Identity {{arn: $arn}})-[:{rel_type}]->(target) RETURN count(target) as count"
            res = self.graph.run(query, arn=identity.arn).single()
            rel_counts[rel_type.lower() + "_count"] = res["count"] if res else 0
        evidence["relationship_counts"] = rel_counts

        # 6. Sensitive Resource Access Summary (Postgres)
        sensitive_services = {
            "iam_actions_count": "iam.amazonaws.com",
            "kms_actions_count": "kms.amazonaws.com",
            "secretsmanager_actions_count": "secretsmanager.amazonaws.com"
        }
        sensitive_summary = {}
        for key, service in sensitive_services.items():
            count = self.db.query(AccessLog).filter(
                AccessLog.identity_arn == identity.arn,
                AccessLog.event_source == service
            ).count()
            sensitive_summary[key] = count
            
        s3_sensitive_count = self.db.query(AccessLog).filter(
            AccessLog.identity_arn == identity.arn,
            AccessLog.event_source == 's3.amazonaws.com',
            AccessLog.event_name.in_(['DeleteBucket', 'DeleteObject', 'PutBucketAcl', 'PutBucketPolicy'])
        ).count()
        sensitive_summary["s3_sensitive_actions_count"] = s3_sensitive_count
        
        evidence["sensitive_resource_access_summary"] = sensitive_summary
        
        return evidence

