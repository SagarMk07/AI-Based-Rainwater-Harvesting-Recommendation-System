"""Health check router providing detailed system and database status."""

from datetime import datetime, timezone
import sys
from fastapi import APIRouter
from backend.app.config import settings
from backend.app.database.connection import get_db_status
from backend.app.schemas.health import (
    HealthResponse,
    DatabaseStatus,
    EnvironmentInfo,
    PipelineStatus,
)

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def check_health() -> HealthResponse:
    """System health check endpoint verifying core services and database status."""
    db_info = get_db_status()

    import os
    model_dir = os.path.join(settings.BASE_DIR, settings.MODEL_DIR)
    has_ml = os.path.exists(os.path.join(model_dir, "rainfall_regressor.joblib")) and os.path.exists(os.path.join(model_dir, "rainfall_classifier.joblib"))
    
    return HealthResponse(
        status="ok",
        timestamp=datetime.now(timezone.utc).isoformat(),
        environment=EnvironmentInfo(
            app_name=settings.APP_NAME,
            app_version=settings.APP_VERSION,
            app_env=settings.APP_ENV,
            debug=settings.DEBUG,
            python_version=sys.version.split()[0],
        ),
        database=DatabaseStatus(
            connected=db_info["connected"],
            status=db_info["status"],
            provider=db_info["provider"],
            message=db_info["message"],
        ),
        pipelines=PipelineStatus(
            data_pipeline="ready" if os.path.exists(os.path.join(settings.BASE_DIR, "data", "processed", "rainfall_climate_dataset.csv")) else "initialized",
            ml_models="active" if has_ml else "standby",
            calculation_engine="active",
            water_balance="active",
            optimization="active",
        ),
    )

