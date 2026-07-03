# Stage 7: API Gateway

This directory contains the core routing and integration layer for the backend, fulfilling **Stage 7** of the SentinelAI intelligence pipeline.

## 1. Problem Solved
Complex security intelligence requires a robust, scalable, and clearly segmented API for front-end consumption. The API Gateway organizes various analytical services (Risk Engine, AI Analyst, Graph Traversal) into unified, secure, and authenticated REST endpoints, acting as the secure bridge between the AI logic engines and the Dashboards.

## 2. Architecture
The architecture is built on the high-performance **FastAPI** framework.
- `api.py`: The master API router that aggregates individual domain routers.
- `endpoints/`: A segmented collection of route controllers (e.g., `ai.py`, `dashboard.py`, `identities.py`).

## 3. Execution Pipeline (Authenticate → Route → Secure Response)
**Pipeline Step 1 (Authenticate):** Client initiates an HTTP request. Authentication middlewares ensure all routes strictly validate identity permissions.
**Pipeline Step 2 (Route):** Request reaches `api.py`, which routes traffic to the designated namespace (e.g., `/api/v1/ai`). The domain-specific endpoint validates the request structure using Pydantic dependencies.
**Pipeline Step 3 (Secure Response):** The endpoint queries the necessary backend service (Neo4j, Postgres, or Explainability Engine) and securely returns the serialized response.

## 4. Major Features
- **Modular Namespace Routing**: Distinct prefixes (`/auth`, `/analytics`, `/ai`, `/ingestion`) keep the API surface highly organized.
- **Dependency Injected Sessions**: Passes active database connections safely through the FastAPI dependency system to the underlying intelligence engines.
- **Automated Documentation**: Leverages FastAPI to automatically generate enterprise-standard OpenAPI (Swagger) specifications.

## 5. Security & Governance
- Authentication middlewares ensure all routes strictly validate identity permissions.
- Centralized error handling prevents stack traces or sensitive architecture details from leaking in HTTP responses.
