# SentinelAI Data Ingestion & Risk Intelligence Engine

## Overview

This module houses the core analytical and orchestration components responsible for continuously evaluating the security posture and behavior of machine identities, such as AWS IAM Roles, Users, and Services. It computes a dynamic risk score between 0 and 100, generating actionable security findings based on behavioral heuristics.

## Responsibilities

* **Telemetry Ingestion:** Continuously collects and parses security telemetry from multiple heterogeneous sources.
* **Risk Evaluation:** Executes context-aware graph analysis to determine how cyber threats could propagate laterally throughout the organization.
* **Score Aggregation:** Aggregates score penalties and securely persists risk findings to the database.

## Architecture

The system utilizes a hybrid data architecture combining relational and graph databases to capture both volume-based anomalies and complex relationships. The architecture strictly separates orchestration logic from heuristic calculation.

* **Data Ingestion Engine:** Acts as the primary entry point into the cybersecurity ecosystem, resolving conflicts natively and packaging validated events.
* **Risk Intelligence Engine:** Serves as the analytical core, assessing assets holistically rather than individually.

## Workflow

### Data Flow

1. **Ingestion & Conflict Resolution:** Raw logs from diverse sources are parsed and safely upserted into the PostgreSQL database, utilizing native conflict resolution (`ON CONFLICT DO NOTHING`) to prevent duplicate events.
2. **Context Loading:** A target machine identity is loaded for evaluation. This process can be triggered globally across all entities or incrementally for active identities during log ingestion.
3. **Hybrid Heuristic Evaluation:** The orchestrator triggers multiple discrete heuristic rules concurrently. Depending on the required access pattern, these rules query either Neo4j or PostgreSQL, returning localized score penalties and descriptive reasoning.
4. **Normalization & Severity Assignment:** Cumulative penalties are aggregated, strictly bounded to a 0-100 range, and assigned a severity classification (Critical, High, Medium, or Low).
5. **Persistence & Integration:** Verified risk intelligence is denormalized and persisted, making the findings immediately available to the downstream AI Decision Intelligence Engine.

## Features

* **Privilege Escalation Detection:** Tracks identity chaining and calculates potential blast radius by traversing assumed roles.
* **Sensitive Resource Access:** Flags interactions with critical infrastructure components such as KMS, IAM, Secrets Manager, and sensitive S3 buckets.
* **Geographic Anomaly Detection:** Detects distributed or anomalous origin IP addresses associated with specific identities.
* **Failed API Call Tracking:** Identifies and aggregates unauthorized operation errors or access denials.
* **Dormant Then Active Detection:** Analyzes the delta between initial and recent activity timestamps to detect potential credential hijacking of abandoned identities.

## Internal Components

* `ingestion.py` (`IngestionService`): Orchestrates the parsing and persistence of raw security telemetry.
* `risk_engine.py` (`RiskEngine`): Manages the context loading and overall risk assessment lifecycle.
* `risk_factor_calculator.py` (`RiskFactorCalculator`): Executes discrete heuristic rules against the hybrid database architecture.
* `app/models/`: Contains the SQLAlchemy declarative models (`MachineIdentity`, `RiskScore`, `RiskFinding`, `AccessLog`).

## Dependencies

* **PostgreSQL:** Handles volume, time-series, and complex JSONB payload analysis.
* **Neo4j:** Manages multi-hop traversals and relationship anomaly detection.

## Technical Highlights

* **Idempotent Evaluations:** The engine ensures idempotent updates by explicitly clearing existing risk scores and findings before recalculation.
* **Strict Constraints:** Score boundaries are enforced at the database level via PostgreSQL check constraints.
* **Workspace Isolation:** Multi-tenant data segregation is strictly enforced via workspace identifier filtering in both Neo4j Cypher parameters and SQLAlchemy where clauses.
* **Traceable Findings:** Human-readable explanations are generated and attached directly to risk scores, providing the deterministic evidence required by the AI layer.
