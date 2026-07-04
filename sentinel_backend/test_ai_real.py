from app.db.session import SessionLocal
from app.graph.session import neo4j_manager
from app.services.ai.investigation_service import InvestigationService
from app.models.machine_identity import MachineIdentity

db = SessionLocal()
neo4j_manager.connect()
session = neo4j_manager.get_session()

service = InvestigationService(db, session)
try:
    ident = db.query(MachineIdentity).first()
    if ident:
        print("Testing with identity:", ident.id, "workspace:", ident.workspace_id)
        res = service.investigate(str(ident.id), str(ident.workspace_id))
        print("Result:", res)
    else:
        print("No identities found in DB.")
except Exception as e:
    import traceback
    traceback.print_exc()

session.close()
neo4j_manager.close()
db.close()
