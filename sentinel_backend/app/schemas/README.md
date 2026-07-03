# SentinelAI Data Normalization Engine

## Overview

The Enterprise Data Normalization Engine serves as the foundational data validation and transformation layer of the SentinelAI intelligence pipeline. It ensures that all downstream analytical components operate on a consistent, standardized representation of enterprise security information.

## Responsibilities

* **Data Transformation:** Converts disparate, vendor-specific telemetry formats into a strict canonical enterprise data model.
* **Validation:** Enforces strict type checking and structural validation to prevent malformed logs from polluting the database or crashing downstream logic.
* **Enrichment:** Extracts and normalizes complex actor structures into simple, identifiable strings.

## Architecture

Raw telemetry formats—such as AWS CloudTrail JSON logs—originate from multiple security platforms and contain varying schemas, naming conventions, and identifiers. The Normalization Engine eliminates these discrepancies utilizing robust data validation libraries to enforce strict type checking and canonical formatting.

## Workflow

### Data Flow

1. **Ingestion:** Raw JSON payloads are received from the upstream ingestion handlers.
2. **Parsing:** The payloads are parsed directly into the standardized log file schema.
3. **Normalization & Enrichment:** Types are automatically validated and normalized (e.g., casting ISO8601 strings into native datetime objects). The data is enriched and standardized into canonical enterprise entities.
4. **Validation Enforcement:** Any invalid logs that fail structural requirements raise validation errors and are safely excluded, preserving data integrity. Validated entities are forwarded to the Enterprise Knowledge Graph Builder.

## Features

* **Strict Type Enforcement:** Guarantees the presence of fields critical to security analytics, such as event identifiers and user identities.
* **Flexible Payload Handling:** Safely preserves non-standard or highly dynamic fields (like request parameters) as un-indexed JSON structures without breaking the strict schema.

## Internal Components

* `CloudTrailEvent`: Standardizes a flat structure for required fields while accommodating flexible JSON payloads for variable elements.
* `UserIdentity`: Extracts and normalizes complex IAM actor structures into canonical identifiers.

## Security Considerations

By strictly typing all outputs and sanitizing inputs, the Normalization Engine inherently mitigates injection-style attacks and prevents unhandled null-reference exceptions in downstream processing logic, such as Neo4j Cypher query construction.
