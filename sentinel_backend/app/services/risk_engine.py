from sqlalchemy.orm import Session as DBSession
from neo4j import Session as GraphSession
import logging

from app.models.machine_identity import MachineIdentity
from app.models.risk_score import RiskScore
from app.models.risk_finding import RiskFinding
from app.models.tenant import Workspace
from app.services.risk_factor_calculator import RiskFactorCalculator

from app.core.events.bus import event_bus
from app.core.events.contracts import RiskEvent
from app.core.events.event_types import ActorClassification, EventCategory, EventSeverity, EventStatus, ResourceClassification

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
        score, reasons = self.calculator.calc_privilege_escalation(identity)
        total_score += score
        all_reasons.extend(reasons)
        
        # 2. Sensitive Resource Access (SQL-based)
        score, reasons = self.calculator.calc_sensitive_access(identity)
        total_score += score
        all_reasons.extend(reasons)
        
        # 3. Identity Activity Volume (SQL/Metadata-based)
        score, reasons = self.calculator.calc_activity_volume(identity)
        total_score += score
        all_reasons.extend(reasons)
        
        # 4. Geographic Anomaly (Graph-based)
        score, reasons = self.calculator.calc_geographic_anomaly(identity)
        total_score += score
        all_reasons.extend(reasons)
        
        # 5. Dormant Then Active (SQL/Metadata-based)
        score, reasons = self.calculator.calc_dormant_then_active(identity)
        total_score += score
        all_reasons.extend(reasons)
        
        # 6. Failed API Calls (SQL JSONB-based)
        score, reasons = self.calculator.calc_failed_calls(identity)
        total_score += score
        all_reasons.extend(reasons)
        
        # Enforce bounds (0-100)
        total_score = min(max(total_score, 0), 100)
        
        # Determine Severity
        severity = self.calculate_severity(total_score)
        
        # Clear existing score and findings to ensure 1:1 mapping if not using history tracking
        self.db.query(RiskScore).filter(RiskScore.identity_id == identity.id, RiskScore.workspace_id == identity.workspace_id).delete()
        self.db.query(RiskFinding).filter(RiskFinding.identity_id == identity.id, RiskFinding.workspace_id == identity.workspace_id).delete()
        
        # Insert Risk Findings
        for reason in all_reasons:
            finding = RiskFinding(
                workspace_id=identity.workspace_id,
                identity_id=identity.id,
                finding_type="Risk Analytics",
                severity=severity,
                description=reason
            )
            self.db.add(finding)
        
        # Create new Risk Score record
        risk_record = RiskScore(
            workspace_id=identity.workspace_id,
            identity_id=identity.id,
            score=total_score,
            severity=severity,
            reasons=all_reasons
        )
        self.db.add(risk_record)
        
        identity.risk_score = total_score
        
        self.db.flush()
        
        # Publish Risk Event
        workspace = self.db.query(Workspace).filter(Workspace.id == identity.workspace_id).first()
        org_id = str(workspace.organization_id) if workspace else "SYSTEM"
        
        event_bus.publish(RiskEvent(
            workspace_id=str(identity.workspace_id),
            organization_id=org_id,
            actor="RiskEngine",
            actor_type=ActorClassification.INTERNAL_ENGINE,
            module="RiskEngine",
            action="RISK_CALCULATED",
            category=EventCategory.RISK,
            severity=EventSeverity.CRITICAL if severity == "Critical" else EventSeverity.INFO,
            status=EventStatus.SUCCESS,
            resource_type=ResourceClassification.IDENTITY,
            resource_id=identity.arn,
            metadata={"score": total_score, "severity": severity, "findings_count": len(all_reasons)}
        ))
        
        return risk_record

    def evaluate_all(self):
        logger.info("Starting global risk evaluation...")
        identities = self.db.query(MachineIdentity).all()
        for ident in identities:
            self.evaluate_identity(ident)
        self.db.commit()
        logger.info("Global risk evaluation complete.")

    def evaluate_new_identities(self, identity_arns: list, workspace_id: str) -> int:
        """
        Evaluates risk scores and findings ONLY for newly active identities.
        Returns the total number of risk findings generated.
        """
        logger.info(f"Evaluating risk for {len(identity_arns)} identities in workspace {workspace_id}...")
        findings_count = 0
        for arn in identity_arns:
            ident = self.db.query(MachineIdentity).filter(MachineIdentity.arn == arn, MachineIdentity.workspace_id == workspace_id).first()
            if ident:
                risk_record = self.evaluate_identity(ident)
                findings_count += len(risk_record.reasons)
        self.db.commit()
        logger.info(f"Incremental risk evaluation complete. Findings created: {findings_count}")
        return findings_count
