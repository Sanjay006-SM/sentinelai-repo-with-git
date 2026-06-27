import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def print_header(title):
    print("\n" + "="*50)
    print(f" {title}")
    print("="*50)

def main():
    print_header("Phase 2 & 3: Upload and Process Dataset")
    
    # 1. Upload the file
    print("Uploading sample_cloudtrail.json...")
    with open("sample_cloudtrail.json", "rb") as f:
        files = {"file": ("sample_cloudtrail.json", f, "application/json")}
        try:
            response = requests.post(f"{BASE_URL}/ingestion/upload", files=files)
            if response.status_code == 200 or response.status_code == 202:
                print(f"[PASS] Upload succeeded: {response.json()}")
            else:
                print(f"[FAIL] Upload failed. Status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"[ERROR] {e}")

    # Give it a moment to process background tasks
    print("Waiting for background ingestion tasks to complete...")
    time.sleep(3)
    
    print_header("Phase 4: Verify PostgreSQL")
    # We will use sqlalchemy directly to verify Postgres
    from app.db.session import SessionLocal
    from app.models import IngestionJob, MachineIdentity, AccessLog, RiskScore, RiskFinding
    
    try:
        db = SessionLocal()
        jobs_count = db.query(IngestionJob).count()
        identities_count = db.query(MachineIdentity).count()
        logs_count = db.query(AccessLog).count()
        scores_count = db.query(RiskScore).count()
        findings_count = db.query(RiskFinding).count()
        
        print(f"IngestionJobs: {jobs_count}")
        print(f"MachineIdentities: {identities_count}")
        print(f"AccessLogs: {logs_count}")
        print(f"RiskScores: {scores_count}")
        print(f"RiskFindings: {findings_count}")
        
        if jobs_count > 0 and identities_count > 0 and logs_count > 0:
            print("[PASS] PostgreSQL data populated.")
        else:
            print("[FAIL] Missing data in PostgreSQL.")
    except Exception as e:
         print(f"[ERROR] Postgres connection/query failed: {e}")

    print_header("Phase 5: Verify Neo4j Graph")
    from app.graph.session import neo4j_manager
    try:
        neo4j_manager.connect()
        session = neo4j_manager.get_session()
        
        query_nodes = "MATCH (n) RETURN labels(n) as label, count(*) as count"
        nodes = session.run(query_nodes)
        print("Nodes:")
        for record in nodes:
            print(f"  {record['label']}: {record['count']}")
            
        query_edges = "MATCH ()-[r]->() RETURN type(r) as type, count(*) as count"
        edges = session.run(query_edges)
        print("Edges:")
        for record in edges:
            print(f"  {record['type']}: {record['count']}")
            
        session.close()
            
        print("[PASS] Neo4j queried successfully.")
    except Exception as e:
        print(f"[ERROR] Neo4j verification failed: {e}")

    print_header("Phase 6: Trigger Risk Engine & Graph Sync")
    try:
        # Assuming RiskEngine.evaluate_all() exists or similar. Let's call the endpoints if they exist.
        # Alternatively, we can just say the background tasks might have triggered them. Let's try to find an identity and hit the attack-path endpoint.
        identities = db.query(MachineIdentity).all()
        if identities:
            identity_id = identities[0].id
            print(f"Using identity_id: {identity_id}")
            
            print_header("Phase 6b: Test Attack Path API")
            resp = requests.get(f"{BASE_URL}/identities/{identity_id}/attack-path")
            if resp.status_code == 200:
                print("[PASS] Attack path API successful.")
                print(f"Data snippet: {str(resp.json())[:150]}...")
            else:
                print(f"[FAIL] Attack path API failed. Status {resp.status_code}: {resp.text}")
                
            print_header("Phase 7: Test AI Investigate")
            payload = {"identity_id": str(identity_id)}
            resp = requests.post(f"{BASE_URL}/ai/investigate", json=payload)
            if resp.status_code == 200:
                print("[PASS] AI Investigate API successful.")
                print(f"Data snippet: {str(resp.json())[:150]}...")
            else:
                print(f"[FAIL] AI Investigate API failed. Status {resp.status_code}: {resp.text}")
        else:
            print("[FAIL] No identities found to test Attack Path & AI.")
            
    except Exception as e:
        print(f"[ERROR] Phase 6/7 failed: {e}")

if __name__ == "__main__":
    main()
