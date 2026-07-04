# SentinelAI Data Projections Layer

## Overview

The `projections` module is responsible for transforming and materializing complex relational and graph data into read-optimized structures tailored for specific frontend views.

## Responsibilities

* **Data Denormalization:** Aggregates data from multiple tables (e.g., `RiskScore`, `MachineIdentity`) into flat, UI-ready projections.
* **Graph Synthesis:** Translates complex Neo4j Cypher query results into standardized JSON structures that can be easily rendered by the frontend `ThreatGraphCanvas`.
* **Read-Optimized Access:** Decouples the read access patterns from the write-heavy heuristic evaluation pipeline.

## Architecture

Projections act as the "View" layer in a CQRS-inspired (Command Query Responsibility Segregation) architecture. While the `services` module handles complex state changes and heuristic rules (Commands), the `projections` module handles the highly concurrent read requests (Queries) from the dashboard.
