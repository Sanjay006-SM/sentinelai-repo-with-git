from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func
from neo4j import Session as GraphSession
from typing import List, Tuple

from app.models.machine_identity import MachineIdentity
from app.models.access_log import AccessLog

class RiskFactorCalculator:
    def __init__(self, db: DBSession, graph: GraphSession):
        self.db = db
        self.graph = graph

    def calc_privilege_escalation(self, arn: str) -> Tuple[int, List[str]]:
        score = 0
        reasons = []
        query = """
        MATCH (i:Identity {arn: $arn})-[rel:ASSUMED_ROLE]->(target)
        RETURN count(target) as role_count
        """
        result = self.graph.run(query, arn=arn).single()
        role_count = result["role_count"] if result else 0
        
        if role_count > 0:
            score += min(role_count * 20, 40) # Max 40 points
            reasons.append(f"Identity assumes {role_count} other role(s), increasing privilege escalation risk.")
            
        return score, reasons

    def calc_sensitive_access(self, arn: str) -> Tuple[int, List[str]]:
        score = 0
        reasons = []
        
        sensitive_services = ['kms.amazonaws.com', 'iam.amazonaws.com', 'secretsmanager.amazonaws.com']
        
        counts = self.db.query(AccessLog.event_source, func.count(AccessLog.id))\
            .filter(AccessLog.identity_arn == arn)\
            .filter(AccessLog.event_source.in_(sensitive_services))\
            .group_by(AccessLog.event_source).all()
            
        for service, count in counts:
            score += 15
            reasons.append(f"Accessed sensitive service {service} ({count} times).")
            
        s3_counts = self.db.query(func.count(AccessLog.id))\
            .filter(AccessLog.identity_arn == arn)\
            .filter(AccessLog.event_source == 's3.amazonaws.com')\
            .filter(AccessLog.event_name.in_(['DeleteBucket', 'DeleteObject', 'PutBucketAcl', 'PutBucketPolicy']))\
            .scalar()
            
        if s3_counts > 0:
            score += 15
            reasons.append(f"Performed {s3_counts} sensitive S3 management actions.")
            
        return min(score, 30), reasons

    def calc_activity_volume(self, identity: MachineIdentity) -> Tuple[int, List[str]]:
        score = 0
        reasons = []
        if identity.total_events > 5000:
            score += 10
            reasons.append(f"High API activity volume ({identity.total_events} total events).")
        return score, reasons

    def calc_geographic_anomaly(self, arn: str) -> Tuple[int, List[str]]:
        score = 0
        reasons = []
        query = """
        MATCH (i:Identity {arn: $arn})-[rel:ORIGINATED_FROM]->(ip:IPAddress)
        RETURN count(ip) as ip_count
        """
        result = self.graph.run(query, arn=arn).single()
        ip_count = result["ip_count"] if result else 0
        
        if ip_count > 5:
            score += 10
            reasons.append(f"Activity originated from an unusually high number of distinct IPs ({ip_count}).")
            
        return score, reasons

    def calc_dormant_then_active(self, identity: MachineIdentity) -> Tuple[int, List[str]]:
        score = 0
        reasons = []
        if identity.first_seen and identity.last_seen:
            days_active = (identity.last_seen - identity.first_seen).days
            # Heuristic: Activity after a long period of low usage (e.g. <10 events per day average)
            if days_active > 30 and (identity.total_events / days_active) < 5:
                score += 15
                reasons.append(f"Identity active after long period of low average activity.")
        return score, reasons

    def calc_failed_calls(self, arn: str) -> Tuple[int, List[str]]:
        score = 0
        reasons = []
        
        failed_count = self.db.query(func.count(AccessLog.id))\
            .filter(AccessLog.identity_arn == arn)\
            .filter(AccessLog.raw_event_json.op('->>')('errorCode').in_(['AccessDenied', 'UnauthorizedOperation']))\
            .scalar()
            
        if failed_count > 0:
            score += min(failed_count * 5, 20) # Max 20 points
            reasons.append(f"Encountered {failed_count} 'AccessDenied' or 'UnauthorizedOperation' errors.")
            
        return score, reasons
