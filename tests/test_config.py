"""Test application configuration loading and validation."""

from backend.app.config import Settings


def test_default_settings():
    """Verify that default settings load with expected attributes."""
    settings = Settings()
    assert settings.APP_NAME == "AI Rainwater Harvesting Intelligence & Optimization System"
    assert settings.API_V1_STR == "/api"
    assert settings.PORT == 8000
    assert isinstance(settings.CORS_ORIGINS, list)
    assert len(settings.CORS_ORIGINS) > 0


def test_cors_origins_parsing():
    """Verify CORS origins string is parsed into a list."""
    settings = Settings(CORS_ORIGINS="http://localhost:5173, http://example.com")
    assert "http://localhost:5173" in settings.CORS_ORIGINS
    assert "http://example.com" in settings.CORS_ORIGINS
