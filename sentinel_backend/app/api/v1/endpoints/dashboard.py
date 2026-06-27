from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from neo4j import Session as GraphSession
from typing import Dict, Any

from app.api.dependencies import get_db, get_neo4j_session
from app.models.machine_identity import MachineIdentity
from app.models.risk_score import RiskScore
from app.models.risk_finding import RiskFinding
from app.models.access_log import AccessLog

router = APIRouter()

@router.get("/summary", response_model=Dict[str, Any])
def get_dashboard_summary(
    db: Session = Depends(get_db),
    graph: GraphSession = Depends(get_neo4j_session)
):
    identities_count = db.query(MachineIdentity).count()
    
    # Get critical risk count (latest score per identity where severity='Critical' or 'High')
    # For simplicity, we just count RiskScores with severity 'Critical' or 'High'
    critical_risk_count = db.query(RiskScore).filter(RiskScore.severity.in_(["Critical", "High"])).count()
    
    # Attack path count (edges of type ASSUMED_ROLE)
    attack_path_count = 0
    try:
        res = graph.run("MATCH ()-[r:ASSUMED_ROLE]->() RETURN count(r) as c")
        attack_path_count = res.single()["c"]
    except Exception:
        pass
    
    # Total findings count replacing mocked investigation count
    total_findings_count = db.query(RiskFinding).count()
    
    return {
        "identities_count": identities_count,
        "critical_risk_count": critical_risk_count,
        "attack_path_count": attack_path_count,
        "total_findings_count": total_findings_count
    }

@router.get("/recent-findings")
def get_recent_findings(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    findings = db.query(RiskFinding).order_by(RiskFinding.created_at.desc()).limit(limit).all()
    results = []
    for f in findings:
        results.append({
            "id": str(f.id),
            "identity_arn": f.identity.arn if f.identity else "Unknown",
            "finding_type": f.finding_type,
            "severity": f.severity,
            "description": f.description,
            "created_at": f.created_at.isoformat() if f.created_at else None
        })
    return results

@router.get("/recent-events")
def get_recent_events(
    limit: int = 15,
    db: Session = Depends(get_db)
):
    events = db.query(AccessLog).order_by(AccessLog.event_time.desc()).limit(limit).all()
    results = []
    for e in events:
        # Determine status (Denied/Success) and basic anomaly tag
        raw_json = e.raw_event_json or {}
        error_code = raw_json.get("errorCode") or ""
        error_msg = raw_json.get("errorMessage") or ""
        
        is_denied = "Denied" in str(error_code) or "Unauthorized" in str(error_msg)
        is_anomaly = is_denied or e.event_name in ["DeleteVpc", "ConsoleLogin", "DeleteBucket"]
        
        results.append({
            "id": str(e.id),
            "event": e.event_name,
            "user": e.identity_arn,
            "source": e.source_ip or e.event_source,
            "status": "Denied" if is_denied else "Success",
            "isAnomaly": is_anomaly,
            "anomalyReason": "Destructive Action" if e.event_name.startswith("Delete") else ("Unauthorized" if is_denied else ("Login" if "Login" in e.event_name else "")),
            "event_time": e.event_time.isoformat()
        })
    return results

@router.get("/top-attack-paths")
def get_top_attack_paths(
    limit: int = 3,
    graph: GraphSession = Depends(get_neo4j_session)
):
    # Query Neo4j for shortest paths from Identity to DataStore or Resource
    query = """
    MATCH p=shortestPath((i:Identity)-[*1..4]->(d))
    WHERE any(label in labels(d) WHERE label IN ['DataStore', 'Resource'])
      AND length(p) > 0
    RETURN p
    LIMIT $limit
    """
    results = []
    try:
        res = graph.run(query, limit=limit)
        for record in res:
            path = record["p"]
            nodes_data = []
            for node in path.nodes:
                labels = list(node.labels)
                label = labels[0] if labels else "Unknown"
                name = dict(node.items()).get("arn", "Unknown")
                nodes_data.append({"label": label, "name": name})
                
            edges_data = []
            for rel in path.relationships:
                edges_data.append(rel.type)
                
            # If path has at least 2 nodes, it's valid
            if len(nodes_data) > 1:
                results.append({
                    "nodes": nodes_data,
                    "edges": edges_data,
                    "severity": "Critical" if "DataStore" in nodes_data[-1]["label"] else "High"
                })
    except Exception as e:
        pass
    
    return results
