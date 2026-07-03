from sqlalchemy.orm import Session
from app.models.machine_identity import MachineIdentity

class IdentityProjection:
    def __init__(self, db: Session):
        self.db = db

    def get_identity_summary(self, workspace_id: str) -> dict:
        try:
            identities = self.db.query(MachineIdentity).filter(
                MachineIdentity.workspace_id == workspace_id
            ).all()
        except Exception as e:
            return {
                "total_identities": 0, "users": 0, "roles": 0, 
                "service_accounts": 0, "dormant": 0, "privileged": 0, "identities": []
            }
            
        if not identities:
            return {
                "total_identities": 0, "users": 0, "roles": 0, 
                "service_accounts": 0, "dormant": 0, "privileged": 0, "identities": []
            }
            
        return {
            "total_identities": len(identities),
            "users": sum(1 for i in identities if i.identity_type and i.identity_type.lower() == "iamuser"),
            "roles": sum(1 for i in identities if i.identity_type and i.identity_type.lower() == "assumedrole"),
            "service_accounts": sum(1 for i in identities if i.identity_type and i.identity_type.lower() == "awsservice"),
            "dormant": sum(1 for i in identities if getattr(i, 'total_events', 0) == 0),
            "privileged": 0,
            "identities": [
                {
                    "arn": i.arn or "Unknown ARN",
                    "type": i.identity_type or "Unknown",
                    "provider": "AWS",
                    "is_privileged": False
                } for i in identities
            ]
        }
