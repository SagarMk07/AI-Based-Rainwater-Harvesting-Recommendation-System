"""Main FastAPI application entry point with production security, telemetry, and error handling."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.utils.logger import logger
from backend.app.api.health import router as health_router
from backend.app.api.analysis import router as analysis_router
from backend.app.middleware import ProductionSecurityMiddleware, register_exception_handlers


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events for startup and shutdown."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} [{settings.APP_ENV}]")
    yield
    logger.info(f"Shutting down {settings.APP_NAME}")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Engineering-grade AI Rainwater Harvesting Intelligence & Optimization System API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Sanitize CORS origins for production (Never allow wildcard origins in production)
cors_origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]
if settings.APP_ENV == "production":
    cors_origins = [o for o in cors_origins if o != "*"]
    if not cors_origins:
        cors_origins = ["https://rainharvester.app"]

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Security Headers, Logging, Payload Limit, & Rate Limiting Middleware
app.add_middleware(ProductionSecurityMiddleware)

# Uniform API Exception Handlers (RequestValidationError, StarletteHTTPException)
register_exception_handlers(app)

# Register API Routers
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(analysis_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Metadata"])
async def root():
    """Root endpoint providing service metadata."""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "docs_url": "/docs",
        "health_endpoint": f"{settings.API_V1_STR}/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
