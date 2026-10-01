"""Test health check and root endpoints."""

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Verify that root endpoint returns service metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "service" in data
    assert "version" in data
    assert data["health_endpoint"] == "/api/health"


def test_health_check_endpoint():
    """Verify that health check endpoint returns status ok and details."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "timestamp" in data
    assert "environment" in data
    assert "database" in data
    assert "pipelines" in data
    assert data["environment"]["app_name"] == "AI Rainwater Harvesting Intelligence & Optimization System"
    assert "connected" in data["database"]
    assert "data_pipeline" in data["pipelines"]
