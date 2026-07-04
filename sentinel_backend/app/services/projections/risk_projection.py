from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models.risk_finding import RiskFinding

class RiskProjection:
    def __init__(self, db: Session):
        self.db = db

    def get_risk_summary(self, workspace_id: str) -> dict:
        try:
            findings = self.db.query(RiskFinding).filter(
                RiskFinding.workspace_id == workspace_id
            ).all()
        except Exception as e:
            # Fallback for projection failure
            return {
                "critical": 0, "high": 0, "medium": 0, "low": 0, 
                "resolved": 0, "total": 0, "top_findings": []
            }
        
        if not findings:
            return {
                "critical": 0, "high": 0, "medium": 0, "low": 0, 
                "resolved": 0, "total": 0, "top_findings": []
            }
            
        summary = {
            "critical": sum(1 for f in findings if f.severity and f.severity.upper() == "CRITICAL"),
            "high": sum(1 for f in findings if f.severity and f.severity.upper() == "HIGH"),
            "medium": sum(1 for f in findings if f.severity and f.severity.upper() == "MEDIUM"),
            "low": sum(1 for f in findings if f.severity and f.severity.upper() == "LOW"),
            "resolved": 0,
            "total": len(findings)
        }
        
        top_10 = sorted(findings, key=lambda f: (
            {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}.get(f.severity.upper() if f.severity else "", 0)
        ), reverse=True)[:10]
        
        summary["top_findings"] = [
            {
                "id": str(f.id),
                "severity": f.severity or "UNKNOWN",
                "type": f.finding_type or "Unknown Type",
                "description": f.description or "No description provided.",
                "identity": getattr(getattr(f, 'identity', None), 'arn', 'Unknown')
            } for f in top_10
        ]
        
        return summary
