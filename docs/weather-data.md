# Real-World Data & Location Intelligence Architecture

## 1. Overview & Architectural Principles

The RainHarvest AI system transitions rainwater harvesting analysis from static demonstrations into an **engineering-grade, location-intelligent platform** driven by real-world environmental and meteorological records.

### Core Architectural Principles
1. **Never Fabricate Data**: Environmental inputs must reflect verified meteorological observations or peer-reviewed reanalysis datasets.
2. **Provider-Agnostic Abstraction**: The core application logic does not couple to any single proprietary weather vendor; all weather interactions flow through an extensible `WeatherService` abstract base class.
3. **Graceful Fallback & Transparent Disclosure**: If an external telemetry API times out, rate limits, or is unreachable, the system automatically falls back to verified India Meteorological Department (IMD) 30-year climatological normal datasets while explicitly disclosing the fallback status to the user.
4. **Persistent Two-Tier Caching**: Repeated queries for the same geographic coordinates or municipal regions are served from high-performance in-memory and SQLite disk caches with configurable TTLs.
5. **Standardized Engineering Units**:
   - Precipitation: Millimeters ($\text{mm}$)
   - Catchment Area: Square Metres ($\text{m}^2$)
   - Water Volumes: Litres ($\text{L}$)
   - Temperature: Degrees Celsius ($^\circ\text{C}$)
   - Relative Humidity: Percentage ($\%$)

---

## 2. Weather Service Abstraction (`WeatherService`)

Defined in [`backend/app/services/weather_service.py`](file:///e:/EVS/backend/app/services/weather_service.py):

```python
class WeatherService(ABC):
    @abstractmethod
    async def get_current_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        """Retrieve real-time temperature, humidity, and current precipitation."""
        pass

    @abstractmethod
    async def get_forecast(self, lat: float, lon: float, days: int = 7) -> Dict[str, Any]:
        """Retrieve short-term daily precipitation forecast."""
        pass

    @abstractmethod
    async def get_historical_rainfall(self, lat: float, lon: float, start_year: int, end_year: int) -> Dict[str, Any]:
        """Retrieve multi-year daily precipitation reanalysis records."""
        pass

    @abstractmethod
    async def get_rainfall_summary(self, lat: float, lon: float, city_name: Optional[str] = None) -> CityRainfallProfile:
        """Produce standardized CityRainfallProfile combining historical reanalysis and current conditions."""
        pass
```

### Implementations

| Implementation | Purpose | Data Source | Key Requirement |
| :--- | :--- | :--- | :--- |
| `OpenMeteoWeatherService` | Live telemetry & historical reanalysis | Open-Meteo ERA5 & ECMWF | Zero API Keys (Free Open Access) |
| `IMDFallbackWeatherService` | Deterministic offline backup | IMD 30-Year Climatological Normals | 100% Offline Resilience |
| `CachedWeatherService` | Two-tier caching & automatic failover | Memory + SQLite (`data/weather_cache.db`) | Automatic Failover Wrapper |

---

## 3. Data Providers

### A. Open-Meteo ERA5 Reanalysis & Live Forecast
- **Historical Climate**: Daily precipitation series over multi-year spans (2021–2023) derived from the European Centre for Medium-Range Weather Forecasts (ECMWF) ERA5 reanalysis dataset.
- **Monthly Normal Aggregation**: Daily precipitation records are grouped by calendar month across all available historical years to derive calibrated 12-month precipitation normals, annual totals, and rainfall variability.
- **Rainy Days Metric**: Quantified using the meteorological standard:
  $$\text{Rainy Day} \iff P_{\text{daily}} \ge 2.5\text{ mm}$$
- **Variability Index (Coefficient of Variation)**:
  $$CV = \frac{\sigma}{\mu} = \frac{\sqrt{\frac{1}{12}\sum_{i=1}^{12}(P_i - \bar{P})^2}}{\bar{P}}$$
- **Short-Term Forecast**: 7-day daily precipitation summation ($P_{\text{sum}}$) and daily temperature extremes ($T_{\text{max}}, T_{\text{min}}$).

### B. India Meteorological Department (IMD) 30-Year Climatological Normals
- Station normals spanning primary urban agro-climatic zones across India:
  - **Arid / Low Rainfall**: Jaipur (602 mm), Ahmedabad (782 mm), Delhi (797 mm)
  - **Plateau / Moderate Rainfall**: Pune (741 mm), Hyderabad (812 mm), Bengaluru (924 mm)
  - **High Rainfall Coastal / Monsoon**: Chennai (1382 mm), Kolkata (1735 mm), Mumbai (2213 mm), Kochi (3014 mm)
- **Nearest-Station Haversine Matching**: When coordinates are supplied in fallback mode, the system calculates great-circle distances:
  $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
  to link the user's property with the closest verified meteorological station.

---

## 4. Location Intelligence & Geocoding Pipeline

Implemented in [`backend/app/services/geocoding.py`](file:///e:/EVS/backend/app/services/geocoding.py):
1. **Interactive Geocoding (`GET /api/location/geocode?q=...`)**:
   - Queries Open-Meteo Geocoding API with 3.5s timeout.
   - Resolves locality name, district/state, country, latitude, longitude, and elevation.
   - Falls back instantly to the local Indian Gazetteer if offline.
2. **Reverse Geocoding (`GET /api/location/reverse?lat=...&lon=...`)**:
   - Resolves latitude and longitude coordinates into the nearest named urban center and meteorological station.
3. **Browser Geolocation ("Use My Location")**:
   - `navigator.geolocation.getCurrentPosition` in the frontend acquires GPS coordinates.
   - Explicitly handles permission denial (`PERMISSION_DENIED`), timeout, and position unavailability, offering seamless manual override.

---

## 5. Monthly Harvest Modeling & Seasonality Intelligence

For any catchment surface, monthly water harvest is computed deterministically:
$$V_{\text{harvest}, m} = P_m \times A_{\text{roof}} \times C_{\text{runoff}} \times \eta_{\text{filter}}$$

Where:
- $V_{\text{harvest}, m}$: Collectable water in month $m$ (Litres)
- $P_m$: Precipitation depth in month $m$ (mm)
- $A_{\text{roof}}$: Projected rooftop catchment area ($\text{m}^2$)
- $C_{\text{runoff}}$: Runoff coefficient (e.g. 0.85 for RCC, 0.90 for metal sheets)
- $\eta_{\text{filter}}$: Conveyance and first-flush filtration efficiency (typically 0.90)

### Seasonal Yield Breakdown ("When Can You Harvest the Most?")
- **Wet Season Harvest**: Sum of collectable runoff during the 4 consecutive months with maximum cumulative rainfall (the core monsoon window).
- **Dry Season Harvest**: Total annual harvest minus wet season harvest.
- **Seasonal Window Rationale**: In regions like Mumbai, 90%+ of total annual rainfall arrives between June and September; sizing storage tanks to capture the entire dry season deficit is economically impractical. Surpluses must be directed toward artificial groundwater recharge.

---

## 6. Practical Storage Sizing Tiers

Implemented in [`backend/app/optimization/storage_optimizer.py`](file:///e:/EVS/backend/app/optimization/storage_optimizer.py):

| Sizing Tier | Engineering Sizing Rule | Purpose & Trade-off |
| :--- | :--- | :--- |
| **Minimum Practical** | Sized for 3–7 days of daily demand (min 1,000 L) | Low-capital entry-level buffer for immediate household resilience during brief dry spells. |
| **Recommended Optimum** | Multi-objective Pareto optimal point | Maximizes annual demand coverage while maintaining an attractive payback period (< 10 years). |
| **Upper Practical** | Marginal gain threshold ($\Delta \text{Coverage} < 2\% / 5{,}000\text{ L}$) | Captures peak monsoon surges into dry seasons; beyond this volume, capital return sharply diminishes. |

---

## 7. Test Case Verification Suite

Documented and verified in [`tests/test_weather_service.py`](file:///e:/EVS/tests/test_weather_service.py):

1. **High Rainfall Zone**: Kochi verified at $\ge 2{,}000\text{ mm}$ with monsoon peak identification.
2. **Low Rainfall / Arid Zone**: Jaipur verified in semi-arid range ($400\text{--}850\text{ mm}$) with lower rainy day count.
3. **Moderate Rainfall Zone**: Bengaluru verified in plateau range ($800\text{--}1{,}400\text{ mm}$) with variability calculation.
4. **Invalid Coordinates**: Out-of-bounds coordinates ($999^\circ\text{N}, 999^\circ\text{E}$) fail external API validation and trigger clean fallback to national benchmark with disclosure notice.
5. **Network Failure / Timeout**: Simulated `ConnectTimeout` triggers fallback to IMD normals with explicit notice.
6. **Geocoding & Reverse Geocoding**: Validated coordinate resolution and nearest station distance calculation.
7. **Marker Drag & Recalculation**: Sizing tiers and gross harvest dynamically adapt when coordinates shift between arid and high-rainfall zones.
8. **Cache Hit Performance**: Second query to cached coordinates returns identical data in sub-millisecond time.
