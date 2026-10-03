"""Integration tests for all REST API endpoints specified in Master Specification."""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_quick_runoff_endpoint_exact_prompt_benchmark():
    """Verify POST /api/calculate/runoff with prompt test case:
    200 m², 900 mm, RCC 0.85 -> 153,000 L.
    """
    payload = {
        "roof_area_sqm": 200.0,
        "rainfall_mm": 900.0,
        "roof_type": "rcc",
        "filter_efficiency": 0.90,
    }
    res = client.post("/api/calculate/runoff", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["gross_harvest_litres"] == 153000.0
    assert data["runoff_coefficient"] == 0.85
    assert data["collectable_water_litres"] > 0


def test_water_calculate_endpoint():
    """Verify POST /api/water/calculate with demand and savings metrics."""
    payload = {
        "roof_area_sqm": 200.0,
        "rainfall_mm": 900.0,
        "roof_type": "rcc",
        "occupants": 5,
        "daily_demand_litres": 600.0,
        "filter_efficiency": 0.90,
    }
    res = client.post("/api/water/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["gross_harvest_litres"] == 153000.0
    assert data["annual_demand_litres"] == 219000.0
    assert data["potential_freshwater_replacement_litres"] > 0
    assert "gross_harvest" in data["formulas_used"]


def test_water_balance_simulate_endpoint():
    """Verify POST /api/water-balance/simulate."""
    monthly_rain = [5.0, 5.0, 10.0, 20.0, 60.0, 150.0, 280.0, 250.0, 100.0, 15.0, 3.0, 2.0]
    payload = {
        "monthly_rainfall_mm": monthly_rain,
        "roof_area_sqm": 200.0,
        "roof_type": "rcc",
        "tank_capacity_litres": 5000.0,
        "daily_demand_litres": 600.0,
        "filter_efficiency": 0.90,
    }
    res = client.post("/api/water-balance/simulate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["monthly_breakdown"]) == 12
    assert data["total_inflow_litres"] > 0
    assert data["total_supplied_litres"] > 0
    assert data["demand_met_percentage"] > 0


def test_tank_optimize_endpoint():
    """Verify POST /api/tank/optimize."""
    monthly_rain = [5.0, 5.0, 10.0, 20.0, 60.0, 150.0, 280.0, 250.0, 100.0, 15.0, 3.0, 2.0]
    payload = {
        "monthly_rainfall_mm": monthly_rain,
        "roof_area_sqm": 200.0,
        "roof_type": "rcc",
        "daily_demand_litres": 600.0,
        "budget_inr": 100000.0,
    }
    res = client.post("/api/tank/optimize", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["all_candidates"]) >= 5
    assert data["recommended_capacity_litres"] in [5000.0, 7500.0, 10000.0]
    assert len(data["selection_rationale"]) > 0


def test_recommend_endpoint():
    """Verify POST /api/recommend."""
    payload = {
        "city": "Bengaluru",
        "roof_area_sqm": 200.0,
        "roof_type": "rcc",
        "annual_rainfall_mm": 900.0,
        "occupants": 5,
        "daily_demand_litres": 600.0,
        "soil_type": "loamy",
        "open_area_sqm": 50.0,
        "budget_inr": 100000.0,
    }
    res = client.post("/api/recommend", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["system_type"] == "Hybrid Storage & Groundwater Recharge"
    assert data["annual_gross_harvest_litres"] == 153000.0
    assert data["optimal_tank_capacity_litres"] > 0


def test_locations_endpoint():
    """Verify GET /api/locations."""
    res = client.get("/api/locations")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] >= 10
    assert any(loc["name"] == "Bengaluru" for loc in data["locations"])
    assert any(loc["name"] == "Mumbai" for loc in data["locations"])


def test_weather_endpoint():
    """Verify GET /api/weather with and without city param."""
    # List all
    res_all = client.get("/api/weather")
    assert res_all.status_code == 200
    data_all = res_all.json()
    assert data_all["count"] >= 10

    # Specific city via query
    res_city = client.get("/api/weather?city=Mumbai")
    assert res_city.status_code == 200
    data_city = res_city.json()
    assert "Mumbai" in data_city["city"]
    assert 2000.0 <= data_city["annual_rainfall_mm"] <= 2500.0


def test_rainfall_predict_endpoint():
    """Verify POST /api/rainfall/predict."""
    payload = {
        "latitude": 12.97,
        "longitude": 77.59,
        "elevation_m": 920.0,
        "annual_estimate_mm": 924.0,
    }
    res = client.post("/api/rainfall/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["monthly_forecast"]) == 12
    assert "model_performance" in data
    assert "features_used" in data


def test_model_metrics_and_features_endpoints():
    """Verify GET /api/model/metrics and GET /api/model/features."""
    res_m = client.get("/api/model/metrics")
    assert res_m.status_code == 200
    data_m = res_m.json()
    assert data_m["dataset_size"] == 3600
    assert "regression_metrics" in data_m
    assert "classification_metrics" in data_m

    res_f = client.get("/api/model/features")
    assert res_f.status_code == 200
    data_f = res_f.json()
    assert len(data_f["features"]) == 10
    assert "feature_importances" in data_f


def test_analysis_history_and_crud():
    """Verify POST /api/analyze then GET /api/analysis/history, GET /api/analysis/{id}, DELETE /api/analysis/{id}."""
    payload = {
        "city": "Bengaluru",
        "annual_rainfall_mm": 900.0,
        "roof_area_sqm": 200.0,
        "roof_type": "rcc",
        "occupants": 5,
        "daily_demand_litres": 600.0,
        "soil_type": "loamy",
        "open_area_sqm": 50.0,
        "budget_inr": 100000.0,
    }
    create_res = client.post("/api/analyze", json=payload)
    assert create_res.status_code == 200
    analysis = create_res.json()
    req_id = analysis["request_id"]

    # Retrieve history
    hist_res = client.get("/api/analysis/history")
    assert hist_res.status_code == 200
    hist_data = hist_res.json()
    assert any(a["request_id"] == req_id for a in hist_data["analyses"])

    # Retrieve by ID
    get_res = client.get(f"/api/analysis/{req_id}")
    assert get_res.status_code == 200
    assert get_res.json()["request_id"] == req_id

    # Delete by ID
    del_res = client.delete(f"/api/analysis/{req_id}")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "deleted"

    # Confirm deleted
    assert client.get(f"/api/analysis/{req_id}").status_code == 404


def test_quick_runoff_validation_rejection():
    """Negative roof area or invalid numbers must be rejected by Pydantic validation."""
    payload = {
        "roof_area_sqm": -50.0,
        "rainfall_mm": 900.0,
    }
    res = client.post("/api/calculate/runoff", json=payload)
    assert res.status_code == 422
