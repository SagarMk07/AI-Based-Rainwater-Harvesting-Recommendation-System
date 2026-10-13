-- Migration: 003_analysis_persistence_enhancements
-- Created: 2026-10-13
-- Description: Adds request_id, geographic coordinates, input/result snapshots, status, and enhanced RLS policies for analyses persistence

-- =====================================================================
-- 1. Enhance Analyses Table with Snapshot and Metadata Columns
-- =====================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'analyses' AND column_name = 'request_id'
    ) THEN
        ALTER TABLE public.analyses ADD COLUMN request_id TEXT UNIQUE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'analyses' AND column_name = 'state'
    ) THEN
        ALTER TABLE public.analyses ADD COLUMN state TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'analyses' AND column_name = 'latitude'
    ) THEN
        ALTER TABLE public.analyses ADD COLUMN latitude NUMERIC(9, 6);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'analyses' AND column_name = 'longitude'
    ) THEN
        ALTER TABLE public.analyses ADD COLUMN longitude NUMERIC(9, 6);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'analyses' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.analyses ADD COLUMN status TEXT DEFAULT 'completed';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'analyses' AND column_name = 'input_snapshot'
    ) THEN
        ALTER TABLE public.analyses ADD COLUMN input_snapshot JSONB;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'analyses' AND column_name = 'result_snapshot'
    ) THEN
        ALTER TABLE public.analyses ADD COLUMN result_snapshot JSONB;
    END IF;
END $$;

-- =====================================================================
-- 2. Performance Indexes for Recent Analyses and Pagination
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_analyses_user_created ON public.analyses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_request_id ON public.analyses(request_id);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON public.analyses(status);

-- =====================================================================
-- 3. Enhanced RLS Policies for Claiming Guest Analyses
-- =====================================================================
-- Allow authenticated users to claim guest analyses where user_id was NULL
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'analyses' AND policyname = 'Users can update own or unclaimed guest analyses'
    ) THEN
        CREATE POLICY "Users can update own or unclaimed guest analyses"
            ON public.analyses FOR UPDATE
            USING (auth.uid() = user_id OR user_id IS NULL)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
