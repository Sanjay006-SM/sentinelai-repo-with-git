from datetime import datetime
from typing import List, Optional
import uuid
from sqlalchemy import String, DateTime, BigInteger, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.models.base import Base

class MachineIdentity(Base):
    __tablename__ = "machine_identities"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    arn: Mapped[str] = mapped_column(String(512), unique=True, index=True)
    identity_type: Mapped[str] = mapped_column(String(50))
    account_id: Mapped[str] = mapped_column(String(12), index=True)
    first_seen: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_seen: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    total_events: Mapped[int] = mapped_column(BigInteger, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    risk_scores: Mapped[List["RiskScore"]] = relationship(back_populates="identity", cascade="all, delete-orphan")
    risk_findings: Mapped[List["RiskFinding"]] = relationship(back_populates="identity", cascade="all, delete-orphan")
    
    __table_args__ = (
        CheckConstraint(identity_type.in_(['AssumedRole', 'AWSService', 'IAMUser']), name='identity_type_check'),
    )
