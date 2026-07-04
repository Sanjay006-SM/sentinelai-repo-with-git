# SentinelAI Database Abstraction Layer

## Overview

The `db` module encapsulates all connection logic and session management for the relational (PostgreSQL) component of SentinelAI's hybrid data architecture.

## Responsibilities

* **Connection Pooling:** Manages the SQLAlchemy `Engine` and connection pooling settings for high-concurrency environments.
* **Session Management:** Provides dependency-injectable database sessions (`get_db`) for use within FastAPI route handlers.
* **Transaction Control:** Ensures that database operations are safely committed or rolled back in the event of an application exception.

## Architecture

This module utilizes SQLAlchemy as the primary Object-Relational Mapper (ORM). It strictly separates the session factory from the models to prevent circular dependencies.

* `database.py`: Instantiates the `create_engine` and `sessionmaker` bound to the database URL configured in `app.core.config`.
* `session_maker`: Enforces `autocommit=False` and `autoflush=False` to ensure that transactions are explicitly controlled by the service layer, preventing partial commits during complex heuristic evaluations.
