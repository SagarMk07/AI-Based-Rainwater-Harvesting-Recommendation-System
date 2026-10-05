# AI-Based Rainwater Harvesting Intelligence & Optimization System

An engineering-grade environmental intelligence system combining hydrological engineering principles, time-series machine learning, water-balance simulation, multi-criteria optimization, and real-world location intelligence to deliver transparent, data-driven rainwater harvesting recommendations.

---

## 1. Architectural Philosophy

A core rule of this system:

> **Do NOT use machine learning for calculations that can be accurately performed using engineering formulas.**

The system is partitioned into decoupled layers:
1. **Machine Learning Layer**:
   - **System Recommendation Classifier**: Pure NumPy Random Forest Classifier (94.9% accuracy, 0.9389 macro F1) trained on 5,400 balanced property records across four system types (`Storage Tank`, `Recharge Pit`, `Recharge Well`, `Hybrid System`).
   - **Time-Series Rainfall Predictor**: Autoregressive lag model forecasting 12-month precipitation curves from geographic coordinates and elevation.
2. **Deterministic Engineering Engine**:
   - Gross Harvest Potential: $V_{\text{gross}} = P \times A \times C$
   - Collectable Water: $V_{\text{collectable}} = V_{\text{gross}} \times \eta_{\text{filter}}$
   - Runoff Coefficients: RCC (0.85), Galvanized Sheet (0.90), Clay Tiles (0.80), Paver Blocks (0.70)
   - Dynamic Demand Modeling: Occupancy demand ($120\text{--}150\text{ L/person/day}$) calibrated to monthly calendar days.
3. **Simulation & Optimization Layer**:
   - 12-month iterative hydrological water balance simulation tracking inflows, storage states, supplied water, overflows, and deficits.
   - Multi-objective Pareto optimization across candidate storage capacities ($1{,}000\text{--}50{,}000\text{ L}$) with budget penalty constraints.
   - **Three-Tier Practical Sizing**:
     - *Minimum Practical*: Sized for 3–7 days buffer reserve during rain spells.
     - *Recommended Optimum*: Maximum demand coverage balancing capital payback (< 10 yrs).
     - *Upper Practical*: Marginal gain threshold ($\Delta \text{Coverage} < 2\% / 5{,}000\text{ L}$) where return sharply plateaus.
4. **Real-World Location Intelligence & Meteorology**:
   - **Live Telemetry & Reanalysis**: Open-Meteo ERA5 historical reanalysis (2021–2023) and high-resolution ECMWF 7-day precipitation forecasts (Zero API keys required).
   - **Offline Resilience**: Verified India Meteorological Department (IMD) 30-year climatological normals with nearest-station Haversine matching.
   - **Two-Tier Caching**: High-performance in-memory cache and persistent SQLite disk cache (`data/weather_cache.db`).
   - **Geocoding & Map Pinning**: Open-Meteo Geocoding API with local gazetteer fallback, draggable Leaflet map marker, and browser GPS geolocation.
   - **Seasonal Harvest Intelligence**: "When Can You Harvest the Most?" breakdown analyzing monsoon vs dry season yield splits.

---

## 2. Directory Structure

```
rainwater-ai/
├── backend/
│   ├── app/
│   │   ├── api/             # REST endpoints (full analysis, weather, geocoding, ML metrics)
│   │   ├── calculations/    # Deterministic engineering formulas (runoff, demand, water balance)
│   │   ├── database/        # SQLite cache & Supabase persistence with RLS
│   │   ├── ml/              # Pure NumPy inference models (AppLocker-safe)
│   │   ├── optimization/    # Multi-tier storage tank capacity optimization
│   │   ├── recommendations/ # Multi-criteria decision engine & explainability
│   │   ├── schemas/         # Pydantic v2 schemas for requests & responses
│   │   ├── services/        # WeatherService abstraction, Open-Meteo, IMD normals, geocoding
│   │   ├── utils/           # Logging & utility helpers
│   │   ├── config.py        # Pydantic Settings & environment variables
│   │   └── main.py          # FastAPI application entry point & CORS
│   └── requirements.txt     # Python backend dependencies
├── data/
│   ├── raw/                 # Raw rainfall & weather datasets
│   ├── processed/           # 5,400 synthetic balanced recommendation records
│   └── weather_cache.db     # Persistent SQLite cache for weather summaries
├── ml/
│   ├── models_core.py       # Pure NumPy Random Forest & Gradient Boosting implementations
│   ├── preprocessing.py     # Stateful preprocessor & feature encoder
│   ├── train_model.py       # 5-fold cross-validation & model training
│   ├── evaluate_model.py    # Evaluation reports & confusion matrix generation
│   └── models/              # Serialized model artifacts (.joblib, .json)
├── frontend/
│   ├── src/
│   │   ├── components/      # React components (ResultsDashboard, RainfallIntelligence, PropertyMap)
│   │   ├── layouts/         # RootLayout with persistent system state
│   │   ├── pages/           # HomePage, NotFoundPage
│   │   ├── services/        # Axios API client, typed analysis & geocoding services
│   │   ├── types/           # TypeScript interfaces
│   │   └── App.tsx          # React application root
│   ├── package.json
│   └── vite.config.ts       # Vite configuration with /api backend proxy
├── tests/
│   ├── test_api.py              # API endpoint integration tests
│   ├── test_calculations.py     # Deterministic hydrological formula tests
│   ├── test_ml_recommendations.py # ML inference & edge case tests
│   ├── test_weather.py          # Weather fallback & network failure tests
│   └── test_weather_service.py  # Phase 5 location intelligence 8 scenario suite
├── docs/
│   ├── architecture.md      # Detailed system architecture specifications
│   ├── ml-model.md          # Machine learning methodology & evaluation report
│   └── weather-data.md      # Real-world data & location intelligence guide
└── README.md
```

---

## 3. Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Running the Backend
1. From the repository root, create and install the Python environment:
   ```powershell
   py -3.11 -m venv .venv
   .\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
   ```
2. Start the FastAPI development server from the repository root:
   ```powershell
   .\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   Interactive Swagger API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### Running the Frontend
1. Open a new terminal in `frontend/`:
   ```powershell
   cd frontend
   npm ci
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

Keep both development servers running while using the app. Vite proxies `/api` requests to `http://localhost:8000`; if the dashboard reports a network error, confirm the backend is running and reachable at that address. To use a different API base URL, set `VITE_API_URL` before starting Vite.

---

## 4. Automated Test Suite

Run the backend unit and integration tests via pytest from the repository root:
```powershell
.\.venv\Scripts\python.exe -m pytest -v
```

### Verified Scenarios:
- **Exact Benchmark Test Case**: $200\,\text{m}^2 \times 900\,\text{mm} \times 0.85 = 153{,}000\,\text{L/yr}$.
- **Water Demand Benchmark**: $5 \times 120\,\text{L/day} = 600\,\text{L/day} \to 219{,}000\,\text{L/yr}$.
- **Storage Constraints**: Usable water bounded by physical tank capacity and monthly rainfall timing.
- **ML Probability Calibration**: Softmax probabilities sum to $1.0$; boundary edge cases tested (very small roof, large commercial roof, arid climate, high rainfall, zero open area, low budget).
- **Phase 5 Location Intelligence Suite**:
  1. High Rainfall Location (Kochi / Mumbai)
  2. Semi-Arid Location (Jaipur)
  3. Moderate Plateau Climate (Bengaluru)
  4. Invalid / Out-of-bounds Coordinates
  5. Simulated Network Failure & Timeout Fallback
  6. Geocoding & Reverse Geocoding Resolution
  7. Interactive Marker Drag & Recalculation
  8. Cache Hit vs Cache Miss Performance (< 50ms)

---

## 5. Completed Implementation Milestones

- [x] **Phase 1: Project Foundation & Clean Architecture**
- [x] **Phase 2: Core Engineering Calculations & Water Balance Engine**
- [x] **Phase 3: Premium UI/UX Environmental Design Overhaul**
- [x] **Phase 4: AI/ML Validation & Explainable Recommendation Engine**
- [x] **Phase 5: Real-World Data & Location Intelligence**
