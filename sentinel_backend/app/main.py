import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.api.v1.api import api_router
from app.graph.session import neo4j_manager
import asyncio
from app.workers.risk_worker import risk_worker
from app.core.redis_client import close_redis_client
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
        
    # [KNOWN DEBT - Stage 4] TEMPORARY local-dev pattern:
    # Before cloud deployment, this must be replaced with a standalone worker
    # process/container with proper crash recovery (heartbeat + handling for jobs 
    # orphaned in "running" state after a restart).
    worker_task = asyncio.create_task(risk_worker())
    logger.info("Risk worker started.")
    yield
    # Shutdown
    try:
        neo4j_manager.close()
    except Exception:
        pass
    
    # Cancel worker
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass
        
    # Close Redis client
    await close_redis_client()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# ── Rate Limiting ────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": "HTTP_ERROR",
                "message": exc.detail,
                "details": []
            }
        },
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid request parameters",
                "details": exc.errors()
            }
        },
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "Internal Server Error",
                "details": []
            }
        },
    )

# ─────────────────────────────────────────────────────────────────────────────
# CORS — Must be added BEFORE any other middleware and BEFORE include_router.
#
# CRITICAL RULES:
#   1. allow_methods=["*"] — do NOT enumerate; "*" is required so the
#      Access-Control-Allow-Methods response header contains all methods,
#      satisfying any preflight regardless of what the browser requests.
#   2. allow_headers=["*"] — do NOT enumerate a partial list.
#      The x-workspace-id header sent by our frontend would be rejected by
#      a browser preflight if it is not in the explicit allow_headers list.
#      Using "*" covers all custom headers automatically.
#   3. allow_credentials=True — required for Authorization header forwarding.
#   4. Never use allow_origins=["*"] when allow_credentials=True — that is
#      an invalid combination per the CORS spec. Always use explicit origins.
# ─────────────────────────────────────────────────────────────────────────────
_ALLOWED_ORIGINS = [
    "https://ai-nexus-2eas.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
    "https://sentinel14.netlify.app",
]

# Support an optional extra origin from environment (e.g. staging deployments)
if settings.FRONTEND_URL:
    _extra = settings.FRONTEND_URL.rstrip("/")
    if _extra not in _ALLOWED_ORIGINS:
        _ALLOWED_ORIGINS.append(_extra)
        logger.info("CORS: added FRONTEND_URL origin → %s", _extra)

logger.info("CORS allowed origins: %s", _ALLOWED_ORIGINS)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],   # Covers GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD
    allow_headers=["*"],   # Covers Authorization, Content-Type, x-workspace-id, etc.
    expose_headers=["*"],
    max_age=600,           # Preflight cache: 10 minutes — reduces OPTIONS round-trips
)

# Routers are included AFTER middleware so CORS wraps all routes
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
