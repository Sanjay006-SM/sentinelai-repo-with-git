# SentinelAI API Gateway

## Overview

The API Gateway provides the core routing and integration layer for the SentinelAI backend. It organizes various analytical services—such as the Risk Engine, AI Analyst, and Graph Traversal components—into unified, secure, and authenticated REST endpoints, acting as the secure bridge between the backend intelligence engines and the frontend Dashboards.

## Responsibilities

* **Traffic Routing:** Directs incoming HTTP requests to the appropriate domain-specific controllers.
* **Authentication & Authorization:** Validates identity permissions and secures all protected endpoints.
* **Service Integration:** Passes active, dependency-injected sessions to underlying backend services.

## Architecture

The architecture is built on the high-performance FastAPI framework, utilizing a modular namespace structure. This segmentation ensures the API surface remains highly organized, scalable, and easy to maintain as new intelligence capabilities are introduced.

## Workflow

### Request Flow

1. **Authentication:** The client initiates an HTTP request. Authentication middlewares intercept the request to ensure strict validation of identity permissions.
2. **Routing & Validation:** The request reaches the master API router and is directed to the designated namespace. The domain-specific endpoint validates the request structure and payload using declarative schema dependencies.
3. **Execution & Response:** The endpoint queries the necessary backend service (e.g., Neo4j, PostgreSQL, or the Explainability Engine) and securely returns a serialized response to the client.

## Features

* **Modular Namespace Routing:** Distinct prefixes separate concerns across the API surface (e.g., authentication, analytics, artificial intelligence, ingestion).
* **Dependency Injected Sessions:** Database connections and context are safely passed through the dependency injection system directly to the intelligence engines.
* **Automated Documentation:** Enterprise-standard OpenAPI specifications are generated automatically.

## Internal Components

* `api.py`: The master routing application that aggregates individual domain controllers.
* `endpoints/`: A segmented collection of route controllers housing the specific endpoint logic.

## Security Considerations

* **Middleware Enforcement:** Authentication is handled at the middleware layer, guaranteeing that unauthenticated requests cannot reach underlying intelligence engines.
* **Error Sanitization:** Centralized error handling prevents stack traces, internal database schemas, or sensitive architecture details from leaking in HTTP responses.
