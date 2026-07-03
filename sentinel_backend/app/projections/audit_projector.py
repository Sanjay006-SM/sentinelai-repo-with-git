import logging
from sqlalchemy.orm import Session
from app.core.events.bus import event_bus
from app.core.events.contracts import BaseEvent
from app.models.audit_log import AuditLog
from app.db.session import SessionLocal

logger = logging.getLogger(__name__)

class AuditProjector:
    """
    Audit Projector: Listens to all events and projects them into the AuditLog table.
    """
    def __init__(self):
        # Subscribe to BaseEvent to catch ALL events
        event_bus.subscribe(BaseEvent, self.handle_event)
        
    def handle_event(self, event: BaseEvent):
        db: Session = SessionLocal()
        try:
            # Check if event already exists (Deduplication)
            existing = db.query(AuditLog).filter(AuditLog.event_id == event.event_id).first()
            if existing:
                logger.info(f"Event {event.event_id} already projected. Ignoring.")
                return
                
            audit_log = AuditLog(
                event_id=event.event_id,
                workspace_id=event.workspace_id,
                organization_id=event.organization_id,
                timestamp=event.timestamp,
                actor=event.actor,
                actor_type=event.actor_type.value,
                module=event.module,
                action=event.action,
                category=event.category.value,
                severity=event.severity.value,
                status=event.status.value,
                resource_type=event.resource_type.value,
                resource_id=event.resource_id,
                metadata_json=event.metadata.model_dump() if event.metadata else {},
                correlation_id=event.correlation_id,
                parent_event_id=event.parent_event_id,
                root_event_id=event.root_event_id,
                duration_ms=event.duration_ms
            )
            
            db.add(audit_log)
            db.commit()
            logger.info(f"Projected event {event.event_id} to AuditLog.")
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to project event {event.event_id}: {str(e)}")
            raise e # Reraise to let EventBus DLQ handle it
        finally:
            db.close()

# Initialize singleton projector
audit_projector = AuditProjector()
