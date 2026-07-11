import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.v1.api import api_router
from app.graph.session import neo4j_manager

# Initialize Enterprise Projections
from app.projections.audit_projector import audit_projector

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup — Neo4j connection is best-effort: if it fails the app still serves
    # HTTP/Postgres routes. Graph routes will return 503 individually.
    try:
        neo4j_manager.connect()
        logger.info("Neo4j connected successfully.")
    except Exception as neo4j_err:
        logger.critical(
            "Neo4j connection failed at startup: %s — "
            "Graph features will be unavailable but the rest of the API is still running.",
            neo4j_err,
        )
    yield
    # Shutdown
    try:
        neo4j_manager.close()
    except Exception:
        pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# ---------------------------------------------------------------
# CORS — explicit origins only, never wildcard with credentials
# ---------------------------------------------------------------
_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://sentinel14.netlify.app",
    "https://ai-nexus-2eas.vercel.app",
]

# Include any extra origin configured via environment variable
if settings.FRONTEND_URL:
    _origin = settings.FRONTEND_URL.rstrip("/")
    if _origin not in _ALLOWED_ORIGINS:
        _ALLOWED_ORIGINS.append(_origin)
        logger.info("CORS: added FRONTEND_URL origin → %s", _origin)

logger.info("CORS allowed origins: %s", _ALLOWED_ORIGINS)

# IMPORTANT: CORSMiddleware must be added FIRST so it fires before every route
app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=True,        # Required for Authorization header to be sent
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
    expose_headers=["Content-Length", "X-Request-ID"],
    max_age=600,                   # Preflight cache: 10 minutes
)

app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
