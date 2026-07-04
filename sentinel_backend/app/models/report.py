from sqlalchemy import Column, String, DateTime, ForeignKey, Index, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.models.base import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(255), nullable=False)
    type = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default="DRAFT") # DRAFT, QUEUED, GENERATING, VALIDATING, RENDERING, UPLOADING, COMPLETED, FAILED, RETRYING, CANCELLED
    
    file_url = Column(Text, nullable=True) # S3 or local path for PDF
    csv_url = Column(Text, nullable=True) # S3 or local path for CSV ZIP
    metadata_json = Column(JSON, nullable=True) # filters applied, summary
    
    report_size_bytes = Column(String(50), nullable=True)
    version_number = Column(String(20), default="1.0.0")
    generator_version = Column(String(20), default="1.0.0")
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    
    __table_args__ = (
        Index("ix_reports_workspace_id_created_at", "workspace_id", "created_at"),
    )

class ReportHistory(Base):
    __tablename__ = "report_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    status = Column(String(50), nullable=False) # DRAFT, QUEUED, GENERATING, VALIDATING, RENDERING, UPLOADING, COMPLETED, FAILED, ARCHIVED, DOWNLOADED, RETRYING, CANCELLED
    stage = Column(String(50), nullable=True)
    error_message = Column(Text, nullable=True)
    duration_ms = Column(String(50), nullable=True)
    
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_report_history_report_id_timestamp", "report_id", "timestamp"),
    )

class ScheduledReport(Base):
    __tablename__ = "scheduled_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(255), nullable=False)
    type = Column(String(100), nullable=False)
    cron_schedule = Column(String(100), nullable=False)
    next_run = Column(DateTime(timezone=True), nullable=True)
    
    filters_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
