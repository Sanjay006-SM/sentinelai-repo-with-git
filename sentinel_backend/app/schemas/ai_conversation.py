from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class Message(BaseModel):
    role: str
    content: str

class AIConversationBase(BaseModel):
    title: str
    identity_id: Optional[str] = None
    messages: List[Message] = Field(default_factory=list)

class AIConversationCreate(BaseModel):
    title: str = "New Investigation"
    identity_id: Optional[str] = None
    message: Optional[Message] = None

class AIConversationUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[Message] = None

class AIConversationResponse(AIConversationBase):
    id: str
    workspace_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
