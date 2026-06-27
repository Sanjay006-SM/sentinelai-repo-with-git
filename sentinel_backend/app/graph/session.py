from neo4j import GraphDatabase
from app.core.config import settings

class Neo4jSessionManager:
    def __init__(self):
        self._driver = None

    def connect(self):
        if not self._driver:
            self._driver = GraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
            )

    def close(self):
        if self._driver is not None:
            self._driver.close()
            self._driver = None

    def get_session(self):
        if self._driver is None:
            self.connect()
        return self._driver.session()

neo4j_manager = Neo4jSessionManager()
