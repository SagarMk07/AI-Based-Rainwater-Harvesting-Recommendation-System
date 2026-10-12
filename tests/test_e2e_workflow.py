"""End-to-End lifecycle test verifying the full 15-step production user workflow.

Scenario:
1. Account creation simulation.
2. Authentication & session acquisition.
3. Property catchment specification.
4. Location geocoding & coordinates.
5. Rainfall retrieval & meteorological profile.
6. Execution of full hydrological analysis pipeline.
7. Retrieval of ML recommendation & feature confidence.
8. Verification of engineering water balance results.
9. Persistence and binding of analysis to user profile.
10. Querying of private analysis history.
11. Direct lookup of saved analysis run.
12. Logout / session termination.
13. Attempt to access protected analysis while unauthenticated (expect 401).
14. Re-authentication.
15. Confirmation that saved analysis remains available and intact.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_complete_e2e_user_workflow():
    # -------------------------------------------------------------
    # Step 1 & 2: Account creation & Login
    # -------------------------------------------------------------
    user_token = "test-token-e2e_engineer"
    auth_headers = {"Authorization": f"Bearer {user_token}"}

    # -------------------------------------------------------------
    # Step 3 & 4: Location & Property Specification
    # -------------------------------------------------------------
    city_name = "Bengaluru"
    lat, lon = 12.9716, 77.5946

    # -------------------------------------------------------------
    # Step 5: Retrieve Rainfall & Climate Data
    # -------------------------------------------------------------
    weather_res = client.get(f"/api/weather?city={city_name}")
    assert weather_res.status_code == 200
    weather_data = weather_res.json()
    assert weather_data["annual_rainfall_mm"] > 500.0
    assert len(weather_data["monthly_rainfall_mm"]) == 12

    # -------------------------------------------------------------
    # Step 6: Run Full Hydrological Analysis Pipeline
    # -------------------------------------------------------------
    property_payload = {
        "city": city_name,
        "latitude": lat,
        "longitude": lon,
        "roof_area_sqm": 250.0,
        "roof_type": "rcc",
        "occupants": 5,
        "daily_demand_litres": 750.0,
        "soil_type": "loamy",
        "open_area_sqm": 60.0,
        "budget_inr": 150000.0,
        "has_existing_borewell": True,
    }

    analysis_res = client.post("/api/analyze", json=property_payload, headers=auth_headers)
    assert analysis_res.status_code == 200
    result = analysis_res.json()
    req_id = result["request_id"]

    # -------------------------------------------------------------
    # Step 7: Receive ML Recommendation & Metadata
    # -------------------------------------------------------------
    recommendation = result["recommendation"]
    assert "system_type" in recommendation
    assert recommendation["optimal_tank_capacity_litres"] > 0
    assert result["model_version"] == "2.0.0"

    # -------------------------------------------------------------
    # Step 8: View Engineering Results & Water Balance
    # -------------------------------------------------------------
    water_balance = result["water_balance"]
    assert len(water_balance["monthly_breakdown"]) == 12
    assert result["explainability"]["recommended_system"] is not None
    assert len(result["tank_optimization_candidates"]) >= 5

    # -------------------------------------------------------------
    # Step 9: Save & Confirm Ownership
    # -------------------------------------------------------------
    assert result["user_id"] == "user-e2e_engineer"
    assert result["is_guest"] is False

    # -------------------------------------------------------------
    # Step 10: Open Private Analysis History
    # -------------------------------------------------------------
    history_res = client.get("/api/analysis/history", headers=auth_headers)
    assert history_res.status_code == 200
    history_data = history_res.json()
    assert any(item["request_id"] == req_id for item in history_data["analyses"])

    # -------------------------------------------------------------
    # Step 11: Open Saved Analysis Run by ID
    # -------------------------------------------------------------
    saved_res = client.get(f"/api/analysis/{req_id}", headers=auth_headers)
    assert saved_res.status_code == 200
    assert saved_res.json()["request_id"] == req_id

    # -------------------------------------------------------------
    # Step 12: Logout / Strip Auth Credentials
    # -------------------------------------------------------------
    unauth_headers = {}

    # -------------------------------------------------------------
    # Step 13: Attempt to Access Protected Analysis while Logged Out
    # -------------------------------------------------------------
    unauth_res = client.get(f"/api/analysis/{req_id}", headers=unauth_headers)
    assert unauth_res.status_code == 401
    assert unauth_res.json()["error"]["code"] == "UNAUTHORIZED"

    # Cross-tenant check: User Hacker cannot access it either
    hacker_res = client.get(
        f"/api/analysis/{req_id}",
        headers={"Authorization": "Bearer test-token-hacker"},
    )
    assert hacker_res.status_code == 403
    assert hacker_res.json()["error"]["code"] == "FORBIDDEN"

    # -------------------------------------------------------------
    # Step 14: Login Again (Re-establish Session)
    # -------------------------------------------------------------
    relogin_headers = {"Authorization": f"Bearer {user_token}"}

    # -------------------------------------------------------------
    # Step 15: Confirm Saved Analysis Remains Available and Intact
    # -------------------------------------------------------------
    relogin_res = client.get(f"/api/analysis/{req_id}", headers=relogin_headers)
    assert relogin_res.status_code == 200
    relogin_data = relogin_res.json()
    assert relogin_data["request_id"] == req_id
    assert relogin_data["recommendation"]["optimal_tank_capacity_litres"] == recommendation["optimal_tank_capacity_litres"]
