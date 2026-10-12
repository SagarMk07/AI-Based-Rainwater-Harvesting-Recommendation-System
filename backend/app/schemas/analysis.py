"""Pydantic schemas for Rainwater Harvesting Analysis and Optimization API."""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator
from backend.app.calculations.runoff import RoofType
from backend.app.calculations.recharge import SoilType
from backend.app.recommendations.recommender import SystemRecommendation
from backend.app.calculations.water_balance import WaterBalanceResult
from backend.app.optimization.storage_optimizer import CandidateEvaluation, OptimizationSummary
from backend.app.services.weather import CityRainfallProfile
from backend.app.recommendations.explainer import ExplainabilityResponse


class AnalysisRequest(BaseModel):
    # Location & Climate
    city: str = Field(default="Bengaluru", min_length=1, max_length=120, description="City or region name")
    latitude: Optional[float] = Field(default=None, ge=-90.0, le=90.0, description="Catchment latitude coordinate")
    longitude: Optional[float] = Field(default=None, ge=-180.0, le=180.0, description="Catchment longitude coordinate")
    annual_rainfall_mm: Optional[float] = Field(default=None, ge=0.0, le=15000.0, description="Manual annual rainfall override (0 to 15,000 mm)")
    monthly_rainfall_mm: Optional[List[float]] = Field(default=None, description="Optional 12 monthly rainfall overrides (mm)")

    # Catchment Property
    roof_area_sqm: float = Field(..., gt=0.0, le=1000000.0, description="Rooftop catchment area in m² (must be > 0 and <= 1,000,000)")
    roof_type: str = Field(default="rcc", description="Roof material (rcc, metal_sheet, clay_tiles, asbestos, paved_tiles)")

    # Water Usage
    occupants: int = Field(default=4, ge=1, le=10000, description="Number of building occupants (1 to 10,000)")
    daily_demand_litres: Optional[float] = Field(default=None, gt=0.0, le=5000000.0, description="Direct total daily water demand in litres (> 0)")

    # Ground & Soil
    soil_type: str = Field(default="loamy", description="Soil infiltration category (sandy, loamy, silty, clay, rocky)")
    open_area_sqm: float = Field(default=40.0, ge=0.0, le=1000000.0, description="Available unpaved open ground space for recharge in m²")
    has_existing_borewell: bool = Field(default=False, description="Whether a functional or dry borewell exists on-site")

    # Financial & Engineering
    budget_inr: Optional[float] = Field(default=None, ge=0.0, le=1000000000.0, description="Maximum capital budget in INR")
    filter_efficiency: float = Field(default=0.90, ge=0.5, le=1.0, description="Filtration & first-flush conveyance efficiency (0.50 to 1.00)")

    @field_validator("monthly_rainfall_mm")
    @classmethod
    def validate_monthly_rain(cls, v: Optional[List[float]]) -> Optional[List[float]]:
        if v is not None:
            if len(v) != 12:
                raise ValueError(f"Expected exactly 12 monthly rainfall figures, received {len(v)}.")
            for val in v:
                if val < 0.0 or val > 5000.0:
                    raise ValueError(f"Monthly rainfall must be between 0.0 and 5000.0 mm; got {val}.")
        return v


class QuickRunoffRequest(BaseModel):
    roof_area_sqm: float = Field(..., gt=0.0, le=1000000.0, description="Roof area in m²")
    rainfall_mm: float = Field(..., ge=0.0, le=15000.0, description="Rainfall depth in mm")
    roof_type: str = Field(default="rcc", description="Roof material")
    filter_efficiency: float = Field(default=0.90, ge=0.5, le=1.0, description="Filter efficiency")


class QuickRunoffResponse(BaseModel):
    roof_area_sqm: float
    rainfall_mm: float
    roof_type: str
    runoff_coefficient: float
    gross_harvest_litres: float
    collectable_water_litres: float
    formula_used: str


class WaterCalculateRequest(BaseModel):
    roof_area_sqm: float = Field(..., gt=0.0, le=1000000.0, description="Rooftop area in m²")
    rainfall_mm: float = Field(..., ge=0.0, le=15000.0, description="Annual or total rainfall depth in mm")
    roof_type: str = Field(default="rcc", description="Roof material: rcc, metal_sheet, clay_tiles, etc.")
    occupants: int = Field(default=4, ge=1, le=10000, description="Number of occupants")
    daily_demand_litres: Optional[float] = Field(default=None, gt=0.0, le=5000000.0, description="Direct daily water requirement")
    filter_efficiency: float = Field(default=0.90, ge=0.5, le=1.0, description="Conveyance / filter efficiency")


class WaterCalculateResponse(BaseModel):
    roof_area_sqm: float
    rainfall_mm: float
    roof_type: str
    runoff_coefficient: float
    filter_efficiency: float
    gross_harvest_litres: float
    collectable_water_litres: float
    daily_demand_litres: float
    annual_demand_litres: float
    potential_freshwater_replacement_litres: float
    theoretical_savings_percentage: float
    formulas_used: Dict[str, str]


class WaterBalanceSimulateRequest(BaseModel):
    monthly_rainfall_mm: List[float] = Field(..., description="12 monthly rainfall values in mm")
    roof_area_sqm: float = Field(..., gt=0.0, le=1000000.0)
    roof_type: str = Field(default="rcc")
    tank_capacity_litres: float = Field(default=5000.0, gt=0.0, le=50000000.0)
    daily_demand_litres: float = Field(default=600.0, gt=0.0, le=5000000.0)
    filter_efficiency: float = Field(default=0.90, ge=0.5, le=1.0)

    @field_validator("monthly_rainfall_mm")
    @classmethod
    def validate_12_months(cls, v: List[float]) -> List[float]:
        if len(v) != 12:
            raise ValueError(f"Expected exactly 12 monthly rainfall values, received {len(v)}.")
        for val in v:
            if val < 0.0:
                raise ValueError("Monthly rainfall values cannot be negative.")
        return v


class TankOptimizeRequest(BaseModel):
    monthly_rainfall_mm: List[float] = Field(..., description="12 monthly rainfall values in mm")
    roof_area_sqm: float = Field(..., gt=0.0, le=1000000.0)
    roof_type: str = Field(default="rcc")
    daily_demand_litres: float = Field(default=600.0, gt=0.0, le=5000000.0)
    budget_inr: Optional[float] = Field(default=None, ge=0.0, le=1000000000.0)
    filter_efficiency: float = Field(default=0.90, ge=0.5, le=1.0)

    @field_validator("monthly_rainfall_mm")
    @classmethod
    def validate_12_months(cls, v: List[float]) -> List[float]:
        if len(v) != 12:
            raise ValueError(f"Expected exactly 12 monthly rainfall values, received {len(v)}.")
        return v


class TankOptimizeResponse(BaseModel):
    all_candidates: List[CandidateEvaluation]
    recommended_capacity_litres: float
    selection_rationale: str
    minimum_practical_capacity_litres: Optional[float] = None
    upper_practical_capacity_litres: Optional[float] = None
    sizing_tiers: Optional[Dict[str, Any]] = None


class MLForecastRequest(BaseModel):
    latitude: float = Field(default=12.97, ge=-90.0, le=90.0)
    longitude: float = Field(default=77.59, ge=-180.0, le=180.0)
    elevation_m: float = Field(default=920.0, ge=-500.0, le=9000.0)
    annual_estimate_mm: Optional[float] = Field(default=None, ge=0.0, le=15000.0)
    city: Optional[str] = Field(default=None, max_length=120)


class LocationItem(BaseModel):
    name: str
    state: str
    latitude: float
    longitude: float
    elevation_m: float
    annual_rainfall_mm: float


class LocationsResponse(BaseModel):
    locations: List[LocationItem]
    count: int


class GeocodeResultItem(BaseModel):
    name: str
    state: Optional[str] = ""
    country: Optional[str] = ""
    latitude: float
    longitude: float
    elevation: Optional[float] = 0.0
    source: Optional[str] = "Geocoding Service"


class GeocodeResponse(BaseModel):
    query: str
    results: List[GeocodeResultItem]
    count: int


class AnalysisResponse(BaseModel):
    request_id: str
    timestamp: str
    user_id: Optional[str] = None
    is_guest: bool = False
    model_version: str = "2.0.0"
    weather: CityRainfallProfile
    recommendation: SystemRecommendation
    water_balance: WaterBalanceResult
    tank_optimization_candidates: List[CandidateEvaluation]
    explainability: ExplainabilityResponse
    ml_forecast: Optional[Dict[str, Any]] = None
    sizing_tiers: Optional[Dict[str, Any]] = None


class ClaimAnalysisRequest(BaseModel):
    request_id: str = Field(..., description="ID of guest analysis to associate with current authenticated user")
