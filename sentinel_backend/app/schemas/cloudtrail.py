from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class UserIdentity(BaseModel):
    type: str
    principalId: Optional[str] = None
    arn: Optional[str] = None
    accountId: Optional[str] = None
    invokedBy: Optional[str] = None

class Resource(BaseModel):
    ARN: Optional[str] = None
    accountId: Optional[str] = None
    type: Optional[str] = None

class CloudTrailEvent(BaseModel):
    eventVersion: str
    userIdentity: UserIdentity
    eventTime: datetime
    eventSource: str
    eventName: str
    awsRegion: str
    sourceIPAddress: str
    userAgent: Optional[str] = None
    errorCode: Optional[str] = None
    errorMessage: Optional[str] = None
    requestParameters: Optional[Dict[str, Any]] = None
    responseElements: Optional[Dict[str, Any]] = None
    eventID: str
    eventType: Optional[str] = "AwsApiCall"
    readOnly: Optional[bool] = None
    resources: Optional[List[Resource]] = []
    recipientAccountId: Optional[str] = None

class CloudTrailLogFile(BaseModel):
    Records: List[CloudTrailEvent]
