from typing import Dict, Any, List

class ConfidenceEngine:
    def compute_confidence(self, evidence: Dict[str, Any], metrics: Dict[str, Any], risk_factors: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Computes a deterministic confidence score (0-100) based on the completeness
        of evidence and graph context.
        """
        score = 50 # Base score
        
        factors_weighted = []
        
        # Attack path presence
        if evidence.get("attack_path", {}).get("found"):
            score += 20
            factors_weighted.append({"factor": "Direct Attack Path", "weight": "+20"})
            
        # Risk factors
        if risk_factors:
            score += 10
            factors_weighted.append({"factor": f"{len(risk_factors)} Risk Factors", "weight": "+10"})
            
        # Assets reachable
        if metrics.get("reachable_critical_assets", 0) > 0:
            score += 10
            factors_weighted.append({"factor": "Critical Assets Reachable", "weight": "+10"})
            
        # Cap at 99 for high confidence
        score = min(score, 99)
        
        return {
            "score": score,
            "model_version": "1.0",
            "factors_weighted": factors_weighted
        }
