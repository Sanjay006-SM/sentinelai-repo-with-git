from sqlalchemy.orm import Session as DBSession
from neo4j import Session as GraphSession
from app.models.machine_identity import MachineIdentity
from app.models.access_log import AccessLog
from app.graph.graph_builder import GraphBuilder
import logging

logger = logging.getLogger(__name__)

class GraphSyncService:
    def __init__(self, db: DBSession, graph: GraphSession):
        self.db = db
        self.graph = graph
        self.builder = GraphBuilder(graph)

    def sync_all(self):
        logger.info("Starting graph synchronization...")
        
        # 1. Sync Identities
        identities = self.db.query(MachineIdentity).all()
        for ident in identities:
            self.builder.sync_identity(ident.arn, ident.account_id, ident.identity_type)
            
        # 2. Sync Access Logs
        logs = self.db.query(AccessLog).all()
        for log in logs:
            if log.identity_arn == "unknown":
                continue
                
            event_time_str = log.event_time.isoformat()
                
            if log.source_ip:
                self.builder.sync_ip(log.source_ip)
                self.builder.link_identity_ip(log.identity_arn, log.source_ip, event_time_str)
                
            if log.resource_arn:
                self.builder.sync_resource(log.resource_arn)
                self.builder.link_identity_resource(log.identity_arn, log.resource_arn, event_time_str)
                
            if log.event_name == "AssumeRole" and log.resource_arn:
                self.builder.link_assume_role(log.identity_arn, log.resource_arn, event_time_str)
                
        logger.info("Graph synchronization complete.")
