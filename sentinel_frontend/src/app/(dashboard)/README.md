# Stage 8: Dashboards & AI Assistant

This directory contains the primary visualization layer, fulfilling **Stage 8** of the SentinelAI intelligence pipeline.

## 1. Problem Solved
Actionable cybersecurity intelligence is useless if it cannot be interpreted. This application translates raw database rows, JSON findings, and multi-hop graph structures into an intuitive, responsive, and real-time visualization suite. It empowers SOC analysts and executives to visualize, explain, and support decision making natively within the enterprise workflow.

## 2. Architecture
The frontend is built on **Next.js (App Router)** in TypeScript, utilizing a modern component-driven architecture.
- Modular routing directories: `(dashboard)` contains all authenticated application routes natively segmented.
- Individual feature folders (e.g., `ai-investigation`, `attack-graph`, `risk-findings`) isolate component logic, data fetching, and state management.

## 3. Execution Pipeline (Visualize → Explain → Support Decision Making)
**Pipeline Step 1:** User accesses an authenticated dashboard route.
**Pipeline Step 2 (Visualize):** The page layout initializes and fetches normalized intelligence data from the Stage 7 API Gateway. Complex data structures are visually rendered (e.g., Neo4j relationships are parsed into an interactive node map in `/attack-graph`).
**Pipeline Step 3 (Explain):** LLM recommendations are streamed and formatted into an executive-friendly UI in `/ai-investigation`, leveraging the backend's Explainability Engine.
**Pipeline Step 4 (Support Decision Making):** By combining visual node graphs with conversational AI assistance, SOC analysts are empowered to make immediate, supported security decisions.

## 4. Major Features
- **AI Investigation Dashboard**: An interactive chat and reporting interface directly integrated with the Gemini 2.5 Flash analyst.
- **Attack Graph Visualization**: A highly interactive canvas allowing security engineers to visually explore the "Blast Radius" of a compromised identity.
- **Risk Findings Console**: A structured feed of the Risk Engine's output, rendering discrete heuristic alerts.
- **CloudTrail & Audit Logs**: Fast, paginated data tables for traditional manual log investigation.

## 5. Performance & Scalability
- Leverages Next.js Server Components to shift heavy data-fetching logic to the server, dramatically decreasing client-side bundle size.
- Pre-compiles layout structures and CSS (Tailwind/globals.css) ensuring near-instant page transitions within the dashboard ecosystem.
