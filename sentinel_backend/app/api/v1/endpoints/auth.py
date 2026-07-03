from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_active_user
from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token
from app.models.tenant import Organization, User, Workspace
from app.schemas.auth import UserRegister, UserLogin, Token, AuthMeResponse

from app.core.events.bus import event_bus
from app.core.events.contracts import AuditEvent
from app.core.events.event_types import ActorClassification, EventCategory, EventSeverity, EventStatus, ResourceClassification

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    # Check if organization slug exists
    slug = user_in.organization_name.lower().replace(" ", "-")
    org = db.query(Organization).filter(Organization.slug == slug).first()
    if org:
        raise HTTPException(
            status_code=400,
            detail="An organization with this name already exists.",
        )
    
    # Create Organization
    org = Organization(
        name=user_in.organization_name,
        slug=slug
    )
    db.add(org)
    
    try:
        db.flush() # To ensure we can catch unique constraint errors if needed, though uuid is client-side
        # Create Default Workspace
        workspace = Workspace(
            name=user_in.workspace_name,
            environment="Production",
            organization_id=org.id
        )
        db.add(workspace)
        
        # Create User
        user = User(
            email=user_in.email,
            full_name=user_in.full_name,
            password_hash=hash_password(user_in.password),
            organization_id=org.id,
            role="admin",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Transaction failed during account creation")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user.id), secret_key=settings.SECRET_KEY, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user.id), secret_key=settings.SECRET_KEY, expires_delta=access_token_expires
    )
    
    workspace = db.query(Workspace).filter(Workspace.organization_id == user.organization_id).first()
    if workspace:
        event_bus.publish(AuditEvent(
            workspace_id=str(workspace.id),
            organization_id=str(user.organization_id),
            actor=user.email,
            actor_type=ActorClassification.HUMAN_USER,
            module="Authentication",
            action="LOGIN_SUCCESS",
            category=EventCategory.AUTHENTICATION,
            severity=EventSeverity.INFO,
            status=EventStatus.SUCCESS,
            resource_type=ResourceClassification.SYSTEM
        ))
        
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=AuthMeResponse)
def read_user_me(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Fetch organization and workspace
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    workspace = db.query(Workspace).filter(Workspace.organization_id == current_user.organization_id).first()
    
    return {
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "full_name": current_user.full_name,
            "role": current_user.role,
            "organization_id": str(current_user.organization_id)
        },
        "organization": {
            "id": str(org.id),
            "name": org.name,
            "slug": org.slug
        } if org else {},
        "workspace": {
            "id": str(workspace.id),
            "name": workspace.name,
            "environment": workspace.environment
        } if workspace else {}
    }
