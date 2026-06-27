from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime
import logging

from app.models.machine_identity import MachineIdentity

logger = logging.getLogger(__name__)

class IdentityDiscoveryEngine:
    def __init__(self, db: Session):
        self.db = db

    def discover_identity(self, arn: str, identity_type: str, account_id: str, event_time: datetime) -> MachineIdentity:
        """
        Discovers a machine identity. If it exists, updates last_seen and increments total_events.
        If it does not exist, creates it.
        """
        if not arn or arn == "unknown":
            return None
            
        # CloudTrail identity types mapping to our DB constraint
        normalized_type = "IAMUser"
        if identity_type == "AssumedRole":
            normalized_type = "AssumedRole"
        elif identity_type == "AWSService":
            normalized_type = "AWSService"

        # Look up existing identity
        stmt = select(MachineIdentity).where(MachineIdentity.arn == arn)
        identity = self.db.execute(stmt).scalar_one_or_none()

        if identity:
            # Update existing
            if not identity.first_seen or event_time < identity.first_seen:
                identity.first_seen = event_time
            if not identity.last_seen or event_time > identity.last_seen:
                identity.last_seen = event_time
            
            identity.total_events += 1
        else:
            # Create new
            identity = MachineIdentity(
                arn=arn,
                identity_type=normalized_type,
                account_id=account_id,
                first_seen=event_time,
                last_seen=event_time,
                total_events=1
            )
            self.db.add(identity)
            
        self.db.flush()
        return identity
