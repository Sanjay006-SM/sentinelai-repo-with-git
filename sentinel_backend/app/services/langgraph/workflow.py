from langgraph.graph import StateGraph, END
from app.services.langgraph.state import WorkflowState
from app.services.langgraph.nodes import (
    validate_input,
    retrieve_evidence,
    generate_ai_draft,
    extract_claims,
    verify_claims,
    calculate_confidence,
    attach_citations,
    build_verified_response
)

def create_workflow() -> StateGraph:
    """
    Defines the structural execution graph for the Member 3 AI intelligence layer.
    """
    workflow = StateGraph(WorkflowState)
    
    # Add nodes
    workflow.add_node("validate_input", validate_input)
    workflow.add_node("retrieve_evidence", retrieve_evidence)
    workflow.add_node("generate_ai_draft", generate_ai_draft)
    workflow.add_node("extract_claims", extract_claims)
    workflow.add_node("verify_claims", verify_claims)
    workflow.add_node("calculate_confidence", calculate_confidence)
    workflow.add_node("attach_citations", attach_citations)
    workflow.add_node("build_verified_response", build_verified_response)
    
    # Define execution edges (linear pipeline for now)
    workflow.set_entry_point("validate_input")
    workflow.add_edge("validate_input", "retrieve_evidence")
    workflow.add_edge("retrieve_evidence", "generate_ai_draft")
    workflow.add_edge("generate_ai_draft", "extract_claims")
    workflow.add_edge("extract_claims", "verify_claims")
    workflow.add_edge("verify_claims", "calculate_confidence")
    workflow.add_edge("calculate_confidence", "attach_citations")
    workflow.add_edge("attach_citations", "build_verified_response")
    workflow.add_edge("build_verified_response", END)
    
    return workflow.compile()
