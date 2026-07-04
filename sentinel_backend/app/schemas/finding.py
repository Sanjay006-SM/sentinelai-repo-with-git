from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime
import uuid

class FindingBase(BaseModel):
    id: uuid.UUID
    identity_id: uuid.UUID
    finding_type: str
    severity: str
    description: str
    event_reference: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ExplainabilityDetails(BaseModel):
    # Additive fields from Graph Evidence Engine
    explainability: Optional[str] = None
    confidence: Optional[Dict[str, Any]] = None
    graph_metrics: Optional[Dict[str, Any]] = None
    risk_factors: Optional[List[Dict[str, Any]]] = None
    attack_path: Optional[Dict[str, Any]] = None
    related_entities: Optional[List[Dict[str, Any]]] = None
    related_assets: Optional[List[Dict[str, Any]]] = None
    supporting_evidence: Optional[Dict[str, Any]] = None
    generated_at: Optional[str] = None
    evidence_status: Optional[str] = None
    evidence_truncated: Optional[bool] = None

class FindingDetailsResponse(FindingBase, ExplainabilityDetails):
    # Base finding fields + Additive explainability fields
    pass
