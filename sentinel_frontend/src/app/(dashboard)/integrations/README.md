# SentinelAI Integrations Dashboard

## Overview

The Integrations module provides the user interface for connecting SentinelAI to external cloud providers and managing security telemetry ingestion. It allows administrators to configure live data synchronization and monitor connection health.

## Responsibilities

* **Connection Management:** Provides forms and validation for configuring new cloud integrations (e.g., AWS CloudTrail).
* **Credential Handling:** Securely captures and transmits sensitive credentials (Access Keys, Role ARNs) to the backend for encrypted storage.
* **Status Monitoring:** Displays the synchronization status, last sync timestamps, and allows manual triggering of ingestion runs.

## Features

* **AWS CloudTrail Integration:** A dedicated flow for configuring AWS access, supporting both IAM User access keys and cross-account STS Role assumption.
* **Hybrid Ingestion Control:** Offers a centralized view of both automated API-driven integrations and manual data ingestion pathways.
* **Status Indicators:** Real-time visual feedback on connection health, active synchronization state, and potential authentication failures.
