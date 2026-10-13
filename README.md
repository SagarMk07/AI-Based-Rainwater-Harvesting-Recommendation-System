# AI-Based Rainwater Harvesting Intelligence & Optimization System

An engineering-grade environmental intelligence system combining hydrological engineering principles, time-series machine learning, water-balance simulation, multi-criteria optimization, and real-world location intelligence to deliver transparent, data-driven rainwater harvesting recommendations.

---

## 1. Architectural Philosophy & Architecture Map

A foundational rule of this system:

> **Do NOT use machine learning for calculations that can be accurately performed using engineering formulas.**

```
[ Frontend: React 19 + Vite + TypeScript ]
   ├── Public Layout: PublicNavbar (Landing, Login, Signup, About)
   └── Application Layout: AppNavbar + ProtectedRoute (Dashboard, Analyze, History)
                   │
                   ▼ (HTTPS / JSON REST with JWT Auth & Security Headers)
[ FastAPI Production API Gateway ]
   ├── ProductionSecurityMiddleware (Rate Limiting, Payload Limits, Request ID)
   ├── Uniform Error Handling (Structured JSON, Zero Traceback Leaks)
   └── Authentication / Authorization Layer (decode_supabase_jwt, AuthUser)
                   │
   ┌───────────────┼───────────────────────────┬───────────────────────┐
   ▼               ▼                           ▼                       ▼
[ Services ]  [ Engineering Engine ]    [ ML Inference ]        [ Database ]
  • Weather     • Runoff (V = P*A*C)      • RF Classifier         • Supabase (PostgreSQL)
  • Geocoding   • Demand Modeling         • Time-series Regressor • Row-Level Security
  • Caching     • Water Balance           • Preprocessor Pipeline • SQLite Local Cache
                • Tank Sizing Optimizer   • Versioning (v2.0.0)   • Migrations (001, 002)
   │
   ▼ (External APIs with Offline Resilience)
[ External APIs: Open-Meteo ERA5 / IMD 30-Yr Normals Fallback ]
```

---

## 2. Public Landing Page & Route Architecture (Phase 7)

The application features a public-facing website and authenticated application shell with multi-route navigation:

### Route Map
| Route | View Component | Layout | Access Level | Description |
|---|---|---|---|---|
| `/` | `LandingPage` | `PublicLayout` | **Public** | **Default Public Homepage**. Features the dark hero, physical hydraulic flow visualization, assessment workflow, and 6 capability cards. Does **not** redirect automatically to dashboard. |
| `/login` | `LoginPage` | `PublicLayout` | **Public** | Dedicated sign-in page with email/password form, password visibility toggle, reset flow, and "Continue as Guest" option. Preserves intended destination. |
| `/signup` | `SignupPage` | `PublicLayout` | **Public** | User registration with full name, email, password validation, and "Continue as Guest" option. Preserves intended destination. |
| `/dashboard` | `DashboardPage` | `AppLayout` | **Protected** | Authenticated user dashboard with recent analyses, aggregate statistics, quick actions, and connectivity telemetry. |
| `/analyze` | `AnalyzePage` | `AppLayout` | **Public / Guest / User** | 5-step property input wizard and 12-month water balance results dashboard. Accessible to both logged-in users and anonymous guests. |
| `/history` | `HistoryPage` | `AppLayout` | **Protected** | User's private historical analyses, search/filter, rerun, CSV export, and deletion. |
| `/about` | `AboutPage` | `PublicLayout` | **Public** | Hydrological engineering principles, IS 15797:2008 standards, formulas, and ML model methodology. |

### Layout Separation
1. **Public Marketing Layout (`PublicLayout`)**:
   - Uses `PublicNavbar`:
     - **Logo**: RainHarvest AI (links to `/`)
     - **Links**: How It Works (`/#how-it-works`), Features (`/#features`), About (`/about`)
     - **Actions (Logged Out)**: "Sign In" (`/login`), "Get Started" (`/signup`)
     - **Actions (Logged In)**: "Dashboard" button (`/dashboard`), "Analyze Property" button (`/analyze`)
     - **Excluded from Public Navigation**: Does not display internal telemetry triggers, history counters, or engine status indicators.
   - Includes standard public `Footer` and `PrivacyPolicyModal`.
2. **Application Shell (`AppLayout`)**:
   - Uses `AppNavbar`:
     - Full application navigation: Dashboard, Analyze Property, History (with live counter), About, audited **ML Telemetry** modal trigger, and real-time **Engine Active / Offline** status indicator.
     - Profile dropdown with user name/email, Privacy Notice, Account Deletion (GDPR), and Sign Out.
   - Includes `MLTelemetryModal`, `PrivacyPolicyModal`, `AuthModal` (for automatic 401 token expiration handling), and the interactive `RainHarvestChatWidget`.
3. **Route Protection (`ProtectedRoute`)**:
   - Guards `/dashboard` and `/history`.
   - Unauthenticated visitors are redirected to `/login`, preserving `state: { from: location }` so they return to their requested page immediately after authentication.

### Guest Access & CTA Flow
- **"Analyze My Property"**:
  - **Logged In**: Navigates directly to `/analyze`.
  - **Logged Out**: Opens `GuestChoiceModal` with three options:
    1. *Continue as Guest*: Navigates directly to `/analyze` with zero friction.
    2. *Sign In*: Navigates to `/login` with destination set to `/analyze`.
    3. *Create Free Account*: Navigates to `/signup` with destination set to `/analyze`.
- **"See How It Works"**: Smoothly scrolls to the existing `#how-it-works` assessment workflow section.
- **"Get Started"**: If logged in, navigates to `/analyze`; otherwise navigates to `/signup`.
- **"Sign In"**: Navigates to `/login`.
- **Guest Execution**: Guests can run complete 5-step property wizard assessments, test benchmark presets, and review 12-month water balance curves without creating an account. Guests cannot access private profiles or saved history. A banner on `/analyze` allows guests to register or sign in to claim and persist their calculations.

---

## 3. Production Hardening Features (Phase 6)

### A. Authentication & Row-Level Security (RLS)
- **Supabase Authentication**: Full user lifecycle support (Sign Up, Sign In, Sign Out, Forgot Password, Session Persistence).
- **Guest Mode Resilience**: Anonymous visitors can enter parameters, inspect weather, and run full calculations without being forced to create an account.
- **One-Click Claiming**: Guests can sign in or register to immediately claim their ephemeral calculation to their authenticated account.
- **Strict Row-Level Security (RLS)**: Enforced both at the database engine level and via API dependency checks. Users can only query, update, or delete records where `user_id == auth.uid()`.
- **Cross-Tenant Protection**: Attempts by User A to access, modify, or delete User B's private analyses return `403 Forbidden` or `404 Not Found`.
- **GDPR / Privacy Compliance**: Users can permanently delete their account and associated analyses via `DELETE /api/user/account`.

### B. Database Schema & Tables
PostgreSQL / Supabase schema structured into relational tables:
1. `profiles`: Extends `auth.users` with cascading deletion.
2. `properties`: Catchment specifications, roof materials, occupant counts, soil infiltration.
3. `analyses`: Hydrological runs, water balance breakdown, cost-benefit metrics, model version tags (`2.0.0`).
4. `recommendations`: System configuration, optimal tank capacity, recharge pit dimensions.
5. `analysis_assumptions`: Calculation constants, runoff coefficients, filter efficiencies, per-capita demand.
6. `model_versions`: Reproducible ML artifact versions, training periods, dataset tags, macro F1 metrics.
7. `weather_data`: Cached meteorological normals and coordinates.

Migrations are organized under `supabase/migrations/`:
- `001_initial_schema.sql`: Core schema, constraints, and baseline RLS policies.
- `002_production_hardening.sql`: `model_versions`, `analysis_assumptions`, and updated RLS policies.

### C. API Security & Rate Limiting
- **Uniform Error Structure**:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Rooftop catchment area must be greater than zero."
    }
  }
  ```
- **Zero Information Leakage**: Stack traces, file paths, and database credentials are never exposed in production responses.
- **Sliding-Window Rate Limiting**:
  - `POST /api/analyze`: 30 requests/min
  - `POST /api/recommend/predict`: 30 requests/min
  - `POST /api/rainfall/predict`: 30 requests/min
  - `GET /api/weather`: 60 requests/min
  - Global Default: 60 requests/min
  - Excess requests return `429 Too Many Requests` with `Retry-After` header.
- **Request Size Limits**: Requests exceeding `MAX_REQUEST_BODY_BYTES` (1 MB) are rejected with `413 Payload Too Large`.
- **Security Headers**: Every response includes `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and unique `X-Request-ID`.
- **CORS Protection**: Development allows localhost; production restricts origins to designated production domains (wildcard `*` disallowed in production).

### D. Health Check Endpoint
`GET /api/health` returns status without exposing sensitive credentials:
```json
{
  "status": "ok",
  "api": "ok",
  "database_status": "ok",
  "ml_model": "ok",
  "weather_service": "ok",
  "timestamp": "2026-10-12T16:38:34.912345+00:00"
}
```

---

## 4. Directory Structure

```
rainwater-ai/
├── backend/
│   ├── app/
│   │   ├── api/             # REST endpoints (analysis, health, history, weather, geocoding)
│   │   ├── auth/            # JWT validation, AuthUser schemas, test token provider
│   │   ├── calculations/    # Deterministic engineering formulas (runoff, demand, water balance)
│   │   ├── database/        # Supabase connection manager & schema.sql
│   │   ├── ml/              # Pure NumPy inference models & system predictor
│   │   ├── optimization/    # Multi-tier storage tank capacity optimization
│   │   ├── recommendations/ # Multi-criteria decision engine & explainability
│   │   ├── schemas/         # Pydantic v2 schemas with strict numeric validation
│   │   ├── services/        # WeatherService abstraction, Open-Meteo, IMD normals, geocoding
│   │   ├── utils/           # Structured request logger
│   │   ├── config.py        # Pydantic Settings & environment variables
│   │   ├── middleware.py    # ProductionSecurityMiddleware & uniform exception handlers
│   │   └── main.py          # FastAPI application entry point & CORS
│   ├── Dockerfile           # Multi-stage production backend container
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
│   │   ├── components/      # React components (PublicNavbar, AppNavbar, ProtectedRoute, GuestChoiceModal)
│   │   ├── context/         # AuthContext (Supabase + offline) & AppContext (global state)
│   │   ├── layouts/         # PublicLayout (marketing) & AppLayout (authenticated shell)
│   │   ├── pages/           # LandingPage, LoginPage, SignupPage, DashboardPage, AnalyzePage, HistoryPage, AboutPage
│   │   ├── services/        # Axios API client, Supabase client, healthService
│   │   ├── types/           # TypeScript interfaces
│   │   └── App.tsx          # React Router v7 root configuration
│   ├── Dockerfile           # Multi-stage Nginx production container
│   ├── package.json
│   └── vite.config.ts       # Vite configuration with /api backend proxy
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_production_hardening.sql
├── tests/
│   ├── test_api.py              # API endpoint integration & guest verification tests
│   ├── test_calculations.py     # Deterministic hydrological formula tests
│   ├── test_config.py           # Configuration tests
│   ├── test_e2e_workflow.py     # Complete 15-step user lifecycle test
│   ├── test_health.py           # System health & telemetry tests
│   ├── test_ml_recommendations.py # ML inference & edge case tests
│   ├── test_recommendations.py  # Recommendation engine tests
│   ├── test_security.py         # Multi-tenant security, ownership, & boundary tests
│   ├── test_weather.py          # Weather fallback & network failure tests
│   └── test_weather_service.py  # Real-world location intelligence suite
├── docker-compose.yml       # Production multi-service container orchestration
├── .env.example             # Clean environment variable template
└── README.md
```

---

## 5. Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- Docker & Docker Compose (optional for containerized deployment)

### Environment Configuration
Copy the configuration template:
```bash
cp .env.example .env
```
Key configuration variables in `.env`:
| Variable | Description | Default |
|---|---|---|
| `APP_ENV` | Environment mode (`development`, `production`, `testing`) | `development` |
| `DEBUG` | Enable debug logs (set `false` in production) | `true` |
| `HOST` / `PORT` | API host address and port | `0.0.0.0:8000` |
| `CORS_ORIGINS` | Comma-separated list of allowed origins | `http://localhost:5173,...` |
| `SUPABASE_URL` | Supabase project URL (optional for offline mode) | `""` |
| `SUPABASE_KEY` | Supabase anon public API key | `""` |
| `SUPABASE_JWT_SECRET` | Supabase JWT Secret for cryptographic verification | `""` |
| `RATE_LIMIT_PER_MINUTE` | Rate limit cap per IP per minute | `60` |

### Running Locally

#### 1. Backend Setup & Run

##### Option A: From the Project Root (Recommended)
```powershell
# 1. Create a Python 3.11 virtual environment (if not already created)
python -m venv .venv

# 2. Activate the virtual environment
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# (Note: If your venv was created inside backend, activate using: .\backend\.venv\Scripts\Activate.ps1)
# (If PowerShell blocks script execution, run: Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned)
# Windows CMD:
.\.venv\Scripts\activate.bat
# Linux / macOS:
source .venv/bin/activate

# 3. Upgrade pip and install all backend requirements
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# 4. Start the FastAPI development server with hot reload
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

##### Option B: From the `backend` Subdirectory
```powershell
# 1. Navigate into backend directory
cd backend

# 2. Create and activate virtual environment
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Windows CMD:
.\.venv\Scripts\activate.bat
# Linux / macOS:
source .venv/bin/activate

# 3. Install requirements (use requirements.txt, NOT backend/requirements.txt)
python -m pip install -r requirements.txt

# 4. Set PYTHONPATH to root so backend package imports resolve, then start uvicorn
# Windows PowerShell:
$env:PYTHONPATH = ".."
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

# Windows CMD:
set PYTHONPATH=.. && python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

# Linux / macOS:
PYTHONPATH=.. python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

##### Verification Endpoints:
Once started, verify the backend is running at:
- **Interactive Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **API Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
- **OpenAPI Schema**: [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json)

##### Common Backend Troubleshooting:
- **`ModuleNotFoundError: No module named 'backend'`**:
  The application modules import using package paths like `backend.app...`. Run uvicorn from the **project root**:
  ```powershell
  python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
  ```
  If running from inside the `backend/` directory, set `$env:PYTHONPATH = ".."` in PowerShell beforehand.
- **`ERROR: Could not open requirements file: [Errno 2] No such file or directory`**:
  - If inside the **project root**: use `pip install -r requirements.txt` (or `pip install -r backend/requirements.txt`).
  - If inside the **`backend` folder**: use `pip install -r requirements.txt` (do not prepend `backend/`).
- **Port Conflict (Error: [WinError 10048] address already in use)**:
  If port 8000 is occupied by an existing process, identify and terminate it:
  ```powershell
  netstat -ano | findstr :8000
  taskkill /PID <PID> /F
  ```
  Alternatively, bind to another port (e.g. `--port 8001`), and update `frontend/vite.config.ts` proxy target accordingly.
- **PowerShell Script Execution Policy Error**:
  If `Activate.ps1` produces an execution policy error, enable local scripts for the current terminal session:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
  ```

#### 2. Frontend Setup & Run:
```powershell
cd frontend
npm ci
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. The Vite development server automatically proxies all `/api` requests to `http://127.0.0.1:8000`.


---

## 6. Running with Docker Compose

To spin up the entire application in production mode:
```bash
docker-compose up --build -d
```
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:8000](http://localhost:8000)
- Healthcheck: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 7. Testing & Verification

Execute the comprehensive automated test suite across all 57 test scenarios:
```powershell
.\.venv\Scripts\python.exe -m pytest -v
```

Execute frontend production build verification:
```powershell
cd frontend
npm run build
```

### Test Suite Structure:
- `tests/test_security.py`: Verifies JWT authentication, cross-user isolation (User A vs User B), boundary rejection on negative values, rate limiting, and GDPR deletion.
- `tests/test_e2e_workflow.py`: Executes the complete 15-step end-to-end lifecycle from signup, property entry, rainfall retrieval, ML recommendation, saving, logout, 401 rejection, to re-login.
- `tests/test_api.py`: Tests REST endpoints, calculations, OpenAPI documentation, and anonymous guest access permissions.
- `tests/test_health.py`: Validates service status, database connectivity, and ML pipeline ready states.
- `tests/test_calculations.py`: Verifies exact mathematical benchmarks ($200\,\text{m}^2 \times 900\,\text{mm} \times 0.85 = 153{,}000\,\text{L}$).
- `tests/test_ml_recommendations.py`: Tests ML probability distribution and constraint validation.
- `tests/test_weather_service.py`: Tests location intelligence, ERA5 reanalysis, and fallback IMD normals.

---

## 8. Production Quality Gate Verification

- [x] **Public Landing Page**: Root route `/` renders the public homepage with dark hero, hydraulic flow visualization, assessment workflow, and capability cards without redirecting visitors to the dashboard.
- [x] **Route Separation**: Dedicated routes for `/`, `/login`, `/signup`, `/dashboard`, `/analyze`, `/history`, and `/about`.
- [x] **Layout Isolation**: Clean division between marketing navigation (`PublicLayout`) and application workspace (`AppLayout`).
- [x] **Route Protection**: Protected routes `/dashboard` and `/history` require authentication; preserve intended target destination upon login.
- [x] **Guest Access**: Anonymous visitors can use property analysis (`/analyze`), run calculations, and evaluate hydrological recommendations without an account.
- [x] **Authentication**: Sign up, Login, Logout, Session persistence, Session expiration, and claiming verified.
- [x] **Authorization**: Logged-out users and cross-users are prevented from reading or deleting private analyses (401/403).
- [x] **Row-Level Security (RLS)**: PostgreSQL migrations `001_initial_schema.sql` and `002_production_hardening.sql` enforce tenant isolation.
- [x] **Database Schema**: All required tables (`profiles`, `properties`, `analyses`, `recommendations`, `weather_data`, `model_versions`, `analysis_assumptions`) verified.
- [x] **Input Validation**: Rejects zero/negative roof area, negative rainfall, zero occupants, and extreme out-of-bound values with standard 422 errors.
- [x] **ML Reliability**: Fallback statistical forecasting operates seamlessly if joblib artifacts are missing.
- [x] **Weather Fallback**: IMD historical normals provide offline resilience when live APIs are unreachable.
- [x] **CORS & Security Headers**: Strict origin controls, CSP, nosniff, DENY, and request correlation IDs active.
- [x] **Zero Secrets Committed**: Codebase audited with zero hardcoded API keys, passwords, or tokens.
- [x] **Health Check**: `GET /api/health` operational.
- [x] **Tests Passing**: 57/57 tests passing in 2.55s.
- [x] **Production Build**: `npm run build` succeeds cleanly with zero TypeScript errors (built in 1.36s).
- [x] **Calculation Engine 502 Resolution**: Vite dev proxy configured explicitly to `http://127.0.0.1:8000` avoiding IPv6 `localhost` connection drops; client-side retry & actionable diagnostics implemented for 502/504 errors.
- [x] **Hydrological Rainfall Scaling**: Manual or preset annual rainfall overrides proportionally rescale the 12-month simulation array, maintaining physical mass-balance continuity.
- [x] **5-Step Wizard & Preset Integrity**: Presets A, B, C, D atomically populate documented fields; background telemetry hooks do not overwrite user-specified rainfall; stepper lines align accurately to step nodes.
- [x] **Guest Analysis & Claiming**: Complete 5-step analysis available anonymously with full calculation outputs; guests can authenticate or create an account to claim and persist their analysis via `POST /api/analysis/{id}/claim`.

