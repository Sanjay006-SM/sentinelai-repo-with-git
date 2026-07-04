import requests

register_data = {
    "email": "test2@example.com",
    "password": "password123",
    "full_name": "Test User",
    "organization_name": "Test Co 2",
    "workspace_name": "Default 2"
}
requests.post('http://127.0.0.1:8000/api/v1/auth/register', json=register_data)

# Login
login_data = {
    "email": "test2@example.com",
    "password": "password123"
}
res = requests.post('http://127.0.0.1:8000/api/v1/auth/login', json=login_data)
if res.status_code != 200:
    print("Login failed:", res.text)
    exit(1)
token = res.json()["access_token"]
print("Got token")

# Get workspace
res = requests.get('http://127.0.0.1:8000/api/v1/organizations/me', headers={"Authorization": f"Bearer {token}"})
workspace_id = res.json()["workspaces"][0]["id"]
print("Got workspace:", workspace_id)

# Upload file
with open('../valid_sample.json', 'rb') as f:
    files = {'file': ('valid_sample.json', f, 'application/json')}
    headers = {
        'Authorization': f'Bearer {token}',
        'X-Workspace-ID': workspace_id
    }
    res = requests.post('http://127.0.0.1:8000/api/v1/ingestion/upload', files=files, headers=headers)
    print("Upload response:", res.status_code, res.text)
