from neo4j import Session
from typing import Dict, Any, List
from app.graph import neo4j_queries as q

class AttackPathService:
    def __init__(self, session: Session):
        self.session = session

    def get_attack_path(self, arn: str) -> Dict[str, Any]:
        result = self.session.run(q.GET_ATTACK_PATH, arn=arn)
        
        nodes_dict = {}
        edges_list = []
        edge_ids = set()
        
        for record in result:
            path = record["path"]
            
            for node in path.nodes:
                node_id = str(node.element_id)
                if node_id not in nodes_dict:
                    labels = list(node.labels)
                    label = labels[0] if labels else "Unknown"
                    
                    data = dict(node.items())
                    if label in ("Identity", "Resource"):
                        name = data.get("arn", "")
                    elif label == "IPAddress":
                        name = data.get("ip", "")
                    else:
                        name = "Unknown"
                        
                    nodes_dict[node_id] = {
                        "id": node_id,
                        "type": "customNode",
                        "data": {
                            "label": label,
                            "name": name,
                            "properties": data
                        },
                        "position": {"x": 0, "y": 0}
                    }
                    
            for rel in path.relationships:
                rel_id = str(rel.element_id)
                if rel_id not in edge_ids:
                    edge_ids.add(rel_id)
                    edges_list.append({
                        "id": rel_id,
                        "source": str(rel.start_node.element_id),
                        "target": str(rel.end_node.element_id),
                        "label": rel.type,
                        "type": "smoothstep",
                        "animated": True
                    })
                    
        return {
            "nodes": list(nodes_dict.values()),
            "edges": edges_list
        }
