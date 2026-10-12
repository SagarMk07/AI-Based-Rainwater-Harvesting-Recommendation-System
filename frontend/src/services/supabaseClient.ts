/**
 * Supabase client initialization with seamless local offline simulation fallback.
 * Allows local development, deterministic test execution, and live cloud deployment.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isLiveSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('your-project') &&
  !SUPABASE_ANON_KEY.includes('your-anon-public-key')
)

// Real client if valid credentials, otherwise null
export const supabase: SupabaseClient | null = isLiveSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

export interface AuthUserProfile {
  id: string
  email: string
  fullName?: string
}
