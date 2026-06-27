from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from neo4j import GraphDatabase
import os
import sys

# Setup mock imports for the app
sys.path.append(os.getcwd())

from app.core.config import settings
from app.services.ai.evidence_collector import EvidenceCollector

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

neo4j_driver = GraphDatabase.driver(
    settings.NEO4J_URI,
    auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
)

db = SessionLocal()
graph = neo4j_driver.session()

try:
    collector = EvidenceCollector(db, graph)
    arn = "arn:aws:iam::123456789012:user/developer-1"
    print("Calling with ARN...")
    evidence = collector.collect_evidence(arn)
    print("Success")
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
    graph.close()
