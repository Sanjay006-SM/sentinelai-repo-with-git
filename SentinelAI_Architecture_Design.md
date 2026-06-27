# SentinelAI – Architecture Design

## 1. PostgreSQL Database Schema

PostgreSQL serves as the primary relational store for SaaS multi-tenancy, user management, identity inventory metadata (for fast dashboard querying without graph traversal), and ingestion job tracking.

```sql
-- SaaS Tenants
CREATE TABLE tenants (
    tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    aws_account_id VARCHAR(12) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (Security Analysts)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'analyst')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CloudTrail Ingestion Tracking
CREATE TABLE ingestion_jobs (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    s3_bucket_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    events_processed BIGINT DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Machine Identities Inventory
-- Fast, tabular view of identities; complex paths remain in Neo4j
CREATE TABLE machine_identities (
    identity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    arn VARCHAR(512) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('AssumedRole', 'AWSService')),
    account_id VARCHAR(12) NOT NULL,
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    first_seen TIMESTAMP WITH TIME ZONE,
    last_seen TIMESTAMP WITH TIME ZONE,
    total_events BIGINT DEFAULT 0,
    UNIQUE(tenant_id, arn)
);

-- Risk Findings (Anomaly Logs)
CREATE TABLE risk_findings (
    finding_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    identity_id UUID REFERENCES machine_identities(identity_id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL, -- e.g., 'sts:AssumeRole', 'iam:PutRolePolicy'
    event_time TIMESTAMP WITH TIME ZONE NOT NULL,
    severity VARCHAR(50) CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 2. Neo4j Graph Schema

Neo4j is the core engine for Attack Path Analysis. It maps relationships between identities, IP addresses, services, and AWS resources purely based on observed CloudTrail events.

### 4. Graph Nodes
*   **`(:Tenant {id, name})`**: Root node for multi-tenant isolation within the graph.
*   **`(:Identity {arn, account_id, type, risk_score})`**: Represents an IAM Role session or an AWS Service.
*   **`(:Resource {arn, service, type})`**: Represents the target AWS resource (e.g., S3 bucket, KMS key).
*   **`(:IPAddress {ip, is_aws_internal})`**: Represents the source IP of the API call.

### 5. Graph Edges (Relationships)
*   `(:Identity)-[:ASSUMED_ROLE {event_id, event_time}]->(:Identity)`
    *   *Derived from:* `sts:AssumeRole` events. Crucial for tracing lateral movement.
*   `(:IPAddress)-[:ORIGINATED_CALL {event_time, user_agent}]->(:Identity)`
    *   *Derived from:* `sourceIPAddress` field. Links identity usage to specific network origins.
*   `(:Identity)-[:ACCESSED_RESOURCE {event_name, event_time, error_code, read_only}]->(:Resource)`
    *   *Derived from:* Data/Management events (e.g., `s3:GetObject`, `kms:Decrypt`).
*   `(:Tenant)-[:OWNS]->(:Identity)`
    *   *Derived from:* Graph isolation boundary.

### 3. Table Relationships (PostgreSQL to Neo4j)
*   **Synchronization:** PostgreSQL `machine_identities.arn` maps directly to Neo4j `(:Identity {arn})`. 
*   **Workflow:** When the API requests an identity inventory, it queries PostgreSQL for speed and pagination. When the user clicks "View Attack Path," the backend queries Neo4j using the `arn` to traverse `[:ASSUMED_ROLE]` and `[:ACCESSED_RESOURCE]` relationships.

## 6. API Contract Design (FastAPI)

```json
// POST /api/v1/ingestion/start
// Request:
{ "s3_bucket": "my-cloudtrail-logs", "region": "us-east-1" }
// Response:
{ "job_id": "uuid", "status": "pending" }

// GET /api/v1/identities?sort=risk_score&limit=50
// Response:
{
  "data": [
    {
      "arn": "arn:aws:sts::123:assumed-role/billing-job/session",
      "type": "AssumedRole",
      "risk_score": 85,
      "last_seen": "2023-10-27T10:00:00Z"
    }
  ]
}

// GET /api/v1/identities/{arn}/attack-path
// Response (Graph Format for UI visualization like Cytoscape.js/react-flow):
{
  "nodes": [
    { "id": "arn:aws:sts...", "label": "Identity", "properties": {"risk_score": 85} },
    { "id": "arn:aws:s3:::customer-data", "label": "Resource" }
  ],
  "edges": [
    { "source": "arn:aws:sts...", "target": "arn:aws:s3:::customer-data", "type": "ACCESSED_RESOURCE", "properties": {"event_name": "s3:GetObject"} }
  ]
}

// POST /api/v1/ai/query
// Request:
{ "arn": "arn:aws:sts...", "question": "Why is this role considered high risk?" }
// Response:
{
  "answer": "The role 'billing-job' was flagged because it executed 'kms:Decrypt' on a key it has never accessed before, originating from a new IP address.",
  "citations": ["finding_id_123"]
}
```

## 7. Backend Folder Structure

A monolithic, domain-driven structure optimized for FastAPI without overengineering into microservices.

```text
sentinel_backend/
├── app/
│   ├── main.py                    # FastAPI application entry point
│   ├── core/
│   │   ├── config.py              # Environment variables and settings
│   │   ├── security.py            # JWT authentication, RBAC middleware
│   │   └── exceptions.py          # Global exception handlers
│   ├── api/
│   │   └── v1/
│   │       ├── router.py          # API router aggregation
│   │       ├── endpoints/
│   │       │   ├── auth.py
│   │       │   ├── ingestion.py   # Triggers CloudTrail parsing
│   │       │   ├── identities.py  # Inventory and Risk Scoring endpoints
│   │       │   └── ai_analyst.py  # LLM integration endpoints
│   ├── db/
│   │   ├── session.py             # PostgreSQL SQLAlchemy session maker
│   │   └── migrations/            # Alembic migrations
│   ├── graph/
│   │   └── driver.py              # Neo4j aura connection management
│   ├── models/                    # SQLAlchemy ORM Models (PostgreSQL)
│   │   ├── tenant.py
│   │   └── identity.py
│   ├── schemas/                   # Pydantic Models (Validation & API Serialization)
│   │   ├── identity_schema.py
│   │   └── graph_schema.py
│   └── services/                  # Core Business Logic
│       ├── cloudtrail_parser.py   # Extracts entities/relationships from S3 JSON
│       ├── risk_engine.py         # Heuristic scoring based on DB/Graph data
│       ├── graph_builder.py       # Pushes parsed nodes/edges to Neo4j
│       └── llm_service.py         # RAG logic linking DB context to LLM prompts
├── tests/
├── requirements.txt
└── pyproject.toml
```
