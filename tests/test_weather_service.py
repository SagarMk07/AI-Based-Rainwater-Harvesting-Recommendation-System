"""Comprehensive Phase 5 Location Intelligence & Weather Service tests covering 8 specific scenarios."""

import pytest
import time
from unittest.mock import patch
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.services.weather_service import (
    CityRainfallProfile,
    WeatherService,
    OpenMeteoWeatherService,
    IMDFallbackWeatherService,
    CachedWeatherService,
    fetch_weather_for_location,
    get_weather_service,
    haversine_distance_km,
)
from backend.app.services.geocoding import geocode_location, reverse_geocode

client = TestClient(app)


# 1. TEST CASE 1: Valid high rainfall location (Mumbai / Kochi)
@pytest.mark.asyncio
async def test_high_rainfall_location_profile():
    """Verify high rainfall location (Kochi: ~3000 mm or Mumbai: ~2200 mm)."""
    # Test via service
    profile: CityRainfallProfile = await fetch_weather_for_location(city_name="Kochi", lat=9.9312, lon=76.2673)
    assert "Kochi" in profile.city
    assert profile.annual_rainfall_mm >= 2000.0
    assert len(profile.monthly_rainfall_mm) == 12
    # Verify wettest month is identified (Monsoon months: May, Jun, Jul, or Aug)
    assert profile.wettest_month in ["May", "Jun", "Jul", "Aug", "Sep"]
    assert profile.wet_season_rainfall_mm > profile.dry_season_rainfall_mm


# 2. TEST CASE 2: Valid low rainfall location (Jaipur / Arid region)
@pytest.mark.asyncio
async def test_low_rainfall_location_profile():
    """Verify arid / low rainfall location (Jaipur: ~600 mm)."""
    profile: CityRainfallProfile = await fetch_weather_for_location(city_name="Jaipur", lat=26.9124, lon=75.7873)
    assert "Jaipur" in profile.city
    assert 400.0 <= profile.annual_rainfall_mm <= 850.0
    assert len(profile.monthly_rainfall_mm) == 12
    # Rainy days should be lower in semi-arid zones
    if profile.rainy_days_count is not None:
        assert profile.rainy_days_count < 60


# 3. TEST CASE 3: Valid moderate rainfall location (Bengaluru)
@pytest.mark.asyncio
async def test_moderate_rainfall_location_profile():
    """Verify moderate rainfall plateau climate (Bengaluru: ~900-1100 mm)."""
    profile: CityRainfallProfile = await fetch_weather_for_location(city_name="Bengaluru", lat=12.9716, lon=77.5946)
    assert "Bengaluru" in profile.city
    assert 800.0 <= profile.annual_rainfall_mm <= 1400.0
    assert len(profile.monthly_rainfall_mm) == 12
    assert profile.variability_cv is not None
    assert profile.variability_cv > 0.0


# 4. TEST CASE 4: Invalid coordinates or unmapped location
@pytest.mark.asyncio
async def test_invalid_location_handling():
    """Verify that physically invalid or out-of-range coordinates trigger smooth fallback to national benchmark."""
    # Out of range coordinates that fail external API validation
    profile: CityRainfallProfile = await fetch_weather_for_location(city_name="InvalidCoordPlace", lat=999.0, lon=999.0)
    assert profile is not None
    assert profile.annual_rainfall_mm > 0
    assert len(profile.monthly_rainfall_mm) == 12
    assert profile.is_fallback is True
    assert profile.warning_notice is not None


# 5. TEST CASE 5: External API failure / network timeout -> smooth fallback to IMD normals
@pytest.mark.asyncio
async def test_external_api_timeout_fallback():
    """Verify that network exceptions trigger IMD normals fallback with explicit notice."""
    fresh_service = CachedWeatherService(ttl_seconds=1)
    fresh_service._memory_cache.clear()

    with patch("httpx.AsyncClient.get", side_effect=Exception("Timeout connecting to Open-Meteo")):
        profile = await fresh_service.get_rainfall_summary(lat=13.0827, lon=80.2707, city_name="Chennai_Test_Timeout")
        assert profile.is_fallback is True
        assert "IMD" in profile.weather_source
        assert profile.warning_notice is not None
        assert "IMD" in profile.warning_notice or "offline" in profile.warning_notice.lower()


# 6. TEST CASE 6: Geocoding and Reverse Geocoding resolution
@pytest.mark.asyncio
async def test_geocoding_and_reverse_geocoding():
    """Verify geocoding endpoint resolves city names to coordinates, and reverse geocoding finds nearest station."""
    # Geocoding search
    results = await geocode_location("Jaipur")
    assert len(results) >= 1
    first = results[0]
    assert "Jaipur" in first["name"]
    assert 25.0 <= first["latitude"] <= 28.0
    assert 74.0 <= first["longitude"] <= 77.0

    # Reverse geocoding for coordinates near Bengaluru
    rev = await reverse_geocode(12.98, 77.60)
    assert rev["city"] == "Bengaluru"
    assert rev["distance_to_station_km"] < 20.0


# 7. TEST CASE 7: Moving map marker updates location & recalculates sizing tiers
def test_marker_drag_and_sizing_tiers_recalculation():
    """Verify that sending different coordinates to /api/analyze updates weather and sizing tiers."""
    # Scenario 1: Jaipur coordinates (arid)
    payload_jaipur = {
        "city": "Jaipur",
        "latitude": 26.91,
        "longitude": 75.78,
        "roof_area_sqm": 200,
        "roof_type": "rcc",
        "occupants": 4,
        "daily_demand_litres": 500,
        "soil_type": "loamy",
        "open_area_sqm": 40,
    }
    res1 = client.post("/api/analyze", json=payload_jaipur)
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["weather"]["annual_rainfall_mm"] <= 900.0
    assert "sizing_tiers" in data1
    assert "minimum" in data1["sizing_tiers"]
    assert "recommended" in data1["sizing_tiers"]
    assert "upper_practical" in data1["sizing_tiers"]
    assert data1["sizing_tiers"]["minimum"]["capacity_litres"] <= data1["sizing_tiers"]["recommended"]["capacity_litres"]

    # Scenario 2: Mumbai coordinates (monsoon heavy)
    payload_mumbai = {
        "city": "Mumbai",
        "latitude": 18.92,
        "longitude": 72.83,
        "roof_area_sqm": 200,
        "roof_type": "rcc",
        "occupants": 4,
        "daily_demand_litres": 500,
        "soil_type": "loamy",
        "open_area_sqm": 40,
    }
    res2 = client.post("/api/analyze", json=payload_mumbai)
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["weather"]["annual_rainfall_mm"] >= 2000.0
    assert data2["recommendation"]["annual_gross_harvest_litres"] > data1["recommendation"]["annual_gross_harvest_litres"]


# 8. TEST CASE 8: Cache hit vs Cache miss verification
@pytest.mark.asyncio
async def test_weather_cache_hit_performance():
    """Verify that cached weather queries execute faster and return identical data."""
    service = get_weather_service()
    lat, lon = 17.3850, 78.4867  # Hyderabad

    # First call (may hit API or populate cache)
    t0 = time.perf_counter()
    p1 = await service.get_rainfall_summary(lat=lat, lon=lon, city_name="Hyderabad")
    duration1 = time.perf_counter() - t0

    # Second call (guaranteed in-memory cache hit)
    t1 = time.perf_counter()
    p2 = await service.get_rainfall_summary(lat=lat, lon=lon, city_name="Hyderabad")
    duration2 = time.perf_counter() - t1

    assert p1.annual_rainfall_mm == p2.annual_rainfall_mm
    assert p1.monthly_rainfall_mm == p2.monthly_rainfall_mm
    # Cache hit should be sub-millisecond or much faster than remote fetch
    assert duration2 < 0.05
