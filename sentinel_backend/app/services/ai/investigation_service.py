from sqlalchemy.orm import Session
from neo4j import Session as GraphSession
from typing import Dict, Any

from app.services.ai.evidence_collector import EvidenceCollector
from app.services.ai.prompt_builder import PromptBuilder
from app.services.ai.ai_analyst_service import AIAnalystService

class InvestigationService:
    def __init__(self, db: Session, graph: GraphSession):
        self.collector = EvidenceCollector(db, graph)
        self.builder = PromptBuilder()
        self.ai = AIAnalystService()

    def investigate(self, identity_id: str, workspace_id: str, investigation_id: str = None) -> Dict[str, Any]:
        # 1. Collect Evidence
        evidence = self.collector.collect_evidence(identity_id, workspace_id)
        if not evidence or "error" in evidence:
            return evidence or {"error": "Identity not found or no evidence available."}
            
        # 2. Build Prompt
        prompt = self.builder.build_investigation_prompt(evidence)
        
        # 3. Analyze via LLM
        report = self.ai.call_llm(prompt, workspace_id=workspace_id, identity_id=identity_id, investigation_id=investigation_id)
        
        return report
