from sqlalchemy.orm import Session as DBSession
from neo4j import Session as GraphSession
import logging

from app.models.machine_identity import MachineIdentity
from app.models.risk_score import RiskScore
from app.models.risk_finding import RiskFinding
from app.services.risk_factor_calculator import RiskFactorCalculator

logger = logging.getLogger(__name__)

class RiskEngine:
    def __init__(self, db: DBSession, graph: GraphSession):
        self.db = db
        self.graph = graph
        self.calculator = RiskFactorCalculator(db, graph)

    def calculate_severity(self, score: int) -> str:
        if score >= 80:
            return "Critical"
        elif score >= 60:
            return "High"
        elif score >= 40:
            return "Medium"
        else:
            return "Low"

    def evaluate_identity(self, identity: MachineIdentity) -> RiskScore:
        total_score = 0
        all_reasons = []
        
        # 1. Privilege Escalation (Graph-based)
        score, reasons = self.calculator.calc_privilege_escalation(identity.arn)
        total_score += score
        all_reasons.extend(reasons)
        
        # 2. Sensitive Resource Access (SQL-based)
        score, reasons = self.calculator.calc_sensitive_access(identity.arn)
        total_score += score
        all_reasons.extend(reasons)
        
        # 3. Identity Activity Volume (SQL/Metadata-based)
        score, reasons = self.calculator.calc_activity_volume(identity)
        total_score += score
        all_reasons.extend(reasons)
        
        # 4. Geographic Anomaly (Graph-based)
        score, reasons = self.calculator.calc_geographic_anomaly(identity.arn)
        total_score += score
        all_reasons.extend(reasons)
        
        # 5. Dormant Then Active (SQL/Metadata-based)
        score, reasons = self.calculator.calc_dormant_then_active(identity)
        total_score += score
        all_reasons.extend(reasons)
        
        # 6. Failed API Calls (SQL JSONB-based)
        score, reasons = self.calculator.calc_failed_calls(identity.arn)
        total_score += score
        all_reasons.extend(reasons)
        
        # Enforce bounds (0-100)
        total_score = min(max(total_score, 0), 100)
        
        # Determine Severity
        severity = self.calculate_severity(total_score)
        
        # Clear existing score and findings to ensure 1:1 mapping if not using history tracking
        self.db.query(RiskScore).filter(RiskScore.identity_id == identity.id).delete()
        self.db.query(RiskFinding).filter(RiskFinding.identity_id == identity.id).delete()
        
        # Insert Risk Findings
        for reason in all_reasons:
            finding = RiskFinding(
                identity_id=identity.id,
                finding_type="Risk Analytics",
                severity=severity,
                description=reason
            )
            self.db.add(finding)
        
        # Create new Risk Score record
        risk_record = RiskScore(
            identity_id=identity.id,
            score=total_score,
            severity=severity,
            reasons=all_reasons
        )
        self.db.add(risk_record)
        
        # Update denormalized cache on Identity
        identity.risk_score = total_score
        
        self.db.flush()
        return risk_record

    def evaluate_all(self):
        logger.info("Starting global risk evaluation...")
        identities = self.db.query(MachineIdentity).all()
        for ident in identities:
            self.evaluate_identity(ident)
        self.db.commit()
        logger.info("Global risk evaluation complete.")
