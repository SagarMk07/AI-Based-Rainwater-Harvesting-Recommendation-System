"""REST API endpoints for hydrological analysis, ML forecasting, optimization, and recommendations."""

import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, HTTPException, Query, status

from backend.app.schemas.analysis import (
    AnalysisRequest,
    AnalysisResponse,
    QuickRunoffRequest,
    QuickRunoffResponse,
    WaterCalculateRequest,
    WaterCalculateResponse,
    WaterBalanceSimulateRequest,
    TankOptimizeRequest,
    TankOptimizeResponse,
    MLForecastRequest,
    LocationItem,
    LocationsResponse,
)
from backend.app.calculations.runoff import (
    calculate_gross_harvest,
    calculate_collectable_water,
    get_runoff_coefficient,
)
from backend.app.calculations.demand import (
    calculate_water_demand,
    calculate_savings_percentage,
)
from backend.app.calculations.water_balance import (
    simulate_water_balance,
    WaterBalanceResult,
)
from backend.app.optimization.storage_optimizer import (
    find_optimal_storage,
    OptimizationSummary,
)
from backend.app.recommendations.recommender import (
    generate_recommendation,
    SystemRecommendation,
)
from backend.app.recommendations.explainer import (
    build_explanation,
    ExplainabilityResponse,
)
from backend.app.services.weather import (
    fetch_city_weather,
    CityRainfallProfile,
    IMD_HISTORICAL_NORMALS,
    DEFAULT_NATIONAL_PROFILE,
)
from backend.app.ml.rainfall_predictor import (
    predict_12_months_series,
    load_models,
)
from backend.app.database.connection import get_supabase_client
from backend.app.utils.logger import logger

router = APIRouter(tags=["Analysis & Engineering"])

# In-memory session store for analyses (with Supabase sync if credentials available)
_IN_MEMORY_ANALYSES: Dict[str, AnalysisResponse] = {}


# =====================================================================
# 1. CORE PIPELINE: FULL ANALYSIS
# =====================================================================
@router.post("/analyze", response_model=AnalysisResponse, status_code=status.HTTP_200_OK)
async def run_full_analysis(payload: AnalysisRequest) -> AnalysisResponse:
    """Execute end-to-end engineering intelligence, optimization, and recommendation."""
    try:
        # 1. Fetch weather profile
        weather_profile: CityRainfallProfile = await fetch_city_weather(payload.city)

        # Override with manual inputs if provided
        annual_rain = payload.annual_rainfall_mm if payload.annual_rainfall_mm is not None else weather_profile.annual_rainfall_mm
        monthly_rain = payload.monthly_rainfall_mm if payload.monthly_rainfall_mm is not None else weather_profile.monthly_rainfall_mm

        if len(monthly_rain) != 12:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Expected 12 monthly rainfall figures, received {len(monthly_rain)}."
            )

        # 2. Run multi-criteria recommendation & water balance
        rec = generate_recommendation(
            roof_area_sqm=payload.roof_area_sqm,
            roof_type=payload.roof_type,
            annual_rainfall_mm=annual_rain,
            monthly_rainfall_mm=monthly_rain,
            occupants=payload.occupants,
            daily_demand_litres=payload.daily_demand_litres,
            soil_type=payload.soil_type,
            open_area_sqm=payload.open_area_sqm,
            budget_inr=payload.budget_inr,
            has_existing_borewell=payload.has_existing_borewell,
            filter_efficiency=payload.filter_efficiency,
        )

        # 3. Simulate detailed water balance for the chosen optimal capacity
        demand_info = calculate_water_demand(payload.occupants, direct_daily_demand=payload.daily_demand_litres)
        runoff_coeff = get_runoff_coefficient(payload.roof_type)

        sim_result = simulate_water_balance(
            monthly_rainfall_mm=monthly_rain,
            roof_area_sqm=payload.roof_area_sqm,
            runoff_coefficient=runoff_coeff,
            filter_efficiency=payload.filter_efficiency,
            tank_capacity_litres=rec.optimal_tank_capacity_litres,
            daily_demand_litres=demand_info.daily_demand_litres,
        )

        # 4. Storage optimization candidates evaluation
        opt_summary = find_optimal_storage(
            monthly_rainfall_mm=monthly_rain,
            roof_area_sqm=payload.roof_area_sqm,
            runoff_coefficient=runoff_coeff,
            filter_efficiency=payload.filter_efficiency,
            daily_demand_litres=demand_info.daily_demand_litres,
            budget_inr=payload.budget_inr,
        )

        # 5. Build dynamic explanation
        explainability = build_explanation(
            recommended_system_name=rec.system_type.value,
            roof_area_sqm=payload.roof_area_sqm,
            annual_rainfall_mm=annual_rain,
            gross_harvest_litres=rec.annual_gross_harvest_litres,
            usable_water_litres=rec.annual_usable_litres,
            daily_demand_litres=demand_info.daily_demand_litres,
            soil_type=payload.soil_type,
            open_area_sqm=payload.open_area_sqm,
            overflow_litres=rec.overflow_diverted_to_recharge_litres,
            payback_years=rec.payback_years,
        )

        # 6. ML Forecast comparison
        ml_forecast_data = None
        try:
            ml_forecast_data = predict_12_months_series(annual_estimate_mm=annual_rain)
        except Exception:
            pass

        analysis_res = AnalysisResponse(
            request_id=f"rwh-{uuid.uuid4().hex[:8]}",
            timestamp=datetime.now(timezone.utc).isoformat(),
            weather=weather_profile,
            recommendation=rec,
            water_balance=sim_result,
            tank_optimization_candidates=opt_summary.all_candidates,
            explainability=explainability,
            ml_forecast=ml_forecast_data,
        )

        # Store in session memory
        _IN_MEMORY_ANALYSES[analysis_res.request_id] = analysis_res

        # Optional Supabase persistence
        sb_client = get_supabase_client()
        if sb_client is not None:
            try:
                sb_client.table("analyses").insert({
                    "id": str(uuid.uuid4()),
                    "city": payload.city,
                    "annual_rainfall_mm": annual_rain,
                    "gross_harvest_litres": rec.annual_gross_harvest_litres,
                    "collectable_litres": rec.annual_collectable_litres,
                    "usable_litres": rec.annual_usable_litres,
                    "demand_met_percentage": rec.water_savings_percentage,
                    "optimal_tank_capacity_litres": rec.optimal_tank_capacity_litres,
                    "recommended_system": rec.system_type.value,
                    "total_estimated_cost_inr": rec.total_estimated_cost_inr,
                    "payback_years": rec.payback_years or 0.0,
                    "water_balance_breakdown": sim_result.model_dump(),
                    "explainability_rationale": explainability.model_dump(),
                    "is_offline_guest": True,
                }).execute()
            except Exception as sb_err:
                logger.warning(f"Could not persist analysis to Supabase: {sb_err}")

        return analysis_res

    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Analysis pipeline error: {exc}")


# =====================================================================
# 2. DETERMINISTIC WATER CALCULATIONS
# =====================================================================
@router.post("/calculate/runoff", response_model=QuickRunoffResponse)
async def calculate_quick_runoff(payload: QuickRunoffRequest) -> QuickRunoffResponse:
    """Direct calculation of theoretical gross harvest and net collectable water."""
    try:
        coeff = get_runoff_coefficient(payload.roof_type)
        gross = calculate_gross_harvest(payload.roof_area_sqm, payload.rainfall_mm, coeff)
        collectable = calculate_collectable_water(
            gross, filter_efficiency=payload.filter_efficiency, roof_area_sqm=payload.roof_area_sqm
        )
        return QuickRunoffResponse(
            roof_area_sqm=payload.roof_area_sqm,
            rainfall_mm=payload.rainfall_mm,
            roof_type=payload.roof_type,
            runoff_coefficient=coeff,
            gross_harvest_litres=round(gross, 2),
            collectable_water_litres=round(collectable, 2),
            formula_used="Gross Harvest (L) = Rainfall (mm) * Roof Area (m²) * Runoff Coefficient",
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))


@router.post("/water/calculate", response_model=WaterCalculateResponse)
async def calculate_water_harvest(payload: WaterCalculateRequest) -> WaterCalculateResponse:
    """Deterministic engineering calculation of gross runoff, collectable water, and demand metrics."""
    try:
        coeff = get_runoff_coefficient(payload.roof_type)
        gross = calculate_gross_harvest(payload.roof_area_sqm, payload.rainfall_mm, coeff)
        collectable = calculate_collectable_water(
            gross, filter_efficiency=payload.filter_efficiency, roof_area_sqm=payload.roof_area_sqm
        )
        demand = calculate_water_demand(payload.occupants, direct_daily_demand=payload.daily_demand_litres)

        potential_replacement = min(collectable, demand.annual_demand_litres)
        savings_pct = calculate_savings_percentage(potential_replacement, demand.annual_demand_litres)

        return WaterCalculateResponse(
            roof_area_sqm=payload.roof_area_sqm,
            rainfall_mm=payload.rainfall_mm,
            roof_type=payload.roof_type,
            runoff_coefficient=coeff,
            filter_efficiency=payload.filter_efficiency,
            gross_harvest_litres=round(gross, 2),
            collectable_water_litres=round(collectable, 2),
            daily_demand_litres=round(demand.daily_demand_litres, 2),
            annual_demand_litres=round(demand.annual_demand_litres, 2),
            potential_freshwater_replacement_litres=round(potential_replacement, 2),
            theoretical_savings_percentage=round(savings_pct, 2),
            formulas_used={
                "gross_harvest": "Gross Harvest (L) = Rainfall (mm) * Roof Area (m²) * Runoff Coefficient",
                "collectable_water": "Collectable Water (L) = (Gross Harvest - First Flush) * Filter Efficiency",
                "annual_demand": "Annual Demand (L) = Daily Demand (L) * 365 days",
            }
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))


# =====================================================================
# 3. WATER BALANCE SIMULATION
# =====================================================================
@router.post("/water-balance/simulate", response_model=WaterBalanceResult)
async def simulate_monthly_balance(payload: WaterBalanceSimulateRequest) -> WaterBalanceResult:
    """Run monthly water balance simulation for a specific tank capacity and demand."""
    if len(payload.monthly_rainfall_mm) != 12:
        raise HTTPException(status_code=422, detail="Expected exactly 12 monthly rainfall values.")
    try:
        coeff = get_runoff_coefficient(payload.roof_type)
        return simulate_water_balance(
            monthly_rainfall_mm=payload.monthly_rainfall_mm,
            roof_area_sqm=payload.roof_area_sqm,
            runoff_coefficient=coeff,
            filter_efficiency=payload.filter_efficiency,
            tank_capacity_litres=payload.tank_capacity_litres,
            daily_demand_litres=payload.daily_demand_litres,
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))


# =====================================================================
# 4. STORAGE OPTIMIZATION
# =====================================================================
@router.post("/tank/optimize", response_model=TankOptimizeResponse)
async def optimize_tank_storage(payload: TankOptimizeRequest) -> TankOptimizeResponse:
    """Evaluate candidate tank capacities and determine optimal sizing."""
    if len(payload.monthly_rainfall_mm) != 12:
        raise HTTPException(status_code=422, detail="Expected exactly 12 monthly rainfall values.")
    try:
        coeff = get_runoff_coefficient(payload.roof_type)
        summary: OptimizationSummary = find_optimal_storage(
            monthly_rainfall_mm=payload.monthly_rainfall_mm,
            roof_area_sqm=payload.roof_area_sqm,
            runoff_coefficient=coeff,
            filter_efficiency=payload.filter_efficiency,
            daily_demand_litres=payload.daily_demand_litres,
            budget_inr=payload.budget_inr,
        )
        return TankOptimizeResponse(
            all_candidates=summary.all_candidates,
            recommended_capacity_litres=summary.optimal_capacity_litres,
            selection_rationale=summary.recommendation_note,
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))


# =====================================================================
# 5. RECOMMENDATIONS ENDPOINT
# =====================================================================
@router.post("/recommend", response_model=SystemRecommendation)
async def get_system_recommendation(payload: AnalysisRequest) -> SystemRecommendation:
    """Generate multi-criteria strategy recommendation (Storage, Recharge, Hybrid)."""
    weather_profile = await fetch_city_weather(payload.city)
    annual_rain = payload.annual_rainfall_mm if payload.annual_rainfall_mm is not None else weather_profile.annual_rainfall_mm
    monthly_rain = payload.monthly_rainfall_mm if payload.monthly_rainfall_mm is not None else weather_profile.monthly_rainfall_mm

    return generate_recommendation(
        roof_area_sqm=payload.roof_area_sqm,
        roof_type=payload.roof_type,
        annual_rainfall_mm=annual_rain,
        monthly_rainfall_mm=monthly_rain,
        occupants=payload.occupants,
        daily_demand_litres=payload.daily_demand_litres,
        soil_type=payload.soil_type,
        open_area_sqm=payload.open_area_sqm,
        budget_inr=payload.budget_inr,
        has_existing_borewell=payload.has_existing_borewell,
        filter_efficiency=payload.filter_efficiency,
    )


# =====================================================================
# 6. LOCATIONS & WEATHER
# =====================================================================
@router.get("/locations", response_model=LocationsResponse)
async def list_locations() -> LocationsResponse:
    """Return available meteorological locations with coordinates and rainfall normals."""
    items = []
    coords = {
        "bengaluru": (12.97, 77.59, 920.0),
        "mumbai": (18.92, 72.83, 14.0),
        "delhi": (28.61, 77.20, 216.0),
        "chennai": (13.08, 80.27, 7.0),
        "hyderabad": (17.38, 78.48, 542.0),
        "pune": (18.52, 73.85, 560.0),
        "jaipur": (26.91, 75.78, 431.0),
        "kolkata": (22.57, 88.36, 9.0),
        "kochi": (9.93, 76.26, 4.0),
        "ahmedabad": (23.02, 72.57, 53.0),
    }
    for key, data in IMD_HISTORICAL_NORMALS.items():
        lat, lon, elev = coords.get(key, (20.0, 78.0, 100.0))
        items.append(LocationItem(
            name=data["city"],
            state=data["state"],
            latitude=lat,
            longitude=lon,
            elevation_m=elev,
            annual_rainfall_mm=data["annual_rainfall_mm"],
        ))
    return LocationsResponse(locations=items, count=len(items))


@router.get("/weather", response_model=Any)
@router.get("/weather/{city}", response_model=CityRainfallProfile)
async def get_weather(city: Optional[str] = None) -> Any:
    """Fetch rainfall profile for a city, or list of all regional profiles if city not provided."""
    if city:
        return await fetch_city_weather(city)
    # If no city query param, return summary of all available stations
    return {
        "count": len(IMD_HISTORICAL_NORMALS),
        "stations": [
            {
                "city": v["city"],
                "state": v["state"],
                "annual_rainfall_mm": v["annual_rainfall_mm"],
                "humidity": v["humidity"],
                "temperature": v["temperature"],
            }
            for v in IMD_HISTORICAL_NORMALS.values()
        ],
        "default_national_benchmark": DEFAULT_NATIONAL_PROFILE,
    }


# =====================================================================
# 7. ML FORECASTING & MODEL TELEMETRY
# =====================================================================
@router.post("/rainfall/predict")
@router.post("/ml/forecast")
async def get_rainfall_forecast(payload: MLForecastRequest):
    """Generate 12-month ML rainfall time-series forecast with lag autoregression."""
    try:
        return predict_12_months_series(
            latitude=payload.latitude,
            longitude=payload.longitude,
            elevation_m=payload.elevation_m,
            annual_estimate_mm=payload.annual_estimate_mm,
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))


@router.get("/model/metrics")
@router.get("/ml/metrics")
async def get_model_metrics():
    """Retrieve ML model performance metrics, dataset characteristics, and confusion matrix."""
    _, _, metadata = load_models()
    return metadata


@router.get("/model/features")
async def get_model_features():
    """Retrieve ML feature names and feature importance weights."""
    _, _, metadata = load_models()
    return {
        "features": metadata.get("features", []),
        "feature_importances": metadata.get("feature_importances", {}),
    }


# =====================================================================
# 8. ANALYSIS HISTORY & PERSISTENCE
# =====================================================================
@router.get("/analysis/history")
async def get_analysis_history():
    """Retrieve stored analyses history."""
    items = list(_IN_MEMORY_ANALYSES.values())
    return {"analyses": items[::-1], "count": len(items)}


@router.get("/analysis/{analysis_id}")
async def get_analysis_by_id(analysis_id: str):
    """Retrieve a single analysis run by ID."""
    if analysis_id in _IN_MEMORY_ANALYSES:
        return _IN_MEMORY_ANALYSES[analysis_id]
    raise HTTPException(status_code=404, detail=f"Analysis '{analysis_id}' not found.")


@router.delete("/analysis/{analysis_id}")
async def delete_analysis_by_id(analysis_id: str):
    """Delete a stored analysis by ID."""
    if analysis_id in _IN_MEMORY_ANALYSES:
        del _IN_MEMORY_ANALYSES[analysis_id]
        return {"status": "deleted", "request_id": analysis_id}
    raise HTTPException(status_code=404, detail=f"Analysis '{analysis_id}' not found.")
