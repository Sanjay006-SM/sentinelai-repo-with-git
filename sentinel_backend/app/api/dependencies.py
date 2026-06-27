from typing import Generator
from app.db.session import SessionLocal
from app.graph.session import neo4j_manager

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_neo4j_session() -> Generator:
    try:
        session = neo4j_manager.get_session()
        yield session
    finally:
        session.close()
