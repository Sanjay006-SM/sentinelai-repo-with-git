from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid
import logging
import json

logger = logging.getLogger(__name__)

from app.api.dependencies import get_db, get_current_workspace, get_current_active_user
from app.services.report_engine import ReportEngineService
from app.models.tenant import Workspace, User
from app.services.report_pipeline.report_storage import ReportStorage

router = APIRouter()

class ReportGenerateRequest(BaseModel):
    name: str
    report_type: str
    filters: Dict[str, Any]

@router.get("/statistics")
def get_report_statistics(
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(get_current_workspace),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    service = ReportEngineService(db)
    stats = service.get_report_statistics(str(workspace.id))
    return stats

@router.get("/")
def get_reports(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(get_current_workspace),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    service = ReportEngineService(db)
    reports = service.get_reports(str(workspace.id), skip=skip, limit=limit)
    return {
        "data": [
            {
                "id": str(r.id),
                "name": r.name,
                "type": r.type,
                "status": r.status,
                "file_url": r.file_url,
                "csv_url": r.csv_url,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in reports
        ]
    }

@router.post("/generate")
def generate_report(
    req: ReportGenerateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(get_current_workspace),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    service = ReportEngineService(db)
    report = service.generate_report(
        background_tasks=background_tasks,
        workspace_id=str(workspace.id),
        organization_id=str(workspace.organization_id),
        name=req.name,
        report_type=req.report_type,
        filters=req.filters,
        user_id=str(current_user.id)
    )
    return {
        "id": str(report.id),
        "name": report.name,
        "status": report.status,
        "file_url": report.file_url
    }

@router.get("/{report_id}/download")
def download_report(
    report_id: str,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(get_current_workspace),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    logger.info(json.dumps({"workspace_id": str(workspace.id), "report_id": report_id, "action": "DOWNLOAD", "status": "STARTED"}))
    from app.models.report import Report
    report = db.query(Report).filter(
        Report.id == uuid.UUID(report_id),
        Report.workspace_id == workspace.id
    ).first()
    
    if not report:
        logger.warning(json.dumps({"workspace_id": str(workspace.id), "report_id": report_id, "action": "DOWNLOAD", "status": "FAILED", "reason": "Report not found"}))
        raise HTTPException(status_code=404, detail="Report not found")
        
    if report.status == "FAILED":
        logger.warning(json.dumps({"workspace_id": str(workspace.id), "report_id": report_id, "action": "DOWNLOAD", "status": "FAILED", "reason": "Report generation failed"}))
        raise HTTPException(status_code=400, detail="Unable to generate report.")
    elif report.status != "COMPLETED":
        logger.warning(json.dumps({"workspace_id": str(workspace.id), "report_id": report_id, "action": "DOWNLOAD", "status": "FAILED", "reason": "Not completed"}))
        raise HTTPException(status_code=400, detail="Report generation not completed")
        
    if not report.file_url:
        logger.error(json.dumps({"workspace_id": str(workspace.id), "report_id": report_id, "action": "DOWNLOAD", "status": "FAILED", "reason": "Missing file_url"}))
        raise HTTPException(status_code=404, detail="PDF generation failed.")
        
    storage = ReportStorage()
    try:
        file_bytes = storage.get_file(report.file_url)
    except FileNotFoundError:
        logger.error(json.dumps({"workspace_id": str(workspace.id), "report_id": report_id, "action": "DOWNLOAD", "status": "FAILED", "reason": "File not found in storage"}))
        raise HTTPException(status_code=404, detail="Download unavailable.")
    except Exception as e:
        logger.error(json.dumps({"workspace_id": str(workspace.id), "report_id": report_id, "action": "DOWNLOAD", "status": "FAILED", "reason": f"Storage error: {e}"}))
        raise HTTPException(status_code=503, detail="Storage unavailable.")
    
    from fastapi.responses import StreamingResponse
    import io
    
    logger.info(json.dumps({"workspace_id": str(workspace.id), "report_id": report_id, "action": "DOWNLOAD", "status": "SUCCESS"}))
    return StreamingResponse(
        io.BytesIO(file_bytes), 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename={report.name.replace(' ', '_')}.pdf"}
    )
