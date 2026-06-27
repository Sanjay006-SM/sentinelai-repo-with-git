from typing import List, Dict, Any, Optional
from app.schemas.cloudtrail import CloudTrailEvent, CloudTrailLogFile

class CloudTrailParser:
    @staticmethod
    def parse_log_file(json_data: Dict[str, Any]) -> List[CloudTrailEvent]:
        """Parses a complete CloudTrail log file JSON into Pydantic models."""
        log_file = CloudTrailLogFile(**json_data)
        return log_file.Records

    @staticmethod
    def extract_access_log_data(event: CloudTrailEvent) -> Dict[str, Any]:
        """Extracts the specific fields required for the AccessLog model."""
        # Extract resource ARN safely
        resource_arn = None
        if event.resources and len(event.resources) > 0:
            resource_arn = event.resources[0].ARN
            
        return {
            "event_id": event.eventID,
            "event_time": event.eventTime,
            "event_name": event.eventName,
            "event_source": event.eventSource,
            "aws_region": event.awsRegion,
            "source_ip": event.sourceIPAddress,
            "identity_arn": event.userIdentity.arn or "unknown",
            "resource_arn": resource_arn,
            "account_id": event.recipientAccountId,
            "raw_event_json": event.model_dump(mode='json')
        }
