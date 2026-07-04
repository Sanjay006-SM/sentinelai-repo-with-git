# SentinelAI: Platform Audit Logs

## Overview

The `audit-logs` module provides transparency and compliance tracking for actions performed *within* the SentinelAI platform itself, ensuring the security tool remains accountable.

## Responsibilities

* **Action Tracking:** Logs critical user actions such as generating a report, modifying an AWS CloudTrail integration, or changing a finding's status to Resolved.
* **Immutability:** Interfaces with backend compliance storage to guarantee that internal platform actions cannot be silently altered or deleted.
