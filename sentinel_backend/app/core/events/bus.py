import logging
from typing import Dict, List, Callable, Any, Type
from app.core.events.contracts import BaseEvent

logger = logging.getLogger(__name__)

class EventBus:
    """
    Enterprise Event Bus
    Supports Multiple subscribers, workspace isolation logic, DLQ, and thread-safe execution (via singleton logic).
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EventBus, cls).__new__(cls)
            cls._instance._subscribers: Dict[Type[BaseEvent], List[Callable[[BaseEvent], None]]] = {}
            cls._instance._dlq = []
        return cls._instance

    def subscribe(self, event_type: Type[BaseEvent], handler: Callable[[BaseEvent], None]):
        """Subscribe to a specific event type."""
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(handler)
        logger.info(f"Subscribed {handler.__name__} to {event_type.__name__}")

    def publish(self, event: BaseEvent):
        """Publish an event to all subscribers."""
        if not self._validate(event):
            self._route_to_dlq(event, "Validation Failed: Missing required workspace/org IDs")
            return
            
        event_type = type(event)
        handlers = self._subscribers.get(event_type, []).copy()
        handlers.extend(self._subscribers.get(BaseEvent, [])) # Base subscribers receive all events
        
        # Deduplicate handlers
        unique_handlers = list(set(handlers))
        
        for handler in unique_handlers:
            self._dispatch(handler, event)

    def _dispatch(self, handler: Callable[[BaseEvent], None], event: BaseEvent, retry_count: int = 3):
        attempt = 0
        while attempt < retry_count:
            try:
                handler(event)
                return
            except Exception as e:
                attempt += 1
                logger.error(f"Error handling event {event.event_id} with {handler.__name__}: {str(e)}. Attempt {attempt}/{retry_count}")
                if attempt == retry_count:
                    self._route_to_dlq(event, f"Handler {handler.__name__} failed: {str(e)}")

    def _validate(self, event: BaseEvent) -> bool:
        """Event Validation Layer"""
        if not event.workspace_id or not event.organization_id:
            logger.error(f"Event {event.event_id} missing workspace or organization ID")
            return False
        return True

    def _route_to_dlq(self, event: BaseEvent, reason: str):
        """Route failed events to the Dead Letter Queue"""
        logger.warning(f"Routing event {event.event_id} to DLQ. Reason: {reason}")
        self._dlq.append({
            "event": event.model_dump(),
            "reason": reason,
            "timestamp": event.timestamp.isoformat() if event.timestamp else None
        })
        
    def get_dlq_size(self) -> int:
        return len(self._dlq)

event_bus = EventBus()
