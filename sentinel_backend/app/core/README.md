# SentinelAI Core Services & Security

## Overview

The `core` module forms the foundational layer of the SentinelAI backend, providing critical cross-cutting concerns including configuration management, cryptographic operations, and foundational security middlewares.

## Responsibilities

* **Configuration Management:** Centralized parsing and validation of environment variables via Pydantic (`settings`).
* **Cryptographic Security:** Secure encryption and decryption of highly sensitive integration credentials (e.g., AWS Secret Keys).
* **Application Bootstrapping:** Houses utilities necessary for the initial startup and configuration of the FastAPI instance.

## Components

### `encryption.py`
Provides bidirectional encryption for storing cloud integration credentials safely at rest. 

* **Mechanism:** Utilizes symmetric Fernet encryption provided by the `cryptography` library.
* **Key Derivation:** Safely hashes the application's master `SECRET_KEY` via SHA-256 to generate the strictly required 32-byte URL-safe base64 key format required by Fernet.
* **Usage:** Encrypts JSON-serialized credential dictionaries before database insertion, and decrypts them instantly during live ingestion syncs.
