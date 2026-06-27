from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from neo4j import Session as GraphSession
from typing import Dict, Any

from app.api.dependencies import get_db, get_neo4j_session
from app.models.machine_identity import MachineIdentity
from app.services.attack_path_service import AttackPathService

router = APIRouter()

from typing import List
from app.models.risk_score import RiskScore

@router.get("", response_model=List[Dict[str, Any]])
def list_identities(db: Session = Depends(get_db)):
    identities = db.query(MachineIdentity).all()
    results = []
    for ident in identities:
        latest_risk = db.query(RiskScore).filter(RiskScore.identity_id == ident.id).order_by(RiskScore.calculated_at.desc()).first()
        results.append({
            "id": str(ident.id),
            "arn": ident.arn,
            "identity_type": ident.identity_type,
            "account_id": ident.account_id,
            "first_seen": ident.first_seen,
            "last_seen": ident.last_seen,
            "total_events": ident.total_events,
            "risk_score": latest_risk.score if latest_risk else 0,
            "risk_severity": latest_risk.severity if latest_risk else "Low"
        })
    results.sort(key=lambda x: x["risk_score"], reverse=True)
    return results

@router.get("/{identity_id}/attack-path", response_model=Dict[str, Any])
def get_identity_attack_path(
    identity_id: str,
    db: Session = Depends(get_db),
    graph: GraphSession = Depends(get_neo4j_session)
):
    identity = db.query(MachineIdentity).filter(MachineIdentity.id == identity_id).first()
    if not identity:
        raise HTTPException(status_code=404, detail="Identity not found")
        
    service = AttackPathService(graph)
    graph_data = service.get_attack_path(identity.arn)
    
    return graph_data
