import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base

class Integration(Base):
    __tablename__ = "integrations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id"), nullable=False, index=True)
    provider = Column(String, nullable=False, index=True) # e.g., 'aws'
    config = Column(JSON, nullable=False, default=dict) # Account ID, Region, etc.
    encrypted_credentials = Column(String, nullable=True) # Encrypted string containing secrets
    status = Column(String, nullable=False, default="configured") # 'configured', 'syncing', 'error'
    last_sync_time = Column(DateTime(timezone=True), nullable=True)
    events_retrieved = Column(Integer, default=0)
    error_message = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
