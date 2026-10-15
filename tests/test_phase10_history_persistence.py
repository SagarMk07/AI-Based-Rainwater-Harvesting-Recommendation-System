"""Comprehensive tests for Phase 10: Analysis Persistence, Recent History & Cross-Tenant Isolation.

Verifies:
1. Durable analysis persistence (saving snapshots).
2. Server-side limiting (limit=5 for Dashboard Recent Analyses).
3. Newest-first sorting order with stable tiebreaker.
4. Server-side pagination (page, page_size, total_pages, has_more).
5. Zero-recalculation reopening by ID (GET /api/analysis/{id}).
6. 404 error handling for non-existent IDs.
7. Strict cross-user isolation (401 for anonymous, 403 for other users).
8. Guest analysis isolation & claiming.
9. Local durable repository state survival.
"""

import time
import uuid
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.analysis_repository import analysis_repo

client = TestClient(app)


def test_durable_persistence_and_five_record_limit():
    """Verify that multiple analyses are persisted and limit=5 returns strictly the 5 newest records."""
    unique_user = f"user1-{uuid.uuid4().hex[:8]}"
    user_header = {"Authorization": f"Bearer test-token-{unique_user}"}
    base_payload = {
        "city": "Bengaluru",
        "roof_area_sqm": 150.0,
        "roof_type": "rcc",
        "annual_rainfall_mm": 950.0,
        "occupants": 4,
        "daily_demand_litres": 540.0,
    }

    created_ids = []
    # Create 7 analyses sequentially
    for i in range(7):
        payload = dict(base_payload)
        payload["roof_area_sqm"] = 100.0 + (i * 10)
        res = client.post("/api/analyze", json=payload, headers=user_header)
        assert res.status_code == 200
        data = res.json()
        created_ids.append(data["request_id"])
        time.sleep(0.01)  # Ensure non-identical timestamps

    # 1. Fetch recent history with limit=5
    recent_res = client.get("/api/analysis/history?limit=5", headers=user_header)
    assert recent_res.status_code == 200
    recent_data = recent_res.json()

    assert "analyses" in recent_data
    assert len(recent_data["analyses"]) == 5
    assert recent_data["count"] == 5
    assert recent_data["total"] == 7
    assert recent_data["has_more"] is True

    # Check newest-first ordering: the very last created should be first
    assert recent_data["analyses"][0]["request_id"] == created_ids[-1]
    assert recent_data["analyses"][1]["request_id"] == created_ids[-2]


def test_server_side_pagination():
    """Verify pagination returns correct pages, counts, and items."""
    unique_user = f"user2-{uuid.uuid4().hex[:8]}"
    user_header = {"Authorization": f"Bearer test-token-{unique_user}"}
    base_payload = {
        "city": "Chennai",
        "roof_area_sqm": 200.0,
        "roof_type": "metal_sheet",
        "annual_rainfall_mm": 1300.0,
        "occupants": 5,
        "daily_demand_litres": 650.0,
    }

    created_ids = []
    for i in range(6):
        payload = dict(base_payload)
        payload["roof_area_sqm"] = 200.0 + (i * 15)
        res = client.post("/api/analyze", json=payload, headers=user_header)
        assert res.status_code == 200
        created_ids.append(res.json()["request_id"])
        time.sleep(0.01)

    # Page 1 (size 2)
    p1 = client.get("/api/analysis/history?page=1&page_size=2", headers=user_header).json()
    assert len(p1["analyses"]) == 2
    assert p1["page"] == 1
    assert p1["total_pages"] == 3
    assert p1["has_more"] is True
    assert p1["analyses"][0]["request_id"] == created_ids[-1]

    # Page 2 (size 2)
    p2 = client.get("/api/analysis/history?page=2&page_size=2", headers=user_header).json()
    assert len(p2["analyses"]) == 2
    assert p2["page"] == 2
    assert p2["analyses"][0]["request_id"] == created_ids[-3]

    # Page 3 (size 2)
    p3 = client.get("/api/analysis/history?page=3&page_size=2", headers=user_header).json()
    assert len(p3["analyses"]) == 2
    assert p3["page"] == 3
    assert p3["has_more"] is False



def test_reopen_saved_analysis_by_id():
    """Verify reopening an analysis by ID returns the persisted snapshot without recalculating."""
    user_header = {"Authorization": "Bearer test-token-phase10-user3"}
    res = client.post(
        "/api/analyze",
        json={"city": "Pune", "roof_area_sqm": 120.0, "roof_type": "tiles"},
        headers=user_header,
    )
    assert res.status_code == 200
    original = res.json()
    analysis_id = original["request_id"]

    # Reopen via GET /api/analysis/{id}
    reopen_res = client.get(f"/api/analysis/{analysis_id}", headers=user_header)
    assert reopen_res.status_code == 200
    reopened = reopen_res.json()

    # Must match original exactly
    assert reopened["request_id"] == analysis_id
    assert reopened["timestamp"] == original["timestamp"]
    assert reopened["weather"]["city"] == original["weather"]["city"]
    assert (
        reopened["recommendation"]["annual_gross_harvest_litres"]
        == original["recommendation"]["annual_gross_harvest_litres"]
    )
    assert (
        reopened["recommendation"]["optimal_tank_capacity_litres"]
        == original["recommendation"]["optimal_tank_capacity_litres"]
    )


def test_reopen_missing_analysis_returns_404():
    """Verify non-existent analysis ID returns structured 404."""
    res = client.get("/api/analysis/non-existent-id-99999")
    assert res.status_code == 404
    body = res.json()
    assert body["error"]["code"] == "NOT_FOUND"


def test_cross_user_isolation_security():
    """Verify User A's private analysis cannot be accessed by User B or guests."""
    user_a_header = {"Authorization": "Bearer test-token-phase10-alice"}
    user_b_header = {"Authorization": "Bearer test-token-phase10-bob"}

    res = client.post(
        "/api/analyze",
        json={"city": "Mumbai", "roof_area_sqm": 160.0, "roof_type": "rcc"},
        headers=user_a_header,
    )
    assert res.status_code == 200
    alice_id = res.json()["request_id"]

    # Anonymous access -> 401 Unauthorized
    anon_res = client.get(f"/api/analysis/{alice_id}")
    assert anon_res.status_code == 401
    assert anon_res.json()["error"]["code"] == "UNAUTHORIZED"

    # User B access -> 403 Forbidden
    bob_res = client.get(f"/api/analysis/{alice_id}", headers=user_b_header)
    assert bob_res.status_code == 403
    assert bob_res.json()["error"]["code"] == "FORBIDDEN"

    # User B list history -> Alice's record must NOT be in User B's list
    bob_list = client.get("/api/analysis/history", headers=user_b_header).json()
    bob_ids = [item["request_id"] for item in bob_list.get("analyses", [])]
    assert alice_id not in bob_ids


def test_guest_analysis_and_claim_flow():
    """Verify guest analysis runs anonymously and can be claimed upon sign-in."""
    # 1. Guest creates analysis (no auth header)
    guest_res = client.post(
        "/api/analyze",
        json={"city": "Jaipur", "roof_area_sqm": 140.0, "roof_type": "rcc"},
    )
    assert guest_res.status_code == 200
    guest_data = guest_res.json()
    assert guest_data["is_guest"] is True
    assert guest_data["user_id"] is None
    guest_id = guest_data["request_id"]

    # 2. Guest can view their unassigned analysis
    read_guest = client.get(f"/api/analysis/{guest_id}")
    assert read_guest.status_code == 200

    # 3. User claims the guest analysis
    user_header = {"Authorization": "Bearer test-token-phase10-claimant"}
    claim_res = client.post(f"/api/analysis/{guest_id}/claim", headers=user_header)
    assert claim_res.status_code == 200
    claim_data = claim_res.json()
    assert claim_data["success"] is True

    # 4. Now the analysis is owned by claimant, so anonymous requests are rejected with 401
    assert client.get(f"/api/analysis/{guest_id}").status_code == 401

    # 5. Claimant can read it
    assert client.get(f"/api/analysis/{guest_id}", headers=user_header).status_code == 200


def test_history_delete_persistence_across_reloads():
    """Verify that deleting an analysis removes it permanently from memory, disk store, and history listings.
    
    Ensures that re-instantiating the repository or reloading the database from disk
    does NOT restore the deleted analysis.
    """
    import json
    from backend.app.database.analysis_repository import AnalysisRepository

    user_token = f"user-persist-{uuid.uuid4().hex[:8]}"
    headers = {"Authorization": f"Bearer test-token-{user_token}"}

    # 1. Create an analysis
    payload = {
        "city": "Hyderabad",
        "roof_area_sqm": 220.0,
        "roof_type": "concrete",
        "annual_rainfall_mm": 820.0,
        "occupants": 4,
        "daily_demand_litres": 500.0,
    }
    create_res = client.post("/api/analyze", json=payload, headers=headers)
    assert create_res.status_code == 200
    req_id = create_res.json()["request_id"]

    # 2. Verify present in user history
    h1 = client.get("/api/analysis/history", headers=headers).json()
    assert any(a["request_id"] == req_id for a in h1["analyses"])

    # 3. Verify present on disk in analyses_store.json
    disk_store_path = analysis_repo._storage_path
    with open(disk_store_path, "r", encoding="utf-8") as f:
        disk_data = json.load(f)
    assert any(item.get("request_id") == req_id for item in disk_data)

    # 4. Delete the analysis via DELETE endpoint
    del_res = client.delete(f"/api/analysis/{req_id}", headers=headers)
    assert del_res.status_code == 200
    del_data = del_res.json()
    assert del_data["status"] == "deleted"
    assert del_data["request_id"] == req_id
    assert del_data["deleted_local"] is True

    # 5. Verify absent from user history API
    h2 = client.get("/api/analysis/history", headers=headers).json()
    assert not any(a["request_id"] == req_id for a in h2["analyses"])

    # 6. Verify absent from disk store
    with open(disk_store_path, "r", encoding="utf-8") as f:
        disk_data_after = json.load(f)
    assert not any(item.get("request_id") == req_id for item in disk_data_after)

    # 7. CRITICAL PERSISTENCE TEST: Re-instantiate AnalysisRepository fresh from disk
    # Simulates complete server restart / page refresh reading persistent store
    fresh_repo = AnalysisRepository(storage_path=disk_store_path)
    fresh_record = fresh_repo.get_by_id(req_id)
    assert fresh_record is None, "Deleted record must NOT exist in fresh repository loaded from disk"

    fresh_list = fresh_repo.list_analyses(user_id=f"user-{user_token}")
    assert not any(a.request_id == req_id for a in fresh_list["analyses"]), "Deleted record must NOT appear in fresh repository list"

    # 8. Direct GET must return 404
    assert client.get(f"/api/analysis/{req_id}", headers=headers).status_code == 404


def test_history_delete_authorization_and_ownership():
    """Verify strict user-scoped ownership on deletion:
    - Unauthenticated delete of private record -> 401
    - Foreign authenticated user delete -> 403
    - Nonexistent analysis delete -> 404
    - Valid owner delete -> 200
    """
    alice_token = f"alice-{uuid.uuid4().hex[:8]}"
    bob_token = f"bob-{uuid.uuid4().hex[:8]}"
    alice_headers = {"Authorization": f"Bearer test-token-{alice_token}"}
    bob_headers = {"Authorization": f"Bearer test-token-{bob_token}"}

    # Alice creates analysis
    create_res = client.post(
        "/api/analyze",
        json={"city": "Kolkata", "roof_area_sqm": 175.0, "roof_type": "rcc"},
        headers=alice_headers,
    )
    assert create_res.status_code == 200
    alice_id = create_res.json()["request_id"]

    # 1. Unauthenticated DELETE -> 401 Unauthorized
    unauth_del = client.delete(f"/api/analysis/{alice_id}")
    assert unauth_del.status_code == 401
    assert unauth_del.json()["error"]["code"] == "UNAUTHORIZED"

    # 2. Bob attempts to delete Alice's analysis -> 403 Forbidden
    bob_del = client.delete(f"/api/analysis/{alice_id}", headers=bob_headers)
    assert bob_del.status_code == 403
    assert bob_del.json()["error"]["code"] == "FORBIDDEN"

    # 3. Delete nonexistent analysis -> 404 Not Found
    missing_del = client.delete("/api/analysis/nonexistent-id-00000", headers=alice_headers)
    assert missing_del.status_code == 404
    assert missing_del.json()["error"]["code"] == "NOT_FOUND"

    # 4. Alice deletes own analysis -> 200 OK
    alice_del = client.delete(f"/api/analysis/{alice_id}", headers=alice_headers)
    assert alice_del.status_code == 200
    assert alice_del.json()["status"] == "deleted"

    # 5. Subsequent delete by Alice now returns 404
    second_del = client.delete(f"/api/analysis/{alice_id}", headers=alice_headers)
    assert second_del.status_code == 404


def test_clear_user_history_endpoint():
    """Verify DELETE /api/analysis/history/clear wipes all records for requesting user only."""
    user_token = f"clear-user-{uuid.uuid4().hex[:8]}"
    headers = {"Authorization": f"Bearer test-token-{user_token}"}

    # Create 3 analyses
    for i in range(3):
        res = client.post(
            "/api/analyze",
            json={"city": "Delhi", "roof_area_sqm": 120.0 + i * 20, "roof_type": "rcc"},
            headers=headers,
        )
        assert res.status_code == 200

    # Verify present
    h1 = client.get("/api/analysis/history", headers=headers).json()
    assert h1["total"] == 3

    # Clear history
    clear_res = client.delete("/api/analysis/history/clear", headers=headers)
    assert clear_res.status_code == 200
    clear_data = clear_res.json()
    assert clear_data["status"] == "cleared"
    assert clear_data["deleted_count"] == 3

    # Verify history empty
    h2 = client.get("/api/analysis/history", headers=headers).json()
    assert h2["total"] == 0
    assert len(h2["analyses"]) == 0

