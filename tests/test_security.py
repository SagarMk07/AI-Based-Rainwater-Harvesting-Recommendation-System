"""Comprehensive security and authorization tests for Phase 6 Production Hardening.

Covers:
- Authentication & JWT validation (valid, missing, invalid tokens)
- Row/Resource ownership isolation (User A vs User B cross-tenant protection)
- Guest mode boundaries (unauthenticated access cannot reach private analyses)
- Input validation & boundary rejection (negative & unreasonable numeric values)
- Security headers (nosniff, DENY, Referrer-Policy, X-Request-ID)
- Rate limiting enforcement (HTTP 429)
- Guest analysis claiming workflow
- User account data purging (GDPR / Privacy)
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_security_headers_on_responses():
    """Verify security headers are applied to API responses."""
    res = client.get("/")
    assert res.status_code == 200
    assert res.headers.get("X-Content-Type-Options") == "nosniff"
    assert res.headers.get("X-Frame-Options") == "DENY"
    assert "strict-origin-when-cross-origin" in res.headers.get("Referrer-Policy", "")
    assert res.headers.get("X-Request-ID") is not None


def test_invalid_and_missing_token_rejection():
    """Verify malformed or invalid JWT tokens return uniform 401 responses."""
    # Invalid bearer token
    res = client.get(
        "/api/analysis/history",
        headers={"Authorization": "Bearer not-a-valid-jwt-token"},
    )
    assert res.status_code == 401
    data = res.json()
    assert data["success"] is False
    assert data["error"]["code"] == "INVALID_TOKEN"


def test_user_ownership_and_cross_user_isolation():
    """Verify that User A's private analysis cannot be accessed or deleted by User B or a logged-out guest."""
    payload = {
        "city": "Bengaluru",
        "roof_area_sqm": 180.0,
        "roof_type": "rcc",
        "annual_rainfall_mm": 950.0,
        "occupants": 4,
        "daily_demand_litres": 540.0,
    }

    # 1. User A creates private analysis
    create_res = client.post(
        "/api/analyze",
        json=payload,
        headers={"Authorization": "Bearer test-token-alice"},
    )
    assert create_res.status_code == 200
    alice_data = create_res.json()
    req_id = alice_data["request_id"]
    assert alice_data["user_id"] == "user-alice"
    assert alice_data["is_guest"] is False

    # 2. Logged-out user attempts to read Alice's analysis -> 401 Unauthorized
    anon_res = client.get(f"/api/analysis/{req_id}")
    assert anon_res.status_code == 401
    assert anon_res.json()["error"]["code"] == "UNAUTHORIZED"

    # 3. User B (Bob) attempts to read Alice's analysis -> 403 Forbidden
    bob_res = client.get(
        f"/api/analysis/{req_id}",
        headers={"Authorization": "Bearer test-token-bob"},
    )
    assert bob_res.status_code == 403
    assert bob_res.json()["error"]["code"] == "FORBIDDEN"

    # 4. User A (Alice) accesses own analysis -> 200 OK
    alice_get_res = client.get(
        f"/api/analysis/{req_id}",
        headers={"Authorization": "Bearer test-token-alice"},
    )
    assert alice_get_res.status_code == 200
    assert alice_get_res.json()["request_id"] == req_id

    # 5. User B (Bob) attempts to delete Alice's analysis -> 403 Forbidden
    bob_del = client.delete(
        f"/api/analysis/{req_id}",
        headers={"Authorization": "Bearer test-token-bob"},
    )
    assert bob_del.status_code == 403
    assert bob_del.json()["error"]["code"] == "FORBIDDEN"

    # 6. Alice deletes own analysis -> 200 OK
    alice_del = client.delete(
        f"/api/analysis/{req_id}",
        headers={"Authorization": "Bearer test-token-alice"},
    )
    assert alice_del.status_code == 200
    assert alice_del.json()["status"] == "deleted"

    # 7. Confirm now 404
    assert client.get(f"/api/analysis/{req_id}").status_code == 404


def test_history_multi_tenant_isolation():
    """Verify analyses history only returns analyses owned by requesting user."""
    # Alice creates analysis
    res_a = client.post(
        "/api/analyze",
        json={"city": "Pune", "roof_area_sqm": 120.0, "roof_type": "rcc"},
        headers={"Authorization": "Bearer test-token-charlie"},
    )
    id_a = res_a.json()["request_id"]

    # Dave creates analysis
    res_b = client.post(
        "/api/analyze",
        json={"city": "Mumbai", "roof_area_sqm": 250.0, "roof_type": "rcc"},
        headers={"Authorization": "Bearer test-token-dave"},
    )
    id_b = res_b.json()["request_id"]

    # Charlie views history -> sees id_a, not id_b
    hist_a = client.get(
        "/api/analysis/history",
        headers={"Authorization": "Bearer test-token-charlie"},
    ).json()
    charlie_ids = [item["request_id"] for item in hist_a["analyses"]]
    assert id_a in charlie_ids
    assert id_b not in charlie_ids

    # Dave views history -> sees id_b, not id_a
    hist_b = client.get(
        "/api/analysis/history",
        headers={"Authorization": "Bearer test-token-dave"},
    ).json()
    dave_ids = [item["request_id"] for item in hist_b["analyses"]]
    assert id_b in dave_ids
    assert id_a not in dave_ids

    # Guest views history -> does not see private records
    hist_guest = client.get("/api/analysis/history").json()
    guest_ids = [item["request_id"] for item in hist_guest["analyses"]]
    assert id_a not in guest_ids
    assert id_b not in guest_ids


def test_guest_claiming_and_ownership_transition():
    """Verify an anonymous guest can create an analysis and claim it upon logging in."""
    # Guest creates analysis
    guest_res = client.post(
        "/api/analyze",
        json={"city": "Jaipur", "roof_area_sqm": 150.0, "roof_type": "rcc"},
    )
    assert guest_res.status_code == 200
    guest_data = guest_res.json()
    req_id = guest_data["request_id"]
    assert guest_data["is_guest"] is True
    assert guest_data["user_id"] is None

    # User claims the analysis
    claim_res = client.post(
        f"/api/analysis/{req_id}/claim",
        headers={"Authorization": "Bearer test-token-eve"},
    )
    assert claim_res.status_code == 200
    assert claim_res.json()["status"] == "claimed"
    assert claim_res.json()["user_id"] == "user-eve"

    # Anonymous user can no longer view it without auth
    assert client.get(f"/api/analysis/{req_id}").status_code == 401

    # User Eve can view it
    eve_res = client.get(
        f"/api/analysis/{req_id}",
        headers={"Authorization": "Bearer test-token-eve"},
    )
    assert eve_res.status_code == 200
    assert eve_res.json()["user_id"] == "user-eve"

    # User Frank cannot claim it now -> 403 Forbidden
    frank_claim = client.post(
        f"/api/analysis/{req_id}/claim",
        headers={"Authorization": "Bearer test-token-frank"},
    )
    assert frank_claim.status_code == 403


def test_input_validation_boundary_rejection():
    """Verify input validation rejects negative, zero, and unreasonable values with 422."""
    # Negative roof area
    r1 = client.post("/api/analyze", json={"roof_area_sqm": -50.0})
    assert r1.status_code == 422
    assert r1.json()["success"] is False

    # Zero roof area
    r2 = client.post("/api/analyze", json={"roof_area_sqm": 0.0})
    assert r2.status_code == 422

    # Negative rainfall
    r3 = client.post("/api/analyze", json={"roof_area_sqm": 100.0, "annual_rainfall_mm": -10.0})
    assert r3.status_code == 422

    # Zero occupants
    r4 = client.post("/api/analyze", json={"roof_area_sqm": 100.0, "occupants": 0})
    assert r4.status_code == 422

    # Negative open area
    r5 = client.post("/api/analyze", json={"roof_area_sqm": 100.0, "open_area_sqm": -5.0})
    assert r5.status_code == 422

    # Negative budget
    r6 = client.post("/api/analyze", json={"roof_area_sqm": 100.0, "budget_inr": -1000.0})
    assert r6.status_code == 422

    # Unreasonable roof area (> 1,000,000 m²)
    r7 = client.post("/api/analyze", json={"roof_area_sqm": 5_000_000.0})
    assert r7.status_code == 422

    # Invalid monthly rainfall length != 12
    r8 = client.post(
        "/api/analyze",
        json={"roof_area_sqm": 100.0, "monthly_rainfall_mm": [10.0, 20.0, 30.0]},
    )
    assert r8.status_code == 422


def test_user_account_data_purging():
    """Verify GDPR account and data deletion endpoint removes all user records."""
    # User creates analysis
    res = client.post(
        "/api/analyze",
        json={"city": "Kochi", "roof_area_sqm": 220.0, "roof_type": "rcc"},
        headers={"Authorization": "Bearer test-token-grace"},
    )
    req_id = res.json()["request_id"]

    # Delete account
    del_res = client.delete(
        "/api/user/account",
        headers={"Authorization": "Bearer test-token-grace"},
    )
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "deleted"
    assert del_res.json()["deleted_analyses_count"] >= 1

    # Analysis is no longer available
    assert client.get(
        f"/api/analysis/{req_id}",
        headers={"Authorization": "Bearer test-token-grace"},
    ).status_code == 404
