# SentinelAI – Product Specification
**Platform:** Machine Identity Risk Intelligence Platform

## 1. Product Vision
To provide enterprise security teams with unparalleled, actionable intelligence into the machine identity lifecycle, transforming opaque cloud service accounts, APIs, and IAM roles into trackable, risk-quantified assets. SentinelAI aims to be the definitive control plane for machine identity security, eliminating the blind spots that lead to devastating cloud breaches through behavior-driven analytics.

## 2. Exact Problem Statement
Modern cloud environments operate on the backbone of machine identities (IAM Roles, Service Accounts, and API keys). These identities outnumber human users by magnitudes but suffer from severe visibility deficits. Organizations lack a centralized, context-aware mechanism to discover these identities, track their ownership, understand their effective permissions (especially cross-account and cross-resource), and proactively identify risky behaviors or attack paths before they are exploited. Current IAM and CSPM tools provide static configuration snapshots, missing the dynamic, behavioral risk exposed through actual usage in AWS CloudTrail logs.

## 3. User Personas
- **Cloud Security Analyst (Primary):** Responsible for investigating cloud anomalies, responding to alerts, and hunting for misconfigurations. Needs contextualized, prioritized risk scores to focus efforts and clear attack path visualizations to understand blast radius.
- **IAM Engineer/Architect:** Responsible for designing and maintaining least privilege access. Needs inventory reports, usage analytics to prune unused permissions, and clear visibility into identity sprawl.
- **SOC Analyst:** Needs quick, actionable insights into compromised identities. Relies on the AI Security Analyst feature to rapidly triage alerts and understand the "who, what, and where" of suspicious CloudTrail events.

## 4. User Journey
1. **Onboarding & Ingestion:** The platform connects to the customer's AWS CloudTrail S3 bucket (read-only integration).
2. **Discovery & Normalization:** SentinelAI begins processing historical and continuous logs, identifying unique machine identities and cataloging their behaviors.
3. **Daily Operation:** The Cloud Security Analyst logs into the dashboard, viewing the top prioritized risky machine identities based on recent behavior (e.g., an IAM role suddenly accessing KMS keys it never touched before).
4. **Investigation:** The analyst clicks into a high-risk identity. They view the visual attack path showing how this identity could escalate privileges to admin.
5. **AI Assisted Triage:** The analyst queries the AI Security Analyst: *"Summarize the anomalous behavior of role 'arn:aws:iam::123:role/billing-job' over the last 24 hours."* The AI explains the specific API calls and the risk context.
6. **Remediation Handoff:** The analyst exports the findings or creates an IT ticket containing the exact IAM insights needed to enforce least privilege.

## 5. Functional Requirements
- **FR1 - Log Ingestion:** The system must securely ingest and parse AWS CloudTrail logs from S3 buckets.
- **FR2 - Identity Extraction:** The system must extract distinct machine identities (AssumedRoles, AWS Services) from log events.
- **FR3 - Inventory Management:** The system must maintain a searchable, filterable inventory of discovered identities, tracking first-seen, last-seen, and total event volume.
- **FR4 - Risk Scoring:** The system must apply a heuristic and behavioral risk-scoring model (0-100) to each identity based on permission sensitivity, behavior deviation, and privilege escalation potential.
- **FR5 - Attack Path Visualization:** The system must generate visual graphs mapping relationships between identities, accessed resources, and potential escalation paths derived from usage.
- **FR6 - AI Chat Interface:** The system must provide an LLM-powered chat interface capable of querying the normalized CloudTrail dataset and risk engine to answer natural language security questions.

## 6. Non-Functional Requirements
- **NFR1 - Security & Privacy:** Data must be encrypted at rest (AES-256) and in transit (TLS 1.2+). The platform must enforce strict multi-tenant data isolation.
- **NFR2 - Scalability:** The log ingestion pipeline must handle up to 5,000 CloudTrail events per second per tenant.
- **NFR3 - Latency:** The AI Security Analyst query response time must be under 5 seconds for single-identity context queries.
- **NFR4 - High Availability:** The platform must guarantee 99.9% uptime for the SaaS dashboard.
- **NFR5 - Auditability:** All user actions within SentinelAI (e.g., queries, dashboard views) must be logged for internal auditing.

## 7. MVP Scope
- **Data Source:** AWS CloudTrail log parsing (S3 bucket reading).
- **Feature 1: Machine Identity Discovery:** Automated extraction of AWS IAM Roles and service users from logs.
- **Feature 2: Identity Inventory:** Tabular dashboard of identities with basic filtering (Region, Account ID, Identity Type).
- **Feature 3: Risk Scoring Engine:** Static heuristic scoring based on usage of sensitive AWS APIs (e.g., `sts:AssumeRole`, `iam:PutRolePolicy`, `kms:Decrypt`).
- **Feature 4: Attack Path Analysis:** Static visual graphs showing *Identity -> Assumed Roles -> Sensitive APIs accessed*.
- **Feature 5: AI Security Analyst:** Chatbot capable of summarizing recent activity and explaining risk for a specific identity.

## 8. Future Scope (Post-MVP)
- **Data Sources:** Integration with Azure Activity Logs, GCP Cloud Audit Logs, and Okta.
- **Contextualization:** Integration with AWS Config for resource state evaluation.
- **Remediation:** Automated generation and deployment of least-privilege IAM policies via Infrastructure-as-Code integrations.
- **Governance:** Workflows for identity ownership attestation and lifecycle management.
- **Integrations:** Direct SIEM (Splunk, Microsoft Sentinel) and ITSM (ServiceNow, Jira) native integrations.

## 9. Business Value
- **Risk Reduction:** Drastically reduces the attack surface by identifying over-privileged and orphaned machine identities before they are leveraged in a breach.
- **Operational Efficiency:** Saves IAM and SOC teams hundreds of hours spent manually grepping CloudTrail logs and tracing cross-account role assumptions.
- **Visibility & Control:** Reclaims control over "shadow IAM" and identity sprawl in dynamic, multi-account cloud environments.

## 10. Enterprise Differentiators
- **Behavior-First Approach:** Unlike traditional CSPMs that analyze static IAM configurations, SentinelAI determines *actual* risk based on *actual* usage patterns derived from logs.
- **AI-Driven Investigation:** Purpose-built LLM workflows designed specifically for CloudTrail semantics, acting as a force-multiplier for understaffed SOC teams.
- **Laser Focus on Machine Identities:** Avoiding the noise of human identity management to solve the most explosive and complex cloud security problem today.

## 11. Success Metrics (MVP)
- **Time to Value (TTV):** First identities discovered and scored within 15 minutes of connecting a CloudTrail bucket.
- **Discovery Rate:** Identify 100% of active machine identities generating logs within the observation window.
- **User Engagement:** Security analysts query the AI Analyst an average of 5+ times per active session.
- **Platform Reliability:** 0 dropped CloudTrail events during the ingestion phase.

## 12. Final Feature List (MVP)
1. CloudTrail S3 Ingestion Connector
2. Machine Identity Discovery Parser
3. Identity Inventory Dashboard (Search, Sort, Filter by metadata)
4. Behavioral Risk Scoring Engine (Heuristic-driven API sensitivity)
5. Identity Profile Page (Usage history, API call timelines)
6. Interactive Attack Path Graph (Identity to target resource mapping)
7. AI Security Analyst Chat Assistant (RAG over specific identity data)
8. SentinelAI Tenant RBAC (Admin vs. Read-Only User)
