import requests

register_data = {
    "email": "testreport4@example.com",
    "password": "Password123456",
    "full_name": "Test User",
    "organization_name": "Test Co 4",
    "workspace_name": "Default 4"
}
res_reg = requests.post('http://127.0.0.1:8000/api/v1/auth/register', json=register_data)
if res_reg.status_code != 201 and res_reg.status_code != 400:
    print("Register failed:", res_reg.text)
    exit(1)

login_data = {
    "email": "testreport4@example.com",
    "password": "Password123456"
}
res = requests.post('http://127.0.0.1:8000/api/v1/auth/login', json=login_data)
if res.status_code != 200:
    print("Login failed:", res.text)
    exit(1)
token = res.json()["access_token"]
print("Got token")

res = requests.get('http://127.0.0.1:8000/api/v1/organizations/me', headers={"Authorization": f"Bearer {token}"})
workspace_id = res.json()["workspace"]["id"]
print("Got workspace:", workspace_id)

payload = {
    "name": "Test Report",
    "report_type": "executive",
    "filters": {}
}
headers = {
    'Authorization': f'Bearer {token}',
    'X-Workspace-ID': workspace_id
}
print("Sending POST request to generate report...")
res = requests.post('http://127.0.0.1:8000/api/v1/reports/generate', json=payload, headers=headers)
print("Status Code:", res.status_code)
print("Response:", res.text)
