"""Unit tests verifying weather service abstraction, IMD fallbacks, and network resilience."""

import pytest
from unittest.mock import patch
from backend.app.services.weather_service import (
    CityRainfallProfile,
    IMDFallbackWeatherService,
    OpenMeteoWeatherService,
    CachedWeatherService,
    fetch_weather_for_location,
)


@pytest.mark.asyncio
async def test_imd_fallback_service_directly():
    """Verify that IMDFallbackWeatherService uses verified IMD 30-year normals.
    
    Checks:
    1. Returns correct IMD climatological normal rainfall.
    2. Flags is_fallback = True and includes transparent disclosure notice.
    3. Provides 12 monthly rainfall values.
    """
    fallback_svc = IMDFallbackWeatherService()
    profile: CityRainfallProfile = await fallback_svc.get_rainfall_summary(lat=12.97, lon=77.59, city_name="Bengaluru")

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
    
    The CachedWeatherService must catch the exception, fall back to offline IMD dataset,
    and notify the user.
    """
    # Create isolated fresh service without prior cache
    fresh_service = CachedWeatherService(ttl_seconds=1)
    fresh_service._memory_cache.clear()

    with patch("httpx.AsyncClient.get", side_effect=Exception("Connection timed out")):
        profile: CityRainfallProfile = await fresh_service.get_rainfall_summary(lat=18.92, lon=72.83, city_name="Mumbai_Offline_Test")

        assert "Mumbai" in profile.city or "Offline" in profile.city
        assert profile.annual_rainfall_mm == 2213.0
        assert profile.is_fallback is True
        assert "IMD" in profile.weather_source
        assert profile.warning_notice is not None


@pytest.mark.asyncio
async def test_unknown_location_fallback():
    """Verify that an unknown town falls back to National Average benchmark gracefully."""
    fallback_svc = IMDFallbackWeatherService()
    profile: CityRainfallProfile = await fallback_svc.get_rainfall_summary(lat=20.0, lon=78.0, city_name="UnknownRuralTown123")

    assert profile.is_fallback is True
    assert profile.annual_rainfall_mm == 1050.0
    assert len(profile.monthly_rainfall_mm) == 12
    assert profile.warning_notice is not None
