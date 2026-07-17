from sqlalchemy.orm import Session as DBSession
from neo4j import Session as GraphSession
import logging

from app.models.machine_identity import MachineIdentity
from app.models.risk_score import RiskScore
from app.models.risk_finding import RiskFinding
from app.models.tenant import Workspace
from app.services.legacy.risk_factor_calculator import RiskFactorCalculator
from app.services.risk_engine.path_analyzer import PathAnalyzer
from app.services.risk_engine.vector_calculator import VectorCalculator
from app.schemas.risk_evidence import RiskEvidence, IncidentDetail

from app.core.events.bus import event_bus
from app.core.events.contracts import RiskEvent
from app.core.events.event_types import ActorClassification, EventCategory, EventSeverity, EventStatus, ResourceClassification

logger = logging.getLogger(__name__)

class RiskEngine:
    def __init__(self, db: DBSession, graph: GraphSession):
        self.db = db
        self.graph = graph
        self.legacy_calculator = RiskFactorCalculator(db, graph)
        self.path_analyzer = PathAnalyzer(db, graph)
        self.vector_calculator = VectorCalculator()

    def _calculate_legacy_score(self, identity: MachineIdentity) -> int:
        total_score = 0
        
        score, _ = self.legacy_calculator.calc_privilege_escalation(identity)
        total_score += score
        score, _ = self.legacy_calculator.calc_sensitive_access(identity)
        total_score += score
        score, _ = self.legacy_calculator.calc_activity_volume(identity)
        total_score += score
        score, _ = self.legacy_calculator.calc_geographic_anomaly(identity)
        total_score += score
        score, _ = self.legacy_calculator.calc_dormant_then_active(identity)
        total_score += score
        score, _ = self.legacy_calculator.calc_failed_calls(identity)
        total_score += score
        score, _ = self.legacy_calculator.calc_no_mfa_console_login(identity)
        total_score += score
        score, _ = self.legacy_calculator.calc_cloudtrail_evasion(identity)
        total_score += score
        score, _ = self.legacy_calculator.calc_dangerous_policy(identity)
        total_score += score
        score, _ = self.legacy_calculator.calc_public_ingress(identity)
        total_score += score
        
        return min(max(total_score, 0), 100)

    def evaluate_identity(self, identity: MachineIdentity) -> RiskScore:
        # Calculate legacy score purely for comparison
        legacy_score = self._calculate_legacy_score(identity)
        
        # Phase 1: Attack Path Analysis
        attack_paths = self.path_analyzer.find_attack_paths(identity.arn, str(identity.workspace_id))
        
        # Phase 2: Vector Calculator Score
        score = self.vector_calculator.calculate_score(attack_paths)
        severity = self.vector_calculator.calculate_severity(score)
        
        # Generate incidents
        incidents = []
        if attack_paths:
            incidents.append(
                IncidentDetail(
                    finding_type="Attack Path Discovered",
                    description=f"Found {len(attack_paths)} potential attack paths.",
                    attack_paths=attack_paths
                )
            )
            
        evidence = RiskEvidence(
            score=score,
            severity=severity,
            incidents=incidents
        )
        
        # Clear existing score and findings
        self.db.query(RiskScore).filter(RiskScore.identity_id == identity.id, RiskScore.workspace_id == identity.workspace_id).delete()
        self.db.query(RiskFinding).filter(RiskFinding.identity_id == identity.id, RiskFinding.workspace_id == identity.workspace_id).delete()
        
        # Create legacy-compatible reasons (for backward compatibility of the string array)
        legacy_reasons = [incident.description for incident in evidence.incidents]
        
        # Insert new Risk Findings
        for incident in evidence.incidents:
            finding = RiskFinding(
                workspace_id=identity.workspace_id,
                identity_id=identity.id,
                finding_type=incident.finding_type,
                severity=evidence.severity,
                description=incident.description
            )
            self.db.add(finding)
        
        # Create new Risk Score record with evidence and legacy comparison
        risk_record = RiskScore(
            workspace_id=identity.workspace_id,
            identity_id=identity.id,
            score=evidence.score,
            severity=evidence.severity,
            reasons=legacy_reasons,
            legacy_comparison_score=legacy_score,
            risk_evidence=evidence.model_dump()
        )
        self.db.add(risk_record)
        
        # Update identity summary
        identity.risk_score = evidence.score
        self.db.flush()
        
        # Publish Event
        workspace = self.db.query(Workspace).filter(Workspace.id == identity.workspace_id).first()
        org_id = str(workspace.organization_id) if workspace else "SYSTEM"
        
        event_bus.publish(RiskEvent(
            workspace_id=str(identity.workspace_id),
            organization_id=org_id,
            actor="RiskEngineWorker",
            actor_type=ActorClassification.INTERNAL_ENGINE,
            module="RiskEngine",
            action="RISK_CALCULATED",
            category=EventCategory.RISK,
            severity=EventSeverity.CRITICAL if severity == "Critical" else EventSeverity.INFO,
            status=EventStatus.SUCCESS,
            resource_type=ResourceClassification.IDENTITY,
            resource_id=identity.arn,
            metadata={"score": score, "severity": severity, "legacy_score": legacy_score, "findings_count": len(incidents)}
        ))
        
        return risk_record

    def evaluate_new_identities(self, identity_arns: list, workspace_id: str) -> int:
        findings_count = 0
        for arn in identity_arns:
            ident = self.db.query(MachineIdentity).filter(MachineIdentity.arn == arn, MachineIdentity.workspace_id == workspace_id).first()
            if ident:
                risk_record = self.evaluate_identity(ident)
                # Parse risk_evidence to find number of incidents
                if risk_record.risk_evidence:
                    findings_count += len(risk_record.risk_evidence.get('incidents', []))
        self.db.commit()
        return findings_count
