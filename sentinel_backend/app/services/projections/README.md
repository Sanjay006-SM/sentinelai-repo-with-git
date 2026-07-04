# SentinelAI: Service Projections

## Overview

The `services/projections` module contains business-level logic for orchestrating projection updates, acting as the bridge between raw data ingestion and the frontend-optimized `app/projections`.

## Responsibilities

* **Cache Invalidation:** Ensures that when the `IngestionService` or `RiskEngine` updates a core entity, the corresponding read-optimized projection is marked as stale or immediately recalculated.
* **Transformation Orchestration:** Triggers the complex Neo4j to JSON translation pipelines required for the UI components (like `ThreatGraphCanvas`).
