-- =====================================================================
-- AI-Based Rainwater Harvesting Intelligence & Optimization System
-- PostgreSQL & Supabase Database Schema with Row-Level Security (RLS)
-- =====================================================================

-- 1. Users / Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. Catchment Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    roof_area_sqm NUMERIC(10, 2) NOT NULL CHECK (roof_area_sqm > 0),
    roof_type TEXT NOT NULL,
    soil_type TEXT NOT NULL,
    open_area_sqm NUMERIC(10, 2) DEFAULT 0 CHECK (open_area_sqm >= 0),
    occupants INTEGER NOT NULL DEFAULT 4 CHECK (occupants >= 1),
    daily_demand_litres NUMERIC(10, 2) NOT NULL CHECK (daily_demand_litres > 0),
    has_existing_borewell BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own properties"
    ON public.properties FOR ALL
    USING (auth.uid() = user_id);

-- 3. Hydrological Analyses & Optimization Runs Table
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    city TEXT NOT NULL,
    annual_rainfall_mm NUMERIC(10, 2) NOT NULL,
    gross_harvest_litres NUMERIC(12, 2) NOT NULL,
    collectable_litres NUMERIC(12, 2) NOT NULL,
    usable_litres NUMERIC(12, 2) NOT NULL,
    demand_met_percentage NUMERIC(5, 2) NOT NULL,
    optimal_tank_capacity_litres NUMERIC(10, 2) NOT NULL,
    recommended_system TEXT NOT NULL,
    total_estimated_cost_inr NUMERIC(12, 2) NOT NULL,
    payback_years NUMERIC(5, 2) NOT NULL,
    water_balance_breakdown JSONB NOT NULL,
    explainability_rationale JSONB NOT NULL,
    is_offline_guest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for analyses (Prevents Cross-Tenant Data Access)
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only select own analyses"
    ON public.analyses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert own analyses"
    ON public.analyses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete own analyses"
    ON public.analyses FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Recommendations Table
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
    system_type TEXT NOT NULL,
    optimal_tank_capacity_litres NUMERIC(10, 2) NOT NULL,
    has_recharge BOOLEAN NOT NULL DEFAULT FALSE,
    recharge_structure_type TEXT,
    recharge_dimensions TEXT,
    estimated_cost_inr NUMERIC(12, 2) NOT NULL,
    explanation_points JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read recommendations of own analyses"
    ON public.recommendations FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.analyses
        WHERE analyses.id = recommendations.analysis_id
        AND analyses.user_id = auth.uid()
    ));

-- 5. Weather Data Cache Table
CREATE TABLE IF NOT EXISTS public.weather_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city TEXT NOT NULL UNIQUE,
    state TEXT,
    annual_rainfall_mm NUMERIC(10, 2) NOT NULL,
    monthly_rainfall_mm JSONB NOT NULL,
    average_humidity_pct NUMERIC(5, 2),
    average_temperature_c NUMERIC(5, 2),
    source TEXT NOT NULL,
    last_synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weather data is public read-only
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to weather data"
    ON public.weather_data FOR SELECT
    USING (true);

-- 6. Model Metrics Table
CREATE TABLE IF NOT EXISTS public.model_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_version TEXT NOT NULL,
    dataset_version TEXT NOT NULL,
    training_period TEXT NOT NULL,
    testing_period TEXT NOT NULL,
    regression_metrics JSONB NOT NULL,
    classification_metrics JSONB NOT NULL,
    feature_importances JSONB NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.model_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to model metrics"
    ON public.model_metrics FOR SELECT
    USING (true);

-- Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_analysis_id ON public.recommendations(analysis_id);
CREATE INDEX IF NOT EXISTS idx_weather_data_city ON public.weather_data(city);
