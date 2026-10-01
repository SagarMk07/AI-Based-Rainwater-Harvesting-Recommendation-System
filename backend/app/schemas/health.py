"""Pydantic schemas for health and system status."""

from typing import Dict, Any, List
from pydantic import BaseModel, Field


class DatabaseStatus(BaseModel):
    connected: bool
    status: str
    provider: str
    message: str


class EnvironmentInfo(BaseModel):
    app_name: str
    app_version: str
    app_env: str
    debug: bool
    python_version: str


class PipelineStatus(BaseModel):
    data_pipeline: str = Field(default="ready", description="Status of the data processing pipeline")
    ml_models: str = Field(default="ready", description="Status of the ML forecasting subsystem")
    calculation_engine: str = Field(default="ready", description="Status of the water calculation engine")
    water_balance: str = Field(default="ready", description="Status of the water balance simulation engine")
    optimization: str = Field(default="ready", description="Status of the tank optimization engine")


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    environment: EnvironmentInfo
    database: DatabaseStatus
    pipelines: PipelineStatus
