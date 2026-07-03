import csv
import io
import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, and_
from datetime import datetime

from app.models.audit_log import AuditLog

class AuditService:
    def __init__(self, db: Session):
        self.db = db
        
    def _build_search_query(self, workspace_id: str, filters: Dict[str, Any]):
        query = self.db.query(AuditLog).filter(AuditLog.workspace_id == uuid.UUID(workspace_id))
        
        if filters.get("actor"):
            query = query.filter(AuditLog.actor.ilike(f"%{filters['actor']}%"))
        if filters.get("action"):
            query = query.filter(AuditLog.action.ilike(f"%{filters['action']}%"))
        if filters.get("category"):
            query = query.filter(AuditLog.category == filters['category'])
        if filters.get("severity"):
            query = query.filter(AuditLog.severity == filters['severity'])
        if filters.get("status"):
            query = query.filter(AuditLog.status == filters['status'])
        if filters.get("module"):
            query = query.filter(AuditLog.module == filters['module'])
        if filters.get("resource_id"):
            query = query.filter(AuditLog.resource_id == filters['resource_id'])
        if filters.get("correlation_id"):
            query = query.filter(AuditLog.correlation_id == filters['correlation_id'])
            
        if filters.get("start_date"):
            query = query.filter(AuditLog.timestamp >= filters["start_date"])
        if filters.get("end_date"):
            query = query.filter(AuditLog.timestamp <= filters["end_date"])
            
        return query

    def search_logs(self, workspace_id: str, filters: Dict[str, Any], skip: int = 0, limit: int = 100) -> List[AuditLog]:
        query = self._build_search_query(workspace_id, filters)
        return query.order_by(desc(AuditLog.timestamp)).offset(skip).limit(limit).all()

    def get_statistics(self, workspace_id: str) -> Dict[str, Any]:
        """Use SQL aggregation instead of fetching all records into memory."""
        # Total Events
        total = self.db.query(func.count(AuditLog.id)).filter(
            AuditLog.workspace_id == uuid.UUID(workspace_id)
        ).scalar() or 0
        
        # Failed Actions
        failed = self.db.query(func.count(AuditLog.id)).filter(
            AuditLog.workspace_id == uuid.UUID(workspace_id),
            AuditLog.status == 'FAILED'
        ).scalar() or 0
        
        # Security Events
        security = self.db.query(func.count(AuditLog.id)).filter(
            AuditLog.workspace_id == uuid.UUID(workspace_id),
            AuditLog.category.in_(['AUTHENTICATION', 'IDENTITY', 'RESOURCE'])
        ).scalar() or 0
        
        # Administrative Actions
        admin = self.db.query(func.count(AuditLog.id)).filter(
            AuditLog.workspace_id == uuid.UUID(workspace_id),
            AuditLog.category.in_(['ORGANIZATION', 'SETTINGS'])
        ).scalar() or 0

        return {
            "total_events": total,
            "failed_actions": failed,
            "security_events": security,
            "administrative_actions": admin
        }

    def export_csv(self, workspace_id: str, filters: Dict[str, Any]):
        query = self._build_search_query(workspace_id, filters).order_by(desc(AuditLog.timestamp))
        
        # Stream logs in chunks to avoid memory bloat
        chunk_size = 1000
        offset = 0
        
        # Create CSV header
        header = ["timestamp", "event_id", "actor", "actor_type", "module", "action", "category", "severity", "status", "resource_type", "resource_id", "correlation_id"]
        
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(header)
        yield output.getvalue()
        output.seek(0)
        output.truncate(0)
        
        while True:
            chunk = query.offset(offset).limit(chunk_size).all()
            if not chunk:
                break
                
            for log in chunk:
                row = [
                    log.timestamp.isoformat() if log.timestamp else "",
                    log.event_id,
                    log.actor,
                    log.actor_type,
                    log.module,
                    log.action,
                    log.category,
                    log.severity,
                    log.status,
                    log.resource_type,
                    log.resource_id,
                    log.correlation_id
                ]
                writer.writerow(row)
            
            yield output.getvalue()
            output.seek(0)
            output.truncate(0)
            
            offset += chunk_size
