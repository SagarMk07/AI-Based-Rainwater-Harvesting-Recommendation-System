# RainHarvest AI

An engineering-grade rainwater harvesting assessment and optimization system that pairs deterministic hydrological calculations with machine learning to evaluate rooftop runoff potential and size storage systems.

---

## 1. What RainHarvest AI does

RainHarvest AI evaluates rainwater harvesting feasibility for residential and commercial properties. It determines how much rainfall a property can harvest, how much domestic water demand it can satisfy, and what storage capacity provides the best return without oversizing.

The user enters basic property parameters: location, rooftop catchment area, roofing material, household size or daily water demand, and open ground or soil characteristics.

The system calculates location-based precipitation, gross and collectable runoff, monthly household water demand, and a full 12-month water balance tracking supplied volume, unmet deficit, and overflow.

The system recommends an optimal system configuration (Storage Tank, Recharge Pit, or Hybrid System) across three practical capacity tiers (Budget, Balanced, and High Reserve) along with estimated costs and payback periods.

RainHarvest AI is built with FastAPI and React, using deterministic water-balance calculations, multi-criteria storage optimization, and an existing Random Forest recommendation model.

---

## 2. Project flow

```text
User Input
  ↓
Rainfall Data
  ↓
Runoff Calculation
  ↓
Water Balance
  ↓
Tank Simulation
  ↓
Storage Optimization
  ↓
ML Recommendation
  ↓
Design Comparison
  ↓
Results Dashboard
```

- **User Input**: The user enters property location, roof dimensions, catchment material, and domestic water consumption details.
- **Rainfall Data**: The backend retrieves location-specific precipitation data from Open-Meteo ERA5 or falls back to IMD 30-year climate normals.
- **Runoff Calculation**: Deterministic hydrological formulas calculate gross runoff and net collectable water based on runoff coefficients and filter efficiency.
- **Water Balance**: A monthly accounting ledger tracks incoming runoff, household demand, volume supplied, deficit, and overflow.
- **Tank Simulation**: The simulation engine models water levels and overflow dynamics across all 12 months for various storage sizes.
- **Storage Optimization**: Multi-criteria optimization evaluates candidate storage volumes to identify diminishing marginal returns.
- **ML Recommendation**: A pre-trained Random Forest model evaluates property features to recommend the most suitable harvesting archetype.
- **Design Comparison**: The system generates Budget, Balanced, and High Storage alternatives comparing cost, reliability, and water savings.
- **Results Dashboard**: The interactive React interface displays the monthly balance charts, system recommendations, and feasibility metrics.

---

## 3. Architecture

```text
React Frontend
  ↓ (HTTPS / REST API)
FastAPI Backend
  ↓
API Layer
  ├── Calculation Modules (Runoff & Demand)
  ├── Water Balance Simulator
  ├── Storage Tank Optimizer
  └── Recommendation / ML Inference (Random Forest)
  ↓
Persistence Layer (Supabase PostgreSQL & Local Cache)
```

The React frontend handles user inputs, interactive scenario simulation, and chart visualizations.

The FastAPI backend validates requests and coordinates the calculation modules, simulation engine, and ML inference pipeline.

Hydrological calculations, water-balance accounting, and mass conservation are strictly deterministic engineering calculations.

The persistence layer stores analyses in Supabase PostgreSQL with Row-Level Security, backed by a local JSON store for offline and guest sessions.

---

## 4. Folder structure

```text
rainwater-ai/
├── backend/
│   ├── app/
│   │   ├── api/             # REST endpoints (analysis, health, history, weather)
│   │   ├── auth/            # Supabase JWT authentication and user context
│   │   ├── calculations/    # Hydrological formulas (runoff, demand, water balance)
│   │   ├── database/        # Supabase client and database connection logic
│   │   ├── ml/              # Model inference wrapper
│   │   ├── optimization/    # Storage tank sizing and multi-tier optimization
│   │   ├── recommendations/ # Recommendation engine and explainability
│   │   ├── schemas/         # Pydantic request and response schemas
│   │   ├── services/        # Weather, geocoding, and external API services
│   │   ├── config.py        # Application settings and environment variables
│   │   ├── middleware.py    # Rate limiting, security headers, and error handlers
│   │   └── main.py          # FastAPI application entry point
│   ├── Dockerfile           # Backend container definition
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components, charts, and input wizard steps
│   │   ├── context/         # AuthContext and AppContext state management
│   │   ├── layouts/         # PublicLayout and AppLayout navigation shells
│   │   ├── pages/           # Landing, Login, Signup, Dashboard, Analyze, History, About
│   │   ├── services/        # API client and Supabase client
│   │   ├── types/           # TypeScript interfaces and data definitions
│   │   └── App.tsx          # Application routing configuration
│   ├── package.json         # Node.js dependencies and scripts
│   └── vite.config.ts       # Vite configuration with backend proxy
├── ml/
│   ├── models/              # Serialized model artifacts (.joblib, .json)
│   ├── models_core.py       # Random Forest classifier implementation
│   ├── preprocessing.py     # Feature preprocessing pipeline
│   ├── train_model.py       # Model training script
│   └── evaluate_model.py    # Model evaluation utilities
├── data/
│   ├── raw/                 # Raw climate and rainfall datasets
│   └── processed/           # Processed datasets and local analysis store
├── supabase/
│   └── migrations/          # Relational PostgreSQL database migrations
├── tests/                   # API, calculation, and unit test suites
└── docs/                    # Architecture and engineering documentation
```

---

## 5. Backend setup

Run the following commands in PowerShell from the project root:

```powershell
# 1. Navigate to the backend directory
cd backend

# 2. Create a Python virtual environment
python -m venv .venv

# 3. Activate the virtual environment
.\.venv\Scripts\Activate.ps1

# 4. Install backend dependencies
pip install -r requirements.txt

# 5. Create the environment configuration file from the template
Copy-Item ..\.env.example ..\.env

# 6. Start the FastAPI development server
$env:PYTHONPATH = ".."
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## 6. Frontend setup

Run the following commands in PowerShell from a new terminal window:

```powershell
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

The frontend application will be accessible at:
`http://localhost:5173`

---

## 7. Environment setup

Initialize your local environment by copying `.env.example` to `.env` in the repository root:

```powershell
Copy-Item .env.example .env
```

Configure the following variables in `.env` as needed:

- `APP_NAME`, `APP_ENV`, `DEBUG`: Application title, environment mode (`development` or `production`), and debug logging flag.
- `HOST`, `PORT`: Server binding host (`0.0.0.0` or `127.0.0.1`) and port (`8000`).
- `CORS_ORIGINS`: Comma-separated list of allowed web origins (e.g., `http://localhost:5173,http://127.0.0.1:5173`).
- `RATE_LIMIT_PER_MINUTE`, `MAX_REQUEST_BODY_BYTES`: Sliding-window rate limit and maximum request body size (1 MB default).
- `SUPABASE_URL`, `SUPABASE_KEY`: Supabase project URL and anonymous public API key (optional for offline guest mode).
- `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`: Privileged Supabase service role key and cryptographic JWT secret for token verification. Keep these on the backend only.
- `DATABASE_URL`: Direct PostgreSQL connection string (optional).
- `OPENWEATHER_API_KEY`: Optional API key for live weather data (system automatically falls back to Open-Meteo ERA5 and IMD normals if empty).
- `VITE_API_URL`: Backend API base URL consumed by the frontend (`http://localhost:8000/api`).
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`: Public Supabase parameters used by the frontend for client-side authentication.

Security guidelines:
- Never commit `.env` or sensitive credentials to Git (already excluded via `.gitignore`).
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_JWT_SECRET` in client-side code or frontend configuration.

---

## 8. How to run

To run the complete system locally:

**Terminal 1 (Backend):**
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
$env:PYTHONPATH = ".."
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm run dev
```

**Application Links:**
- Frontend Application: [http://localhost:5173](http://localhost:5173)
- Backend API Base: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Interactive API Documentation (Swagger): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## 9. Cloudflare deployment

RainHarvest AI deploys to the **Cloudflare Free Tier** using a high-performance dual-edge architecture:
1. **Frontend**: Hosted globally on **Cloudflare Pages** with automated Git deployments and edge SPA routing (`public/_redirects`).
2. **Backend**: Python FastAPI with Scikit-Learn ML runs natively in a container or host, securely connected to Cloudflare Edge via **Cloudflare Tunnel (`cloudflared`)** without opening firewall ports.

### Frontend Deployment (Cloudflare Pages)

1. Connect your repository in the [Cloudflare Dashboard](https://dash.cloudflare.com/) under **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Configure the build parameters:
   - **Framework preset**: `Vite`
   - **Root directory**: `frontend`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. Configure environment variables in the Cloudflare Pages settings:
   - `VITE_API_URL`: `https://api.yourdomain.com/api` (or omit for same-origin proxying)
   - `VITE_SUPABASE_URL`: `https://<your-project>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `<your-supabase-publishable-key>`
4. Click **Save and Deploy**. Cloudflare Pages automatically builds the production bundle and provisions global SSL.

### Backend Deployment (FastAPI + Cloudflare Tunnel)

1. Start your FastAPI backend container:
   ```bash
   docker compose up -d backend
   ```
2. Install `cloudflared` on your server or container host and create a free tunnel:
   ```bash
   # Authenticate with Cloudflare
   cloudflared tunnel login

   # Create a secure tunnel to your backend
   cloudflared tunnel create rainharvest-backend

   # Route your API domain through Cloudflare DNS
   cloudflared tunnel route dns rainharvest-backend api.yourdomain.com

   # Run the tunnel using cloudflare-tunnel.example.yml
   cloudflared tunnel --config cloudflare-tunnel.example.yml run
   ```

---

## 10. Production environment variables

### Backend Environment Variables

| Variable | Description | Example / Default | Required in Production |
| :--- | :--- | :--- | :--- |
| `APP_ENV` | Application environment mode | `production` | **Yes** |
| `DEBUG` | Verbose debug flag | `false` | **Yes** (must be `false`) |
| `HOST` | Server host binding | `0.0.0.0` | **Yes** |
| `PORT` | Server listening port | `8000` | **Yes** |
| `CORS_ORIGINS` / `CORS_ALLOWED_ORIGINS` | Allowed frontend domains | `https://rainharvest-ai.pages.dev,https://yourdomain.com` | **Yes** (no `*`) |
| `RATE_LIMIT_PER_MINUTE` | Rate limit per IP address | `60` | No (default: 60) |
| `MAX_REQUEST_BODY_BYTES` | Maximum payload limit | `1000000` (1 MB) | No |
| `SUPABASE_URL` | Supabase project REST URL | `https://<id>.supabase.co` | **Yes** |
| `SUPABASE_KEY` | Supabase publishable/anon API key | `<sb_publishable_...>` | **Yes** |
| `SUPABASE_JWT_SECRET` | Secret key for verifying JWT tokens | `<supabase-jwt-secret>` | **Yes** |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged backend key (never expose to client) | `<sb_secret_...>` | Optional |
| `OPENWEATHER_API_KEY` | Optional OpenWeather API key | `<key>` | Optional |

### Frontend Environment Variables (Cloudflare Pages)

| Variable | Description | Example / Default | Required in Production |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` / `VITE_API_BASE_URL` | Base URL for FastAPI backend endpoints | `https://api.yourdomain.com/api` (or `/api`) | **Yes** |
| `VITE_SUPABASE_URL` | Public Supabase project URL | `https://<id>.supabase.co` | **Yes** |
| `VITE_SUPABASE_ANON_KEY` | Public Supabase anonymous client key | `<sb_publishable_...>` | **Yes** |

