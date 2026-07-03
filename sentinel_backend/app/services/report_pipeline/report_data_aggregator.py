from sqlalchemy.orm import Session
from app.services.projections.risk_projection import RiskProjection
from app.services.projections.identity_projection import IdentityProjection
from app.services.projections.graph_projection import GraphProjection

class ReportDataAggregator:
    def __init__(self, db: Session):
        self.db = db
        self.risk = RiskProjection(db)
        self.identity = IdentityProjection(db)
        self.graph = GraphProjection()

    def aggregate(self, workspace_id: str) -> dict:
        data = {
            "risk": self.risk.get_risk_summary(workspace_id),
            "identity": self.identity.get_identity_summary(workspace_id),
            "graph": self.graph.get_graph_summary(workspace_id),
        }
        
        # Calculate a high-level executive security score (simple heuristic)
        risk_score = max(0, 100 - (data["risk"]["critical"] * 10) - (data["risk"]["high"] * 5) - (data["risk"]["medium"] * 2))
        data["executive"] = {
            "security_score": risk_score,
            "overall_risk": "HIGH" if risk_score < 60 else "MEDIUM" if risk_score < 85 else "LOW"
        }
        return data
