"""Geocoding and reverse geocoding service with live Open-Meteo search and offline local gazetteer fallback."""

import httpx
from typing import List, Dict, Any, Optional
from backend.app.services.weather_service import (
    IMD_HISTORICAL_NORMALS,
    DEFAULT_NATIONAL_PROFILE,
    haversine_distance_km,
)
from backend.app.utils.logger import logger

# Extended regional gazetteer for offline resilience across India
EXTENDED_INDIAN_GAZETTEER: List[Dict[str, Any]] = [
    {"name": "Bengaluru", "state": "Karnataka", "country": "India", "latitude": 12.9716, "longitude": 77.5946, "elevation": 920.0},
    {"name": "Mumbai", "state": "Maharashtra", "country": "India", "latitude": 18.9220, "longitude": 72.8347, "elevation": 14.0},
    {"name": "Delhi", "state": "NCR", "country": "India", "latitude": 28.6139, "longitude": 77.2090, "elevation": 216.0},
    {"name": "Chennai", "state": "Tamil Nadu", "country": "India", "latitude": 13.0827, "longitude": 80.2707, "elevation": 7.0},
    {"name": "Hyderabad", "state": "Telangana", "country": "India", "latitude": 17.3850, "longitude": 78.4867, "elevation": 542.0},
    {"name": "Pune", "state": "Maharashtra", "country": "India", "latitude": 18.5204, "longitude": 73.8567, "elevation": 560.0},
    {"name": "Jaipur", "state": "Rajasthan", "country": "India", "latitude": 26.9124, "longitude": 75.7873, "elevation": 431.0},
    {"name": "Kolkata", "state": "West Bengal", "country": "India", "latitude": 22.5726, "longitude": 88.3639, "elevation": 9.0},
    {"name": "Kochi", "state": "Kerala", "country": "India", "latitude": 9.9312, "longitude": 76.2673, "elevation": 4.0},
    {"name": "Ahmedabad", "state": "Gujarat", "country": "India", "latitude": 23.0225, "longitude": 72.5714, "elevation": 53.0},
    {"name": "Lucknow", "state": "Uttar Pradesh", "country": "India", "latitude": 26.8467, "longitude": 80.9462, "elevation": 123.0},
    {"name": "Chandigarh", "state": "Punjab/Haryana", "country": "India", "latitude": 30.7333, "longitude": 76.7794, "elevation": 321.0},
    {"name": "Bhopal", "state": "Madhya Pradesh", "country": "India", "latitude": 23.2599, "longitude": 77.4126, "elevation": 527.0},
    {"name": "Patna", "state": "Bihar", "country": "India", "latitude": 25.5941, "longitude": 85.1376, "elevation": 53.0},
    {"name": "Guwahati", "state": "Assam", "country": "India", "latitude": 26.1445, "longitude": 91.7362, "elevation": 55.0},
    {"name": "Visakhapatnam", "state": "Andhra Pradesh", "country": "India", "latitude": 17.6868, "longitude": 83.2185, "elevation": 45.0},
    {"name": "Coimbatore", "state": "Tamil Nadu", "country": "India", "latitude": 11.0168, "longitude": 76.9558, "elevation": 411.0},
    {"name": "Nagpur", "state": "Maharashtra", "country": "India", "latitude": 21.1458, "longitude": 79.0882, "elevation": 310.0},
    {"name": "Indore", "state": "Madhya Pradesh", "country": "India", "latitude": 22.7196, "longitude": 75.8577, "elevation": 553.0},
    {"name": "Thiruvananthapuram", "state": "Kerala", "country": "India", "latitude": 8.5241, "longitude": 76.9366, "elevation": 10.0},
]


async def geocode_location(query: str, timeout_sec: float = 3.5) -> List[Dict[str, Any]]:
    """Geocode a search query to a list of matching geographical locations.
    
    Tries Open-Meteo Geocoding API first. Falls back to local Indian gazetteer if network is offline or no result found.
    """
    clean_query = query.strip()
    if not clean_query:
        return []

    # 1. Attempt live Open-Meteo geocoding
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={clean_query}&count=6&language=en&format=json"
    try:
        async with httpx.AsyncClient(timeout=timeout_sec) as client:
            res = await client.get(url)
            if res.status_code == 200:
                data = res.json()
                results = data.get("results", [])
                if results:
                    return [
                        {
                            "name": item.get("name", clean_query),
                            "state": item.get("admin1", ""),
                            "country": item.get("country", ""),
                            "latitude": item.get("latitude"),
                            "longitude": item.get("longitude"),
                            "elevation": item.get("elevation", 0.0),
                            "source": "Open-Meteo Geocoding",
                        }
                        for item in results
                    ]
    except Exception as exc:
        logger.warning(f"Live geocoding request failed for '{clean_query}': {exc}. Using local gazetteer.")

    # 2. Local fallback matching
    q_lower = clean_query.lower()
    matches = []
    for entry in EXTENDED_INDIAN_GAZETTEER:
        if q_lower in entry["name"].lower() or entry["name"].lower() in q_lower:
            item = dict(entry)
            item["source"] = "Local Gazetteer (Offline Fallback)"
            matches.append(item)

    if matches:
        return matches

    # Default fallback to India centroid if completely unmatched
    return [
        {
            "name": clean_query.title(),
            "state": "Region",
            "country": "India",
            "latitude": DEFAULT_NATIONAL_PROFILE["latitude"],
            "longitude": DEFAULT_NATIONAL_PROFILE["longitude"],
            "elevation": 300.0,
            "source": "Default Benchmark Fallback",
        }
    ]


async def reverse_geocode(lat: float, lon: float) -> Dict[str, Any]:
    """Find the nearest known town or station for given latitude and longitude coordinates."""
    best_entry = None
    min_dist = float("inf")

    for entry in EXTENDED_INDIAN_GAZETTEER:
        dist = haversine_distance_km(lat, lon, entry["latitude"], entry["longitude"])
        if dist < min_dist:
            min_dist = dist
            best_entry = entry

    if best_entry:
        return {
            "city": best_entry["name"],
            "state": best_entry["state"],
            "country": best_entry["country"],
            "latitude": lat,
            "longitude": lon,
            "nearest_station": best_entry["name"],
            "distance_to_station_km": round(min_dist, 1),
        }

    return {
        "city": f"Location ({lat:.2f}°, {lon:.2f}°)",
        "state": "India",
        "country": "India",
        "latitude": lat,
        "longitude": lon,
        "nearest_station": "National Benchmark",
        "distance_to_station_km": 0.0,
    }
