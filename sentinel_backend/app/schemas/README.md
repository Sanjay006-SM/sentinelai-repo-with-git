# Stage 2: Enterprise Data Normalization Engine

This directory contains the Enterprise Data Normalization Engine, fulfilling **Stage 2** of the SentinelAI intelligence pipeline.

## 1. Problem Solved
Raw telemetry formats (such as AWS CloudTrail JSONs) originate from multiple enterprise security platforms and contain vendor-specific schemas, naming conventions, timestamps, and identifiers. Before analytics can be performed, this data must be cast into a strict, validated schema. 

The Normalization Engine eliminates these differences by transforming vendor-specific data structures into SentinelAI's **Canonical Enterprise Data Model**. This ensures that all downstream components operate on a consistent and standardized representation of enterprise security information, while preventing malformed logs from polluting the database.

## 2. Architecture
The normalization engine relies heavily on Python's **Pydantic** library for strict type enforcement and data validation.
- `CloudTrailEvent`: Standardizes a flat structure for required fields (`eventTime`, `eventName`, `sourceIPAddress`) while accommodating flexible JSON payloads via `Dict[str, Any]` for `requestParameters` and `responseElements`.
- `UserIdentity`: Extracts and normalizes the complex IAM actor structure into simple identifiable strings (`arn`, `type`, `accountId`).

## 3. Execution Pipeline (Parse → Normalize → Enrich → Standardize)
**Pipeline Step 1:** Receive raw JSON output from the Enterprise Data Ingestion Engine (Stage 1).
**Pipeline Step 2:** Parse directly into the `CloudTrailLogFile` schema.
**Pipeline Step 3:** Pydantic automatically validates and normalizes types (e.g., parsing ISO8601 strings into proper `datetime` objects), enriching and standardizing the data into canonical entities.
**Pipeline Step 4:** Any invalid logs raise `ValidationError` and are excluded, protecting data integrity. The canonical entities are then forwarded to the Enterprise Knowledge Graph Builder (Stage 3).

## 4. Major Features
- **Strict Typing**: Enforces the presence of fields critical to security analytics (like `eventID` and `userIdentity`).
- **Flexible Payload Handling**: Non-standard fields (like dynamic request parameters) are safely preserved as un-indexed JSON structures.

## 5. Security & Governance
By strictly typing outputs, the Normalization Engine inherently mitigates injection-style attacks or unhandled null-reference exceptions in downstream processing logic (e.g. Neo4j Cypher construction).
