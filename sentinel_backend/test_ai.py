import requests
import json

base_url = "http://127.0.0.1:8000/api/v1"

print("1. Getting identities...")
res = requests.get(f"{base_url}/identities")
if res.status_code != 200:
    print(f"Failed to get identities: {res.text}")
    exit(1)

identities = res.json()
if not identities:
    print("No identities found.")
    exit(1)

top_identity = identities[0]
print(f"Top identity: {top_identity['arn']} (ID: {top_identity['id']})")

print("2. Calling /ai/investigate with ID...")
res_id = requests.post(f"{base_url}/ai/investigate", json={"identity_id": top_identity['id']})
print(f"Status: {res_id.status_code}")
if res_id.status_code == 404:
    print(f"Response: {res_id.text}")

print("3. Calling /ai/investigate with ARN...")
res_arn = requests.post(f"{base_url}/ai/investigate", json={"identity_id": top_identity['arn']})
print(f"Status: {res_arn.status_code}")
if res_arn.status_code != 200:
    print(f"Response: {res_arn.text}")
