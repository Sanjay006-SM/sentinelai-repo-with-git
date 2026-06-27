from datetime import datetime
from typing import Any, Dict, Optional
import uuid
from sqlalchemy import String, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.models.base import Base

class AccessLog(Base):
    __tablename__ = "access_logs"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    event_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    event_name: Mapped[str] = mapped_column(String(255), index=True)
    event_source: Mapped[str] = mapped_column(String(255), index=True)
    aws_region: Mapped[str] = mapped_column(String(50))
    source_ip: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    identity_arn: Mapped[str] = mapped_column(String(512), index=True)
    resource_arn: Mapped[Optional[str]] = mapped_column(String(512), nullable=True, index=True)
    account_id: Mapped[str] = mapped_column(String(12))
    raw_event_json: Mapped[Dict[str, Any]] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        Index('idx_access_log_time_arn', 'event_time', 'identity_arn'),
    )
