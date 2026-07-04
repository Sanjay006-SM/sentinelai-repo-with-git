import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import boto3
from botocore.exceptions import BotoCoreError, ClientError

from app.services.ingestion_sources.base import IngestionSource

logger = logging.getLogger(__name__)

class AwsCloudTrailSource(IngestionSource):
    """
    Ingestion source for live AWS CloudTrail fetching via API.
    Supports both IAM User (access key) and IAM Role (AssumeRole with optional External ID) authentication.
    """
    def __init__(self, 
                 account_id: str, 
                 region: str, 
                 auth_method: str, 
                 role_arn: Optional[str] = None,
                 external_id: Optional[str] = None,
                 access_key: Optional[str] = None, 
                 secret_key: Optional[str] = None,
                 start_time: Optional[datetime] = None):
        self.account_id = account_id
        self.region = region
        self.auth_method = auth_method
        self.role_arn = role_arn
        self.external_id = external_id
        self.access_key = access_key
        self.secret_key = secret_key
        self.start_time = start_time
        
        self.client = self._create_client()

    def _create_client(self):
        try:
            if self.auth_method == "access_key":
                if not self.access_key or not self.secret_key:
                    raise ValueError("Access Key ID and Secret Access Key must be provided for 'access_key' auth method.")
                return boto3.client(
                    'cloudtrail',
                    region_name=self.region,
                    aws_access_key_id=self.access_key,
                    aws_secret_access_key=self.secret_key
                )
            elif self.auth_method == "role_arn":
                if not self.role_arn:
                    raise ValueError("Role ARN must be provided for 'role_arn' auth method.")
                sts_client = boto3.client('sts', region_name=self.region)
                assume_kwargs = {
                    "RoleArn": self.role_arn,
                    "RoleSessionName": "SentinelAI_CloudTrailSync"
                }
                # Add External ID if provided — prevents confused deputy attacks
                if self.external_id:
                    assume_kwargs["ExternalId"] = self.external_id
                
                assumed_role = sts_client.assume_role(**assume_kwargs)
                credentials = assumed_role['Credentials']
                return boto3.client(
                    'cloudtrail',
                    region_name=self.region,
                    aws_access_key_id=credentials['AccessKeyId'],
                    aws_secret_access_key=credentials['SecretAccessKey'],
                    aws_session_token=credentials['SessionToken']
                )
            else:
                raise ValueError(f"Unsupported auth_method: {self.auth_method}")
        except ClientError as e:
            logger.error(f"Failed to create AWS CloudTrail client: {str(e)}")
            raise ValueError(f"AWS Authentication failed: {str(e)}")

    def fetch_events(self) -> Dict[str, Any]:
        """
        Fetches events from CloudTrail LookupEvents API with pagination.
        Returns a normalized {Records: [...]} structure for the ingestion pipeline.
        """
        records = []
        kwargs: Dict[str, Any] = {}
        if self.start_time:
            kwargs['StartTime'] = self.start_time

        try:
            paginator = self.client.get_paginator('lookup_events')
            for page in paginator.paginate(**kwargs):
                for event in page.get('Events', []):
                    cloudtrail_event_str = event.get('CloudTrailEvent')
                    if cloudtrail_event_str:
                        try:
                            event_data = json.loads(cloudtrail_event_str)
                            records.append(event_data)
                        except json.JSONDecodeError:
                            logger.warning(f"Failed to parse CloudTrailEvent JSON: {cloudtrail_event_str[:100]}")

        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            if error_code == 'ThrottlingException':
                raise ValueError("AWS CloudTrail API is being throttled. Please try again later.")
            raise ValueError(f"AWS API Error during fetch: {str(e)}")
        except Exception as e:
            raise ValueError(f"Unexpected error fetching CloudTrail events: {str(e)}")

        return {"Records": records}

    def get_source_metadata(self) -> Dict[str, Any]:
        return {
            "sourceType": "AwsCloudTrail",
            "identifier": f"{self.account_id}:{self.region}"
        }
