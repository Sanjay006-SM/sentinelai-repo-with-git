# SentinelAI: Attack Graph Module

## Overview

The `attack-graph` module is a specialized layout and contextual wrapper that integrates the `canvas` components to focus specifically on lateral movement and privilege escalation paths.

## Responsibilities

* **Path Highlighting:** Emphasizes the shortest critical paths an attacker could take to reach high-value targets (e.g., AWS Secrets Manager, Root accounts).
* **Graph Controls:** Provides filtering controls specifically tailored for attack vectors (e.g., filtering out low-risk benign connections to focus solely on high-risk IAM assumptions).
