from typing import Any, List, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from app.api.dependencies import get_db, get_current_workspace, get_current_active_user
from app.services.audit_service import AuditService
from app.models.tenant import Workspace, User

router = APIRouter()

class SearchFilters(BaseModel):
    actor: Optional[str] = None
    action: Optional[str] = None
    category: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    module: Optional[str] = None
    resource_id: Optional[str] = None
    correlation_id: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

@router.get("/statistics")
def get_audit_statistics(
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(get_current_workspace),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Retrieve audit log KPI statistics for the dashboard
    """
    service = AuditService(db)
    stats = service.get_statistics(str(workspace.id))
    return stats

@router.get("/")
def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(get_current_workspace),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Retrieve audit logs with pagination
    """
    service = AuditService(db)
    logs = service.search_logs(str(workspace.id), {}, skip=skip, limit=limit)
    
    return {
        "data": [
            {
                "id": str(log.id),
                "actor": log.actor,
                "action": log.action,
                "category": log.category.capitalize() if log.category else "",
                "severity": log.severity.capitalize() if log.severity else "",
                "target_resource": log.resource_id,
                "created_at": log.timestamp.isoformat() if log.timestamp else None,
                "status": log.status.capitalize() if log.status else ""
            }
            for log in logs
        ]
    }

@router.post("/search")
def search_audit_logs(
    filters: SearchFilters,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(get_current_workspace),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Search audit logs with dynamic filtering
    """
    service = AuditService(db)
    filter_dict = {k: v for k, v in filters.dict().items() if v is not None}
    
    logs = service.search_logs(str(workspace.id), filter_dict, skip=skip, limit=limit)
    
    return {
        "data": [
            {
                "id": str(log.id),
                "actor": log.actor,
                "action": log.action,
                "category": log.category.capitalize() if log.category else "",
                "severity": log.severity.capitalize() if log.severity else "",
                "target_resource": log.resource_id,
                "created_at": log.timestamp.isoformat() if log.timestamp else None,
                "status": log.status.capitalize() if log.status else ""
            }
            for log in logs
        ]
    }

@router.get("/export")
def export_audit_logs(
    actor: str = None,
    action: str = None,
    category: str = None,
    severity: str = None,
    status: str = None,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(get_current_workspace),
    current_user: User = Depends(get_current_active_user)
):
    """
    Export audit logs to CSV
    """
    service = AuditService(db)
    filters = {
        "actor": actor,
        "action": action,
        "category": category,
        "severity": severity,
        "status": status
    }
    filter_dict = {k: v for k, v in filters.items() if v is not None}
    
    response = StreamingResponse(service.export_csv(str(workspace.id), filter_dict), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=audit_logs.csv"
    return response
