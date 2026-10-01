# System Architecture & Technical Specifications

## 1. Overview

The **AI-Based Rainwater Harvesting Intelligence & Optimization System** is an engineering-grade full-stack environmental intelligence platform designed to deliver defensible, mathematically validated, and data-driven rainwater harvesting recommendations.

Rather than relying on naive heuristic calculators or treating simple formulas as "AI", the system enforces a strict separation of concerns across four analytical domains:

```
+------------------------------------------------------------------------------------+
|                                    USER INTERFACE                                  |
|         Multi-step Input Wizard | Interactive Analytics | Engineering Dashboard    |
+------------------------------------------+-----------------------------------------+
                                           |
                                           v
+------------------------------------------------------------------------------------+
|                               FASTAPI BACKEND SERVICE                              |
+------------------------------------------------------------------------------------+
      |                       |                       |                      |
      v                       v                       v                      v
+------------+       +-----------------+     +-----------------+    +-----------------+
| A. ML      |       | B. ENGINEERING  |     | C. OPTIMIZATION |    | D. RECOMMENDER  |
| FORECAST   |       | CALCULATIONS    |     | ENGINE          |    | ENGINE          |
+------------+       +-----------------+     +-----------------+    +-----------------+
| Rainfall   |       | - Runoff Vol    |     | - Candidate     |    | - Strategy      |
| Time-Series|       | - Demand Model  |     |   Simulation    |    |   Selection     |
| Random     |       | - Usable Water  |     | - Multi-Obj     |    | - Trade-off     |
| Forest     |       | - Water-Balance |     |   Scoring       |    |   Explanation   |
| Baseline LR|       |   (12-mo cycle) |     | - Tank Capacity |    | - Cost/Payback  |
+------------+       +-----------------+     +-----------------+    +-----------------+
```

---

## 2. Core Architectural Pillars

### A. Machine Learning (Data-Driven Forecasting)
- Used strictly for uncertain, weather-driven time-series forecasting.
- Chronologically validated historical rainfall modeling (Linear Regression baseline + Random Forest Regressor).
- Genuine feature engineering (lags, rolling statistics, seasonal indices) strictly avoiding data leakage.
- Reports real metrics (MAE, RMSE, R²) and uncertainty bounds rather than arbitrary confidence scores.

### B. Engineering Calculations (Deterministic Modeling)
- Adheres to standard hydrological and civil engineering principles:
  $$\text{Harvested Volume (L)} = \text{Rainfall (mm)} \times \text{Roof Area (m}^2\text{)} \times \text{Runoff Coefficient} \times \text{Collection Efficiency}$$
- Rigorous separation of:
  - **Gross Harvest Potential**: Total theoretical runoff.
  - **Collectable Water**: Runoff after first-flush diversion and gutter efficiencies.
  - **Usable Harvested Water**: Water captured subject to dynamic monthly storage constraints.
- Water Demand model supporting occupants $\times$ per-capita consumption or direct input override without double-counting.

### C. Water-Balance Simulation & Tank Optimization
- 12-month iterative simulation tracking:
  $$\text{Storage}_t = \min\big(\text{Storage}_{t-1} + \text{Inflow}_t - \text{Supplied}_t, \; \text{Capacity}\big)$$
  $$\text{Overflow}_t = \max\big(\text{Storage}_{t-1} + \text{Inflow}_t - \text{Supplied}_t - \text{Capacity}, \; 0\big)$$
  $$\text{Shortage}_t = \max\big(\text{Demand}_t - \text{Supplied}_t, \; 0\big)$$
- Multi-candidate capacity simulation ($500\,\text{L}$ to $50,000\,\text{L}$) evaluated with a transparent penalized objective function balancing shortage, overflow, utilization, and budget.

### D. Recommendation & Explainable AI
- Dynamic synthesis of site constraints (soil infiltration, open area, groundwater condition, existing borewell/storage) to select between Rooftop Storage, Recharge Pit, Recharge Trench, Recharge Well, or Hybrid configurations.
- Transparent justification derived directly from water-balance numbers.
- Feature importance attribution for ML models.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, React Router |
| **Backend API** | FastAPI, Pydantic v2, Pydantic Settings, Uvicorn, Python 3.11 |
| **Data & ML** | NumPy, Pandas, Scikit-Learn, Joblib |
| **Database** | Supabase PostgreSQL with offline guest fallback |
| **Testing** | Pytest, Pytest-Asyncio, HTTPX |
| **DevOps** | Docker, Docker Compose, Git |

---

## 4. Phase Breakdown

- **Phase 1 (Active)**: Project Foundation, clean directory structure, FastAPI backend, Vite+React+TS frontend, configuration, database connection manager, health check API, and frontend-backend connectivity verification.
- **Phase 2**: Data pipeline, dataset ingestion, validation, cleaning, feature engineering, and data quality reporting.
- **Phase 3**: Machine learning rainfall forecasting models, chronological validation, evaluation metrics, and model persistence.
- **Phase 4**: Rainwater harvesting deterministic engine, runoff coefficients, collection efficiencies, and water demand modeling.
- **Phase 5**: Monthly water-balance simulation engine.
- **Phase 6**: Storage tank multi-candidate capacity simulation and optimization.
- **Phase 7**: Site suitability engineering analysis.
- **Phase 8**: Holistic recommendation engine.
- **Phase 9**: Regional cost estimation, financial savings, and payback period calculation.
- **Phase 10**: Explainable AI and dynamic rationale generator.
- **Phase 11**: Production REST API endpoints with Pydantic validation.
- **Phase 12**: Database persistence schemas and Supabase authentication.
- **Phase 13**: Responsive multi-step wizard, interactive dashboards, and analytics UI.
- **Phase 14**: End-to-end integration and telemetry.
- **Phase 15**: Automated test suite (unit, integration, regression).
- **Phase 16**: Polish, accessibility, documentation, and viva preparation.
