from sqlalchemy.orm import Session as DBSession
from neo4j import Session as GraphSession
from app.models.machine_identity import MachineIdentity
from app.models.access_log import AccessLog
from app.models.tenant import Workspace
from app.graph.graph_builder import GraphBuilder
import logging

from app.core.events.bus import event_bus
from app.core.events.contracts import GraphEvent
from app.core.events.event_types import ActorClassification, EventCategory, EventSeverity, EventStatus, ResourceClassification


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
            self.builder.sync_identity(ident.arn, ident.account_id, ident.identity_type, str(ident.workspace_id))
            
        # 2. Sync Access Logs
        logs = self.db.query(AccessLog).all()
        for log in logs:
            if log.identity_arn == "unknown":
                continue
                
            event_time_str = log.event_time.isoformat()
                
            if log.source_ip:
                self.builder.sync_ip(log.source_ip, str(log.workspace_id))
                self.builder.link_identity_ip(log.identity_arn, log.source_ip, event_time_str, str(log.workspace_id))
                
            if log.resource_arn:
                self.builder.sync_resource(log.resource_arn, str(log.workspace_id))
                self.builder.link_identity_resource(log.identity_arn, log.resource_arn, event_time_str, str(log.workspace_id))
                
            if log.event_name == "AssumeRole" and log.resource_arn:
                self.builder.link_assume_role(log.identity_arn, log.resource_arn, event_time_str, str(log.workspace_id))
                
        logger.info("Graph synchronization complete.")

    def sync_new_events(self, new_logs: list, workspace_id: str) -> dict:
        """
        Synchronizes ONLY newly inserted access logs to the Neo4j graph, avoiding duplication.
        Returns metrics on nodes and relationships processed.
        """
        logger.info(f"Syncing {len(new_logs)} new access logs to Neo4j...")
        
        unique_arns = {log.identity_arn for log in new_logs if log.identity_arn and log.identity_arn != "unknown"}
        unique_ips = {log.source_ip for log in new_logs if log.source_ip}
        unique_resources = {log.resource_arn for log in new_logs if log.resource_arn}

        # 1. Sync Identities
        for arn in unique_arns:
            ident = self.db.query(MachineIdentity).filter(MachineIdentity.arn == arn, MachineIdentity.workspace_id == workspace_id).first()
            if ident:
                self.builder.sync_identity(ident.arn, ident.account_id, ident.identity_type, workspace_id)
                
        # 2. Sync Access Logs
        relationships_created = 0
        for log in new_logs:
            if not log.identity_arn or log.identity_arn == "unknown":
                continue
                
            event_time_str = log.event_time.isoformat()
                
            if log.source_ip:
                self.builder.sync_ip(log.source_ip, workspace_id)
                self.builder.link_identity_ip(log.identity_arn, log.source_ip, event_time_str, workspace_id)
                relationships_created += 1
                
            if log.resource_arn:
                self.builder.sync_resource(log.resource_arn, workspace_id)
                self.builder.link_identity_resource(log.identity_arn, log.resource_arn, event_time_str, workspace_id)
                relationships_created += 1
                
            if log.event_name == "AssumeRole" and log.resource_arn:
                self.builder.link_assume_role(log.identity_arn, log.resource_arn, event_time_str, workspace_id)
                relationships_created += 1

        nodes_created = len(unique_arns) + len(unique_ips) + len(unique_resources)

        logger.info(f"Neo4j sync complete. Nodes affected: {nodes_created}, Relationships affected: {relationships_created}")
        
        workspace = self.db.query(Workspace).filter(Workspace.id == workspace_id).first()
        org_id = str(workspace.organization_id) if workspace else "SYSTEM"
        
        event_bus.publish(GraphEvent(
            workspace_id=workspace_id,
            organization_id=org_id,
            actor="GraphSyncEngine",
            actor_type=ActorClassification.INTERNAL_ENGINE,
            module="GraphSync",
            action="GRAPH_BUILD_COMPLETED",
            category=EventCategory.GRAPH,
            severity=EventSeverity.INFO,
            status=EventStatus.SUCCESS,
            resource_type=ResourceClassification.SYSTEM,
            metadata={"nodes_created": nodes_created, "relationships_created": relationships_created}
        ))
        
        return {
            "nodes_created": nodes_created,
            "relationships_created": relationships_created
        }
