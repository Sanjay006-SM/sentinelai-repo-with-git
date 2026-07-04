from sqlalchemy import Column, String, DateTime, ForeignKey, Index, Text, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.models.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(String(255), nullable=False, unique=True, index=True)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)
    
    actor = Column(String(255), nullable=False, index=True)
    actor_type = Column(String(50), nullable=False)
    module = Column(String(100), nullable=False)
    action = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    severity = Column(String(50), nullable=False, index=True)
    status = Column(String(50), nullable=False, index=True)
    
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(255), nullable=True)
    
    metadata_json = Column(JSON, nullable=True)
    
    correlation_id = Column(String(255), nullable=True, index=True)
    parent_event_id = Column(String(255), nullable=True)
    root_event_id = Column(String(255), nullable=True)
    
    duration_ms = Column(Integer, nullable=True)

    __table_args__ = (
        Index("ix_audit_logs_workspace_timestamp", "workspace_id", "timestamp"),
        Index("ix_audit_logs_workspace_category", "workspace_id", "category"),
    )
