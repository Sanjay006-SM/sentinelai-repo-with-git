from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal, Dict, Any

class AttackPath(BaseModel):
    path_nodes: List[str] = Field(description="Sequence of node ARNs/IDs forming the attack path")
    criticality: Optional[int] = Field(default=None, description="Criticality of the target node, if known")

class IncidentDetail(BaseModel):
    finding_type: str = Field(description="The type of risk finding")
    description: str = Field(description="Description of the risk finding")
    attack_paths: Optional[List[AttackPath]] = Field(default=None)
    metadata: Optional[Dict[str, Any]] = Field(default=None)

class RiskEvidence(BaseModel):
    score: int = Field(ge=0, le=100, description="Overall risk score from 0 to 100")
    severity: Literal["Critical", "High", "Medium", "Low"] = Field(description="Risk severity level")
    incidents: List[IncidentDetail] = Field(default_factory=list, description="Nested incident/path detail")
    
    @field_validator('severity')
    @classmethod
    def validate_severity_bounds(cls, v: str, info) -> str:
        score = info.data.get('score')
        if score is None:
            return v
        
        expected_severity = "Low"
        if score >= 80:
            expected_severity = "Critical"
        elif score >= 60:
            expected_severity = "High"
        elif score >= 40:
            expected_severity = "Medium"
            
        if v != expected_severity:
            raise ValueError(f"Severity '{v}' does not match score {score}. Expected '{expected_severity}'")
        return v
