from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

from app.core.events.event_types import (
    EventCategory, EventSeverity, EventStatus, 
    ActorClassification, SourceClassification, ResourceClassification
)

class EventMetadata(BaseModel):
    model_config = ConfigDict(extra="allow")

    ip_address: Optional[str] = None
    request_id: Optional[str] = None
    trace_id: Optional[str] = None
    cloud_provider: Optional[str] = None
    account_id: Optional[str] = None
    region: Optional[str] = None
    user_agent: Optional[str] = None
    api_endpoint: Optional[str] = None
    http_method: Optional[str] = None
    execution_source: Optional[SourceClassification] = None

class BaseEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_version: str = "1.0"
    workspace_id: str
    organization_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    actor: str
    actor_type: ActorClassification
    module: str
    action: str
    category: EventCategory
    severity: EventSeverity
    status: EventStatus
    
    resource_type: ResourceClassification
    resource_id: Optional[str] = None
    
    metadata: EventMetadata = Field(default_factory=EventMetadata)
    
    correlation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parent_event_id: Optional[str] = None
    root_event_id: Optional[str] = None
    
    duration_ms: Optional[int] = None

class AuditEvent(BaseEvent):
    pass

class GraphEvent(BaseEvent):
    pass

class RiskEvent(BaseEvent):
    pass

class NotificationEvent(BaseEvent):
    pass

class ReportEvent(BaseEvent):
    pass

class InvestigationEvent(BaseEvent):
    pass
