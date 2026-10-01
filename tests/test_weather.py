"""Unit tests verifying Step 8 weather API resilience and graceful fallback behavior."""

import pytest
from unittest.mock import patch, AsyncMock
from backend.app.services.weather import fetch_city_weather, CityRainfallProfile


@pytest.mark.asyncio
async def test_weather_fallback_when_api_key_missing():
    """Verify that when no live API key is provided, the service uses IMD historical normals.
    
    Checks:
    1. Detects absence / failure of live API.
    2. Does NOT crash.
    3. Uses explicitly defined IMD climatological normal database.
    4. Explicitly flags is_fallback = True and displays a warning notice.
    5. Does NOT falsely claim live data.
    """
    profile: CityRainfallProfile = await fetch_city_weather("Bengaluru")
    
    assert profile.city == "Bengaluru"
    assert profile.annual_rainfall_mm == 924.0
    assert len(profile.monthly_rainfall_mm) == 12
    assert profile.is_fallback is True
    assert "IMD" in profile.weather_source
    assert profile.warning_notice is not None
    assert "IMD" in profile.warning_notice or "fallback" in profile.warning_notice.lower()


@pytest.mark.asyncio
async def test_weather_api_network_failure_handling():
    """Simulate network timeout / HTTP failure from live weather API.
    
    The application must catch the exception, fall back to offline IMD dataset,
    and notify the user.
    """
    with patch("httpx.AsyncClient.get", side_effect=Exception("Connection timed out")):
        with patch("backend.app.config.settings.OPENWEATHER_API_KEY", "dummy_test_key_123"):
            profile: CityRainfallProfile = await fetch_city_weather("Mumbai")
            
            assert profile.city == "Mumbai"
            assert profile.annual_rainfall_mm == 2213.0
            assert profile.is_fallback is True
            assert "IMD" in profile.weather_source
            assert profile.warning_notice is not None


@pytest.mark.asyncio
async def test_unknown_location_fallback():
    """Verify that an unknown town falls back to National Average benchmark gracefully."""
    profile: CityRainfallProfile = await fetch_city_weather("UnknownRuralTown123")
    
    assert profile.is_fallback is True
    assert profile.annual_rainfall_mm == 1050.0
    assert len(profile.monthly_rainfall_mm) == 12
    assert profile.warning_notice is not None
