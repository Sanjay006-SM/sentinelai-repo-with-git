import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.api.dependencies import get_db, get_current_active_user
from app.models.tenant import Organization, Workspace, User
from app.models.base import Base
from app.models.machine_identity import MachineIdentity
import uuid
import uuid
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import JSONB, ARRAY

@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"

@compiles(ARRAY, "sqlite")
def compile_array_sqlite(type_, compiler, **kw):
    return "JSON"
# Setup test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(scope="module")
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Create Tenant A
    org_a = Organization(name="Org A", slug="org-a")
    db.add(org_a)
    db.commit()
    ws_a = Workspace(organization_id=org_a.id, name="Workspace A")
    db.add(ws_a)
    user_a = User(organization_id=org_a.id, full_name="User A", email="usera@example.com", password_hash="hash")
    db.add(user_a)
    db.commit()
    
    # Create Tenant B
    org_b = Organization(name="Org B", slug="org-b")
    db.add(org_b)
    db.commit()
    ws_b = Workspace(organization_id=org_b.id, name="Workspace B")
    db.add(ws_b)
    user_b = User(organization_id=org_b.id, full_name="User B", email="userb@example.com", password_hash="hash")
    db.add(user_b)
    db.commit()
    
    # Create Identity for Tenant A
    ident_a = MachineIdentity(workspace_id=ws_a.id, arn="arn:aws:iam::111:user/A", identity_type="IAMUser", account_id="111")
    db.add(ident_a)
    db.commit()
    
    yield {"user_a": user_a, "user_b": user_b, "ws_a": ws_a, "ws_b": ws_b, "ident_a": ident_a}
    
    Base.metadata.drop_all(bind=engine)

def test_tenant_isolation(setup_database):
    data = setup_database
    
    # Override current user to User B
    app.dependency_overrides[get_current_active_user] = lambda: data["user_b"]
    
    # User B requests identities
    response = client.get(
        "/api/v1/identities", 
        headers={"X-Workspace-ID": str(data["ws_b"].id)}
    )
    assert response.status_code == 200
    identities = response.json()
    
    # User B should NOT see User A's identity
    for ident in identities:
        assert ident["arn"] != "arn:aws:iam::111:user/A"
        
    assert len(identities) == 0 # User B has no identities
    
    # Override current user to User A
    app.dependency_overrides[get_current_active_user] = lambda: data["user_a"]
    
    # User A requests identities
    response = client.get(
        "/api/v1/identities",
        headers={"X-Workspace-ID": str(data["ws_a"].id)}
    )
    assert response.status_code == 200
    identities = response.json()
    
    # User A SHOULD see User A's identity
    assert len(identities) == 1
    assert identities[0]["arn"] == "arn:aws:iam::111:user/A"
