# SentinelAI: Explainability & Graph Evidence Engine

## Overview

The `graph_evidence` module serves as the crucial trust layer between the deterministic databases (Neo4j/PostgreSQL) and the AI Decision Intelligence Engine (Gemini 3.5 Flash). It is strictly responsible for preventing AI hallucinations by grounding all generative responses in hard, verifiable evidence.

## Responsibilities

* **Evidence Extraction:** Extracts direct traversal paths, relationships, and localized heuristic anomalies directly from the graph layer.
* **Prompt Grounding:** Serializes the raw deterministic evidence into highly constrained JSON structures to be injected directly into the LLM context window.
* **Explainability Generation:** Ensures that every claim made in the dashboard or PDF report can be traced back to an explicit log event or database constraint.

## Architecture

This module sits logically between `risk_engine.py` (which calculates the risk) and `ai_analyst_service.py` (which interprets it). The explainability service (`explainability_service.py`) guarantees that the AI only acts as a translator of facts, never a generator of assumptions.
