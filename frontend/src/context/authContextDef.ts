import { createContext } from 'react'
import type { AuthUserProfile } from '../services/supabaseClient'
import type { AnalysisResponse } from '../types/analysis'

export interface AuthContextType {
  user: AuthUserProfile | null
  token: string | null
  isGuest: boolean
  loading: boolean
  sessionExpired: boolean
  setSessionExpired: (expired: boolean) => void
  pendingAnalysis: AnalysisResponse | null
  setPendingAnalysis: (analysis: AnalysisResponse | null) => void
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, pass: string, name?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; message: string; error?: string }>
  deleteAccount: () => Promise<{ success: boolean; error?: string }>
  claimCurrentAnalysis: (requestId: string) => Promise<{ success: boolean; error?: string }>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
