from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from neo4j import Session as GraphSession
import uuid

from app.api.dependencies import get_db, get_neo4j_session, get_current_workspace
from app.models.risk_finding import RiskFinding
from app.models.tenant import Workspace
from app.schemas.finding import FindingDetailsResponse
from app.core.config import settings

router = APIRouter()

@router.get("/{finding_id}", response_model=FindingDetailsResponse)
def get_finding_details(
    finding_id: str,
    db: Session = Depends(get_db),
    graph: GraphSession = Depends(get_neo4j_session),
    workspace: Workspace = Depends(get_current_workspace)
):
    try:
        finding_uuid = uuid.UUID(finding_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid finding ID format")

    finding = db.query(RiskFinding).filter(
        RiskFinding.id == finding_uuid,
        RiskFinding.workspace_id == workspace.id
    ).first()

    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    # Base response
    response_data = {
        "id": finding.id,
        "identity_id": finding.identity_id,
        "finding_type": finding.finding_type,
        "severity": finding.severity,
        "description": finding.description,
        "event_reference": finding.event_reference,
        "created_at": finding.created_at,
    }

    # Additive Explainability Engine
    if settings.ENABLE_GRAPH_EVIDENCE_ENGINE:
        # Import dynamically or safely here to avoid circular deps if needed
        # We will build the GraphEvidenceEngine next.
        try:
            from app.services.graph_evidence.explainability_service import ExplainabilityService
            service = ExplainabilityService(db, graph)
            evidence = service.generate_finding_details(str(finding.id), str(workspace.id), str(finding.identity_id))
            
            # Merge evidence keys into response
            if evidence:
                response_data.update(evidence)
        except Exception as e:
            # Failure handling: should not crash Finding Details
            import logging
            logging.getLogger(__name__).error(f"Explainability Service failed: {str(e)}")
            response_data["evidence_status"] = "unavailable"
            response_data["ai_status"] = "failed"

    return response_data
