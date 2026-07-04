from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from neo4j import Session as GraphSession
from typing import Dict, Any, List
from pydantic import BaseModel

from app.api.dependencies import get_db, get_neo4j_session, get_current_workspace
from app.services.ai.investigation_service import InvestigationService
from app.models.tenant import User, Workspace
import uuid

router = APIRouter()

class InvestigateRequest(BaseModel):
    identity_id: str

class InvestigateResponse(BaseModel):
    success: bool = True
    code: str = None
    message: str = None
    executive_summary: str = None
    risk_assessment: str = None
    attack_path_analysis: str = None
    findings: List[str] = None
    recommendations: List[str] = None


@router.post("/investigate", response_model=InvestigateResponse)
def investigate_identity(
    request: InvestigateRequest,
    db: Session = Depends(get_db),
    graph: GraphSession = Depends(get_neo4j_session),
    workspace: Workspace = Depends(get_current_workspace)
):
    investigation_id = str(uuid.uuid4())
    try:
        service = InvestigationService(db, graph)
        report = service.investigate(request.identity_id, str(workspace.id), investigation_id)
        
        # We always return HTTP 200 with the sanitized payload to prevent UI crashes
        if "error" in report and "success" not in report:
            # Handle legacy error dict from EvidenceCollector if any
            return {
                "success": False,
                "code": "UNKNOWN_ERROR",
                "message": report["error"]
            }
            
        return report
    except Exception as e:
        # Fallback for completely unhandled errors outside the AI service
        return {
            "success": False,
            "code": "UNKNOWN_ERROR",
            "message": "An unexpected error occurred while setting up the investigation."
        }
