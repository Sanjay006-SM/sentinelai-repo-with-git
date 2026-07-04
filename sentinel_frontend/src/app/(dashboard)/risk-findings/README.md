# SentinelAI: Risk Findings Dashboard

## Overview

The `risk-findings` module provides a consolidated view of all heuristic anomalies and security violations detected by the backend Risk Intelligence Engine. 

## Responsibilities

* **Data Aggregation:** Displays a paginated, filterable grid of all `RiskFinding` records.
* **Triage Workflow:** Allows analysts to review the deterministic evidence (JSON payloads, Cypher traversal paths) attached to each finding, update statuses (e.g., Acknowledged, Resolved), and assign severity levels.
* **Contextual Linking:** Provides direct deep-links from a specific finding into the `ai-investigation` copilot or the `canvas` threat graph for deeper context.
