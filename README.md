# AI-Based Rainwater Harvesting Intelligence & Optimization System

An engineering-grade environmental intelligence system combining hydrological engineering principles, time-series machine learning, water-balance simulation, and multi-criteria optimization to deliver transparent, data-driven rainwater harvesting recommendations.

---

## 1. Architectural Philosophy

A core rule of this system:

> **Do NOT use machine learning for calculations that can be accurately performed using engineering formulas.**

The system is partitioned into four decoupled modules:
1. **Machine Learning**: Applied strictly to uncertain, weather-driven time-series forecasting (historical rainfall estimation using chronological splits, Random Forest, and Linear Regression baseline).
2. **Engineering Calculations**: Applied to deterministic physical formulas (Gross Harvest Potential, Collectable Water, Usable Water, Runoff Coefficients, Occupancy Demand).
3. **Simulation & Optimization**: 12-month iterative water-balance simulation across candidate storage capacities ($500\,\text{L}$ to $50,000\,\text{L}$) evaluated against shortage, overflow, utilization, and budget penalties.
4. **Recommendation Engine**: Multi-criteria synthesis evaluating storage vs recharge (pits, trenches, wells, hybrid) with dynamic explanations and cost-benefit trade-offs.

---

## 2. Project Directory Structure

```
rainwater-ai/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers (health, future analyze, optimize, etc.)
│   │   ├── calculations/    # Deterministic engineering formulas (Phase 4)
│   │   ├── database/        # Supabase / DB connection manager with offline fallback
│   │   ├── ml/              # Machine learning inference pipelines (Phase 3)
│   │   ├── optimization/    # Storage tank optimization algorithms (Phase 6)
│   │   ├── recommendations/ # Multi-criteria decision engine (Phase 8)
│   │   ├── schemas/         # Pydantic v2 schemas for requests & responses
│   │   ├── services/        # Business logic & weather services (Phase 2 & 11)
│   │   ├── utils/           # Logging & utility helpers
│   │   ├── config.py        # Pydantic Settings & environment variables
│   │   └── main.py          # FastAPI application entry point & CORS
│   └── requirements.txt     # Python backend dependencies
├── data/
│   ├── raw/                 # Raw rainfall & weather datasets
│   └── processed/           # Cleaned & feature-engineered data
├── ml/
│   ├── training/            # Model training & hyperparameter search
│   ├── models/              # Serialized models (.joblib) & metadata
│   └── evaluation/          # Chronological test split metrics (MAE, RMSE, R²)
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components (Navbar, Footer, StatusCard)
│   │   ├── layouts/         # RootLayout with health state injection
│   │   ├── pages/           # HomePage, NotFoundPage, future Wizard & Dashboards
│   │   ├── services/        # Axios API client & typed services
│   │   ├── hooks/           # useHealth and reactive data hooks
│   │   ├── types/           # TypeScript interfaces
│   │   ├── utils/           # Tailwind class merging & formatting utilities
│   │   ├── App.tsx          # React Router entry point
│   │   └── main.tsx         # React DOM mount
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts       # Vite configuration with /api backend proxy
├── tests/
│   ├── test_config.py       # Configuration unit tests
│   └── test_health.py       # Health check & root API unit tests
├── docs/
│   └── architecture.md      # Detailed system architecture specifications
├── .env.example             # Documented environment variables template
├── .gitignore               # Multi-language gitignore
├── docker-compose.yml       # Production container orchestration
└── README.md                # Project documentation
```

---

## 3. Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm

### Backend Setup
1. Create and activate a Python virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
2. Install dependencies:
   ```powershell
   python -m pip install -r backend/requirements.txt
   ```
3. Copy environment settings:
   ```powershell
   copy .env.example .env
   ```
4. Start the FastAPI development server:
   ```powershell
   python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   Interactive API docs are available at [http://localhost:8000/docs](http://localhost:8000/docs).

### Frontend Setup
1. Navigate to the frontend directory:
   ```powershell
   cd frontend
   npm install
   ```
2. Start the Vite development server:
   ```powershell
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 4. Running Automated Tests

Run the test suite via pytest:
```powershell
.\.venv\Scripts\python.exe -m pytest -v
```

---

## 5. Implementation Roadmap

- [x] **Phase 1: Project Foundation** (Current)
- [ ] **Phase 2: Data Pipeline**
- [ ] **Phase 3: Rainfall ML**
- [ ] **Phase 4: Water Engine**
- [ ] **Phase 5: Water Balance**
- [ ] **Phase 6: Storage Optimization**
- [ ] **Phase 7: Suitability Analysis**
- [ ] **Phase 8: Recommendation Engine**
- [ ] **Phase 9: Cost / Savings**
- [ ] **Phase 10: Explainability**
- [ ] **Phase 11: Backend API**
- [ ] **Phase 12: Database / Auth**
- [ ] **Phase 13: Frontend**
- [ ] **Phase 14: Integration**
- [ ] **Phase 15: Testing**
- [ ] **Phase 16: Final Polish**
