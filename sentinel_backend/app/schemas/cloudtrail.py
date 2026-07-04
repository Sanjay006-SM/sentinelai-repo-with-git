from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime

class UserIdentity(BaseModel):
    model_config = ConfigDict(extra='ignore')
    
    type: Optional[str] = None
    principalId: Optional[str] = None
    arn: Optional[str] = None
    accountId: Optional[str] = None
    invokedBy: Optional[str] = None

class Resource(BaseModel):
    ARN: Optional[str] = None
    accountId: Optional[str] = None
    type: Optional[str] = None

class CloudTrailEvent(BaseModel):
    model_config = ConfigDict(extra='ignore')
    
    eventVersion: Optional[str] = None
    userIdentity: Optional[UserIdentity] = Field(default_factory=UserIdentity)
    eventTime: datetime
    eventSource: Optional[str] = None
    eventName: Optional[str] = None
    awsRegion: Optional[str] = None
    sourceIPAddress: Optional[str] = None
    userAgent: Optional[str] = None
    errorCode: Optional[str] = None
    errorMessage: Optional[str] = None
    requestParameters: Optional[Dict[str, Any]] = None
    responseElements: Optional[Dict[str, Any]] = None
    eventID: str
    eventType: Optional[str] = "AwsApiCall"
    readOnly: Optional[bool] = None
    resources: Optional[List[Resource]] = Field(default_factory=list)
    recipientAccountId: Optional[str] = None

class CloudTrailLogFile(BaseModel):
    Records: List[CloudTrailEvent]
