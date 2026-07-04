import json
from typing import Dict, Any, List

class ExplainabilityPromptBuilder:
    def build_prompt(self, evidence: Dict[str, Any], metrics: Dict[str, Any], risk_factors: List[Dict[str, Any]]) -> str:
        """
        Extends Gemini prompts with structured evidence for explanations.
        """
        prompt = f"""
        You are SentinelAI's Graph Explainability Engine.
        Your task is to provide a brief, factual explanation for a security finding based ONLY on the provided graph evidence.
        Do not hallucinate. Do not provide recommendations. Just explain WHY this finding exists.
        
        EVIDENCE:
        Attack Path Found: {evidence.get('attack_path', {}).get('found')}
        Risk Factors: {json.dumps(risk_factors)}
        Metrics: {json.dumps(metrics)}
        
        Provide a concise 2-sentence explanation.
        """
        return prompt
