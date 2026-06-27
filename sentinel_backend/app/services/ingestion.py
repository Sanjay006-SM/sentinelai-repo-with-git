from sqlalchemy.orm import Session
from typing import Dict, Any
from pydantic import ValidationError
import logging

from app.services.cloudtrail_parser import CloudTrailParser
from app.services.identity_discovery import IdentityDiscoveryEngine
from app.models.access_log import AccessLog

logger = logging.getLogger(__name__)

class IngestionService:
    def __init__(self, db: Session):
        self.db = db
        self.discovery_engine = IdentityDiscoveryEngine(db)

    def process_cloudtrail_json(self, json_data: Dict[str, Any], job_id: str = None) -> Dict[str, Any]:
        """
        Main pipeline for processing CloudTrail JSON logs.
        Returns processing statistics.
        """
        stats = {
            "total_events": 0,
            "identities_discovered": 0,
            "access_logs_created": 0,
            "errors": 0
        }

        try:
            events = CloudTrailParser.parse_log_file(json_data)
        except ValidationError as e:
            logger.error(f"Failed to parse CloudTrail log file: {e}")
            stats["errors"] += 1
            return stats

        stats["total_events"] = len(events)
        
        # Track unique identities updated in this batch for stats
        unique_arns = set()

        for event in events:
            try:
                # 1. Parse and extract AccessLog data
                access_log_data = CloudTrailParser.extract_access_log_data(event)
                
                identity_type = event.userIdentity.type
                arn = access_log_data["identity_arn"]
                
                # 2. Discover/Update Identity
                identity = self.discovery_engine.discover_identity(
                    arn=arn,
                    identity_type=identity_type,
                    account_id=access_log_data["account_id"],
                    event_time=access_log_data["event_time"]
                )
                
                if identity and arn not in unique_arns:
                    unique_arns.add(arn)
                    stats["identities_discovered"] += 1

                # 3. Create AccessLog record
                access_log = AccessLog(**access_log_data)
                self.db.add(access_log)
                stats["access_logs_created"] += 1
                
            except Exception as e:
                logger.error(f"Error processing event {event.eventID}: {e}")
                stats["errors"] += 1

        self.db.commit()
        return stats
