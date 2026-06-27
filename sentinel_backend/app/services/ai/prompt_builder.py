from typing import Dict, Any
import json

class PromptBuilder:
    @staticmethod
    def build_investigation_prompt(evidence: Dict[str, Any]) -> str:
        prompt = """You are SentinelAI, a Principal Cloud Security Architect and SOC Lead.
Analyze the provided evidence for the given machine identity and construct a comprehensive, executive-friendly yet technically precise cybersecurity investigation report.

CRITICAL INSTRUCTIONS:
1. EVIDENCE-BASED REASONING ONLY: Base all findings, assessments, and recommendations strictly on the provided evidence.
2. NO HALLUCINATIONS OR ASSUMPTIONS: Do not assume permissions, actions, or vulnerabilities not explicitly documented in the evidence. If evidence is missing, do not invent details.
3. EVERY FINDING MUST REFERENCE EVIDENCE: Back every claim in the "findings" array with concrete event names, sources, timestamps, or risk scores.
4. ENTERPRISE SOC ANALYST STYLE: Use professional, high-fidelity security terminology, but keep the executive summary friendly for C-level leadership.
5. STRICT JSON OUTPUT: Return ONLY a valid JSON object matching the exact format specified below. Do not include markdown code block formatting (e.g. do not wrap in ```json ... ```) in your raw response, and do not append any text outside the JSON object.

EVIDENCE:
"""
        prompt += json.dumps(evidence, indent=2)
        
        prompt += """

EXPECTED JSON OUTPUT SCHEMA:
{
  "executive_summary": "A concise, C-level executive summary summarizing the identity's overall risk posture and status in 2-3 sentences.",
  "risk_assessment": "A detailed security risk assessment based on the calculated risk score, severity, and specific risk reasons.",
  "attack_path_analysis": "A logical analysis of potential lateral movement, role assumption, or sensitive resource exposure as illustrated by the attack path metadata.",
  "findings": [
    "Technical finding 1 referencing specific events, actions, IPs, or resources",
    "Technical finding 2 referencing specific events, actions, IPs, or resources"
  ],
  "recommendations": [
    "Specific, actionable remediation step 1",
    "Specific, actionable remediation step 2"
  ]
}
"""
        return prompt

