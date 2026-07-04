from .base_collector import BaseCollector
from typing import Dict, Any

class AttackPathCollector(BaseCollector):
    def collect(self, finding_id: str, workspace_id: str, identity_id: str) -> Dict[str, Any]:
        query = """
        MATCH p=shortestPath((i:Identity {id: $id, workspace_id: $wid})-[*1..5]->(r:Resource {is_critical: true}))
        RETURN nodes(p) as path_nodes, relationships(p) as path_rels
        LIMIT 1
        """
        res = self.graph.run(query, id=identity_id, wid=workspace_id).data()
        if res:
            return {"attack_path": {"nodes": len(res[0].get("path_nodes", [])), "found": True}}
        return {"attack_path": {"found": False}}

class IdentityCollector(BaseCollector):
    def collect(self, finding_id: str, workspace_id: str, identity_id: str) -> Dict[str, Any]:
        query = "MATCH (i:Identity {id: $id, workspace_id: $wid}) RETURN i"
        res = self.graph.run(query, id=identity_id, wid=workspace_id).data()
        identity = res[0]["i"] if res else {}
        return {"identity": dict(identity)}

class ResourceCollector(BaseCollector):
    def collect(self, finding_id: str, workspace_id: str, identity_id: str) -> Dict[str, Any]:
        query = "MATCH (i:Identity {id: $id})-->(r:Resource) RETURN collect(r) as resources LIMIT 5"
        res = self.graph.run(query, id=identity_id).data()
        resources = res[0]["resources"] if res else []
        return {"related_assets": [dict(r) for r in resources]}

class PolicyCollector(BaseCollector):
    def collect(self, finding_id: str, workspace_id: str, identity_id: str) -> Dict[str, Any]:
        return {"policies": []}

class CloudTrailCollector(BaseCollector):
    def collect(self, finding_id: str, workspace_id: str, identity_id: str) -> Dict[str, Any]:
        return {"recent_events": []}

class RelationshipCollector(BaseCollector):
    def collect(self, finding_id: str, workspace_id: str, identity_id: str) -> Dict[str, Any]:
        return {"related_entities": []}

class GraphMetricsCollector(BaseCollector):
    def collect(self, finding_id: str, workspace_id: str, identity_id: str) -> Dict[str, Any]:
        return {"metrics_collected": True}
