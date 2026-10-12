-- Migration: 002_production_hardening
-- Created: 2026-10-12
-- Description: Adds model_versions, analysis_assumptions, model_version column on analyses, and strict RLS policies

-- =====================================================================
-- 1. Model Versions Table (Reproducibility & Model Versioning)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL UNIQUE,
    trained_at TIMESTAMPTZ DEFAULT NOW(),
    dataset_version TEXT NOT NULL,
    metrics JSONB NOT NULL,
    feature_schema JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.model_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to model versions"
    ON public.model_versions FOR SELECT
    USING (true);

-- =====================================================================
-- 2. Analysis Assumptions Table
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.analysis_assumptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
    runoff_coefficients JSONB NOT NULL,
    filter_efficiency NUMERIC(4, 2) NOT NULL DEFAULT 0.90,
    first_flush_depth_mm NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
    daily_per_capita_demand_litres NUMERIC(6, 2) NOT NULL DEFAULT 135.0,
    safety_margin_pct NUMERIC(4, 2) NOT NULL DEFAULT 15.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.analysis_assumptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assumptions of own analyses"
    ON public.analysis_assumptions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.analyses
        WHERE analyses.id = analysis_assumptions.analysis_id
        AND (analyses.user_id = auth.uid() OR analyses.user_id IS NULL)
    ));

CREATE POLICY "Users can insert assumptions for own analyses"
    ON public.analysis_assumptions FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.analyses
        WHERE analyses.id = analysis_assumptions.analysis_id
        AND (analyses.user_id = auth.uid() OR analyses.user_id IS NULL)
    ));

CREATE POLICY "Users can delete assumptions of own analyses"
    ON public.analysis_assumptions FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.analyses
        WHERE analyses.id = analysis_assumptions.analysis_id
        AND analyses.user_id = auth.uid()
    ));

-- =====================================================================
-- 3. Enhance Analyses Table with Model Version & Updated Timestamp
-- =====================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'analyses' AND column_name = 'model_version'
    ) THEN
        ALTER TABLE public.analyses ADD COLUMN model_version TEXT DEFAULT '2.0.0';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'analyses' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.analyses ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- =====================================================================
-- 4. High-Performance Foreign Key & Filtering Indexes
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_analysis_assumptions_analysis_id ON public.analysis_assumptions(analysis_id);
CREATE INDEX IF NOT EXISTS idx_model_versions_version ON public.model_versions(model_version);
CREATE INDEX IF NOT EXISTS idx_analyses_model_version ON public.analyses(model_version);

-- =====================================================================
-- 5. Seed Production Baseline Model Version
-- =====================================================================
INSERT INTO public.model_versions (
    model_name,
    model_version,
    dataset_version,
    metrics,
    feature_schema
) VALUES (
    'system_recommendation_ensemble',
    '2.0.0',
    'v2.0-climate-imd',
    '{"macro_f1": 0.9389, "accuracy": 0.941, "cv_folds": 5}'::jsonb,
    '["annual_rainfall_mm", "roof_area_m2", "runoff_coefficient", "occupants", "daily_water_demand_l", "soil_type", "open_area_m2", "harvest_to_demand_ratio", "roof_to_open_area_ratio"]'::jsonb
) ON CONFLICT (model_version) DO NOTHING;
