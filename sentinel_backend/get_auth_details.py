import os
import sys
from datetime import datetime, timedelta
import jwt

sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.tenant import User, Workspace
from app.core.config import settings

def main():
    db = SessionLocal()
    
    user = db.query(User).first()
    workspace = db.query(Workspace).first()
    
    if not user or not workspace:
        print("NO_DATA_FOUND: Please create a user and workspace in the UI first.")
        return
        
    payload = {
        "sub": str(user.id),
        "exp": datetime.utcnow() + timedelta(days=30)
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    
    print(f"IP_ADDRESS_HINT: Use http://127.0.0.1:10000 if Wazuh is local, or your machine's IP.")
    print(f"WORKSPACE_ID={workspace.id}")
    print(f"TOKEN={token}")

if __name__ == "__main__":
    main()
