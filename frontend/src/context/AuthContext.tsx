import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isLiveSupabaseConfigured, type AuthUserProfile } from '../services/supabaseClient'
import { apiClient } from '../services/api'
import type { AnalysisResponse } from '../types/analysis'

interface AuthContextType {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const LOCAL_STORAGE_USER_KEY = 'rwh_auth_user'
const LOCAL_STORAGE_TOKEN_KEY = 'rwh_auth_token'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [sessionExpired, setSessionExpired] = useState<boolean>(false)
  const [pendingAnalysis, setPendingAnalysis] = useState<AnalysisResponse | null>(null)

  // Initialize session on mount
  useEffect(() => {
    async function initAuth() {
      try {
        if (isLiveSupabaseConfigured && supabase) {
          const { data } = await supabase.auth.getSession()
          if (data.session) {
            setUser({
              id: data.session.user.id,
              email: data.session.user.email || '',
              fullName: data.session.user.user_metadata?.full_name || '',
            })
            setToken(data.session.access_token)
          }

          // Listen for Supabase auth changes
          supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
              setUser(null)
              setToken(null)
            } else if (event === 'TOKEN_REFRESHED' && session) {
              setToken(session.access_token)
            } else if (session) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                fullName: session.user.user_metadata?.full_name || '',
              })
              setToken(session.access_token)
            }
          })
        } else {
          // Local development session persistence
          const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY)
          const storedToken = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)
          if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser))
            setToken(storedToken)
          }
        }
      } catch (err) {
        console.warn('Auth initialization error:', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Update Axios Authorization header when token changes
  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete apiClient.defaults.headers.common['Authorization']
    }
  }, [token])

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isLiveSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass })
        if (error) return { success: false, error: error.message }
        if (data.user && data.session) {
          const profile: AuthUserProfile = {
            id: data.user.id,
            email: data.user.email || '',
            fullName: data.user.user_metadata?.full_name || '',
          }
          setUser(profile)
          setToken(data.session.access_token)
          setSessionExpired(false)
          return { success: true }
        }
      } else {
        // Deterministic local developer authentication
        const mockUserId = `user-${email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') || 'local'}`
        const mockToken = `test-token-${email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') || 'local'}`
        const profile: AuthUserProfile = {
          id: mockUserId,
          email,
          fullName: email.split('@')[0],
        }
        setUser(profile)
        setToken(mockToken)
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile))
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, mockToken)
        setSessionExpired(false)
        return { success: true }
      }
      return { success: false, error: 'Authentication failed' }
    } catch (err: any) {
      return { success: false, error: err.message || 'Unexpected login error' }
    }
  }

  const signup = async (email: string, pass: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isLiveSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: { data: { full_name: name || '' } },
        })
        if (error) return { success: false, error: error.message }
        if (data.user) {
          if (data.session) {
            setUser({
              id: data.user.id,
              email: data.user.email || '',
              fullName: name || '',
            })
            setToken(data.session.access_token)
          }
          return { success: true }
        }
      } else {
        // Offline signup
        const mockUserId = `user-${email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') || 'local'}`
        const mockToken = `test-token-${email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') || 'local'}`
        const profile: AuthUserProfile = {
          id: mockUserId,
          email,
          fullName: name || email.split('@')[0],
        }
        setUser(profile)
        setToken(mockToken)
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile))
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, mockToken)
        return { success: true }
      }
      return { success: false, error: 'Failed to create user account' }
    } catch (err: any) {
      return { success: false, error: err.message || 'Signup failed' }
    }
  }

  const logout = async (): Promise<void> => {
    try {
      if (isLiveSupabaseConfigured && supabase) {
        await supabase.auth.signOut()
      }
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY)
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
      delete apiClient.defaults.headers.common['Authorization']
    }
  }

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string; error?: string }> => {
    try {
      if (isLiveSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        if (error) return { success: false, message: '', error: error.message }
      }
      return {
        success: true,
        message: `Password reset instructions have been dispatched to ${email}.`,
      }
    } catch (err: any) {
      return { success: false, message: '', error: err.message || 'Failed to send reset email' }
    }
  }

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) return { success: false, error: 'No active user session' }
      // Call backend GDPR delete account endpoint
      await apiClient.delete('/user/account')
      await logout()
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || 'Could not delete user account' }
    }
  }

  const claimCurrentAnalysis = async (requestId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) return { success: false, error: 'Must be signed in to save analysis' }
      await apiClient.post(`/analysis/${requestId}/claim`)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to claim analysis' }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isGuest: !user,
        loading,
        sessionExpired,
        setSessionExpired,
        pendingAnalysis,
        setPendingAnalysis,
        login,
        signup,
        logout,
        resetPassword,
        deleteAccount,
        claimCurrentAnalysis,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
