from typing import Dict, Any, List

class HallucinationValidator:
    def validate(self, explanation: str, evidence: Dict[str, Any]) -> str:
        """
        Cross-checks Gemini output against supplied evidence.
        In this simplified version, we just ensure it doesn't hallucinatively mention 'AWS'
        if it's an Azure environment, etc. But for now, we pass it through.
        """
        if "hallucination" in explanation.lower():
            return "Fallback: We detected a hallucination. The evidence suggests a risk."
        return explanation
