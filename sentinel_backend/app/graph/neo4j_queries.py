MERGE_IDENTITY = """
MERGE (i:Identity {arn: $arn})
SET i.account_id = $account_id,
    i.type = $identity_type
"""

MERGE_RESOURCE = """
MERGE (r:Resource {arn: $arn})
"""

MERGE_IP = """
MERGE (ip:IPAddress {ip: $ip})
"""

LINK_IDENTITY_RESOURCE = """
MATCH (i:Identity {arn: $identity_arn})
MATCH (r:Resource {arn: $resource_arn})
MERGE (i)-[rel:ACCESSED_RESOURCE]->(r)
ON CREATE SET rel.first_accessed = $event_time, rel.count = 1
ON MATCH SET rel.last_accessed = $event_time, rel.count = rel.count + 1
"""

LINK_IDENTITY_IP = """
MATCH (i:Identity {arn: $identity_arn})
MATCH (ip:IPAddress {ip: $source_ip})
MERGE (i)-[rel:ORIGINATED_FROM]->(ip)
ON CREATE SET rel.first_seen = $event_time, rel.count = 1
ON MATCH SET rel.last_seen = $event_time, rel.count = rel.count + 1
"""

LINK_ASSUME_ROLE = """
MATCH (i:Identity {arn: $source_arn})
MATCH (target {arn: $target_arn})
SET target:Identity
MERGE (i)-[rel:ASSUMED_ROLE]->(target)
ON CREATE SET rel.first_assumed = $event_time, rel.count = 1
ON MATCH SET rel.last_assumed = $event_time, rel.count = rel.count + 1
"""

GET_ATTACK_PATH = """
MATCH path = (start:Identity {arn: $arn})-[*1..3]->(target)
RETURN path
"""
