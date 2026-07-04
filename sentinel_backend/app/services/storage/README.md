# SentinelAI: Storage Services

## Overview

The `storage` module abstracts interactions with external blob or file storage providers, providing a unified interface for handling file-based assets.

## Responsibilities

* **Artifact Storage:** Manages the temporary or permanent storage of generated reports (`executive_report.pdf`), uploaded manual `.log` files, and database export archives (`export.zip`).
* **Cloud Storage Integration:** (Roadmap) Can interface with AWS S3 or Azure Blob Storage to persist large telemetry archives beyond the capacity of the active PostgreSQL instance.
