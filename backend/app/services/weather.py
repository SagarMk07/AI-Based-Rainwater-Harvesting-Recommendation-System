"""Weather service module maintaining full backwards compatibility while delegating to WeatherService abstraction."""

from typing import Dict, List, Optional, Any
from backend.app.services.weather_service import (
    CityRainfallProfile,
    IMD_HISTORICAL_NORMALS,
    DEFAULT_NATIONAL_PROFILE,
    WeatherService,
    OpenMeteoWeatherService,
    IMDFallbackWeatherService,
    CachedWeatherService,
    get_weather_service,
    fetch_weather_for_location,
    haversine_distance_km,
)


async def fetch_city_weather(city_name: str, force_live: bool = False) -> CityRainfallProfile:
    """Fetch rainfall and weather data for a city using the cached WeatherService abstraction.
    
    Tries Open-Meteo live ERA5 telemetry and forecast. If unavailable, falls back cleanly
    to the verified IMD climatological normal dataset with transparent disclosure.
    """
    return await fetch_weather_for_location(city_name=city_name, force_live=force_live)
