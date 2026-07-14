import json
import logging
import time
from app.services.langgraph.state import WorkflowState
from app.services.ai.evidence_collector import EvidenceCollector
from app.db.session import SessionLocal
from app.graph.session import neo4j_manager
from app.services.langgraph.adapters import adapt_to_risk_evidence
from app.services.prompts.prompt_manager import PromptManager
from app.services.ai.prompt_builder import PromptBuilder
from app.services.ai.ai_analyst_service import AIAnalystService
from app.schemas.ai_response import AIResponse
from pydantic import ValidationError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

logger = logging.getLogger(__name__)

class TransientAIError(Exception):
    pass


def validate_input(state: WorkflowState) -> WorkflowState:
    """
    Validates the initial request parameters (identity_id, workspace_id).
    Raises errors early if the request is malformed.
    """
    state.node_history.append("validate_input")
    if not state.identity_id or not state.workspace_id:
        raise ValueError("Missing required fields: identity_id and workspace_id")
    return state

def retrieve_evidence(state: WorkflowState) -> WorkflowState:
    """
    Retrieves relational, graph, and vector evidence via RAG nodes.
    Populates the state.evidence field.
    """
    state.node_history.append("retrieve_evidence")
    
    start_time = time.time()
    db = SessionLocal()
    graph = neo4j_manager.get_session()
    
    try:
        collector = EvidenceCollector(db, graph)
        raw_evidence = collector.collect_evidence(state.identity_id, state.workspace_id)
        
        if "error" in raw_evidence:
            raise ValueError(f"Evidence collection failed: {raw_evidence['error']}")
            
        risk_evidence = adapt_to_risk_evidence(raw_evidence)
        state.evidence = risk_evidence
        
        duration = time.time() - start_time
        num_items = len(risk_evidence.recent_activity)
        
        logger.info(json.dumps({
            "event": "EVIDENCE_RETRIEVAL_SUCCESS",
            "request_id": state.request_id,
            "identity_id": state.identity_id,
            "workspace_id": state.workspace_id,
            "duration_ms": round(duration * 1000, 2),
            "evidence_items": num_items
        }))
        
        return state
    except Exception as e:
        logger.error(json.dumps({
            "event": "EVIDENCE_RETRIEVAL_FAILED",
            "request_id": state.request_id,
            "identity_id": state.identity_id,
            "workspace_id": state.workspace_id,
            "error": str(e)
        }))
        raise
    finally:
        db.close()
        graph.close()

def _invoke_ai_with_retry(prompt: str, request_id: str, identity_id: str, workspace_id: str) -> dict:
    analyst = AIAnalystService()
    
    # Actually call the underlying service
    result = analyst.call_llm(
        prompt=prompt,
        workspace_id=workspace_id,
        identity_id=identity_id,
        investigation_id=request_id
    )
    
    if not result.get("success"):
        code = result.get("code")
        msg = result.get("message")
        
        # Retry only for transient failures
        if code in ["AI_TIMEOUT", "AI_RATE_LIMITED", "AI_SERVICE_UNAVAILABLE", "UNKNOWN_ERROR"]:
            raise TransientAIError(f"Transient provider failure ({code}): {msg}")
        else:
            # Programmer errors, invalid inputs, auth failed, json parsing (which shouldn't be retried per requirements)
            raise ValueError(f"Non-transient AI failure ({code}): {msg}")
            
    return result

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(TransientAIError),
    reraise=True
)
def _generate_draft_retryable(prompt: str, request_id: str, identity_id: str, workspace_id: str) -> dict:
    return _invoke_ai_with_retry(prompt, request_id, identity_id, workspace_id)

def generate_ai_draft(state: WorkflowState) -> WorkflowState:
    """
    Calls the LLM with the provided evidence to generate an initial draft response.
    Populates the state.ai_draft field.
    """
    state.node_history.append("generate_ai_draft")
    
    if not state.evidence:
        raise ValueError("Cannot generate AI draft: RiskEvidence is missing from state.")
        
    start_time = time.time()
    state.generation_started_at = start_time
    
    try:
        # Load templates (Not injecting them to PromptBuilder since it doesn't accept templates, 
        # but we use PromptManager as instructed and reuse prompt_builder for the base structure)
        manager = PromptManager()
        sys_prompt = manager.get_system_prompt("v1")
        
        # Convert evidence back to dict for the legacy builder
        evidence_dict = state.evidence.model_dump()
        base_prompt = PromptBuilder.build_investigation_prompt(evidence_dict)
        
        # Combine them
        full_prompt = sys_prompt + "\n\n" + base_prompt
        
        # Call AI with tenacity retry
        raw_response = _generate_draft_retryable(
            prompt=full_prompt, 
            request_id=state.request_id,
            identity_id=state.identity_id,
            workspace_id=state.workspace_id
        )
        
        # Validate schema
        try:
            ai_draft = AIResponse(**raw_response)
        except ValidationError as e:
            raise ValueError(f"Schema validation failed: {e}")
            
        state.ai_draft = ai_draft
        state.generation_completed_at = time.time()
        duration_ms = (state.generation_completed_at - start_time) * 1000
        state.latency_ms = duration_ms
        
        state.provider_name = "google"
        state.model_name = "gemini-3.5-flash"
        state.prompt_version = "v1"
        
        logger.info(json.dumps({
            "event": "AI_GENERATION_SUCCESS",
            "request_id": state.request_id,
            "identity_id": state.identity_id,
            "workspace_id": state.workspace_id,
            "execution_time_ms": round(duration_ms, 2),
            "provider_name": state.provider_name,
            "model_name": state.model_name,
            "prompt_version": state.prompt_version,
            "success": True
        }))
        
        return state
        
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        logger.error(json.dumps({
            "event": "AI_GENERATION_FAILED",
            "request_id": state.request_id,
            "identity_id": state.identity_id,
            "workspace_id": state.workspace_id,
            "execution_time_ms": round(duration_ms, 2),
            "provider_name": "google",
            "model_name": "gemini-3.5-flash",
            "prompt_version": "v1",
            "success": False,
            "error": str(e)
        }))
        raise

def extract_claims(state: WorkflowState) -> WorkflowState:
    """
    Parses the ai_draft to extract factual claims requiring verification.
    Populates state.extracted_claims.
    """
    state.node_history.append("extract_claims")
    raise NotImplementedError("Claim extraction logic not yet implemented.")

def verify_claims(state: WorkflowState) -> WorkflowState:
    """
    Cross-references extracted claims against the RiskEvidence to prevent hallucinations.
    Populates state.verification_results.
    """
    state.node_history.append("verify_claims")
    raise NotImplementedError("Claim verification logic not yet implemented.")

def calculate_confidence(state: WorkflowState) -> WorkflowState:
    """
    Computes an overall confidence score based on the verification results.
    Populates state.confidence_score.
    """
    state.node_history.append("calculate_confidence")
    raise NotImplementedError("Confidence calculation logic not yet implemented.")

def attach_citations(state: WorkflowState) -> WorkflowState:
    """
    Generates human-readable citations mapping claims back to specific graph nodes/edges.
    Populates state.citations.
    """
    state.node_history.append("attach_citations")
    raise NotImplementedError("Citation attachment logic not yet implemented.")

def build_verified_response(state: WorkflowState) -> WorkflowState:
    """
    Compiles the final, corrected response into the VerifiedResponse schema.
    Populates state.final_response.
    """
    state.node_history.append("build_verified_response")
    raise NotImplementedError("Verified response building logic not yet implemented.")
