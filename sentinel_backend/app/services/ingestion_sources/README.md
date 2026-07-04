# SentinelAI Hybrid Ingestion Platform

## Overview

The `ingestion_sources` module provides a flexible, extensible architecture for collecting security telemetry from diverse environments. It supports both automated live synchronization from cloud providers and manual fallback methods, ensuring continuous visibility regardless of network constraints.

## Architecture

This module implements a standard Abstract Base Class (ABC) pattern, enforcing a consistent contract for all data retrieval strategies. This ensures that the downstream Data Ingestion Engine can process logs uniformly, irrespective of their origin.

* **Hybrid Ingestion Platform:** Supports pull-based API polling (e.g., AWS Boto3) and push-based manual file uploads (e.g., offline JSON).
* **Credential Handling:** Securely assumes IAM roles or utilizes encrypted access keys fetched via the `encryption.py` utility.

## Supported Sources

1. **AWS CloudTrail (`AwsCloudTrailSource`):** 
   * Connects directly to the AWS API (`boto3`) to poll for `lookup_events`.
   * Supports both `access_key` authentication and STS `role_arn` assumption.
   * Handles AWS API pagination and graceful degradation on throttling (`ThrottlingException`).

2. **Manual File Upload (`FileUploadSource`):**
   * Processes offline `.json` or `.log` files provided directly by the user.
   * Essential for air-gapped environments or retroactive historical analysis.

## Workflow

1. **Initialization:** The application instantiates a specific `IngestionSource` strategy based on the active integration configuration stored in the database.
2. **Execution:** The `fetch_events()` interface is invoked to retrieve raw logs.
3. **Normalization:** The source returns a standardized dictionary payload mimicking a raw log batch, ready for parsing by the primary `IngestionService`.
