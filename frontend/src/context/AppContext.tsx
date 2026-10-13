import React, { createContext, useContext, useState, useEffect } from 'react'
import { useHealth } from '../hooks/useHealth'
import type { HealthResponse } from '../types/health'
import type { AnalysisResponse } from '../types/analysis'
import { useAuth } from './AuthContext'
import { apiClient } from '../services/api'

export interface AppContextType {
  health: HealthResponse | null
  healthLoading: boolean
  healthError: string | null
  refetchHealth: () => void
  analysisResult: AnalysisResponse | null
  setAnalysisResult: (result: AnalysisResponse | null) => void
  history: AnalysisResponse[]
  recentAnalyses: AnalysisResponse[]
  recentLoading: boolean
  recentError: string | null
  refetchRecent: () => Promise<void>
  reopenAnalysis: (id: string) => Promise<AnalysisResponse | null>
  saveToHistory: (item: AnalysisResponse) => Promise<void>
  deleteFromHistory: (id: string) => Promise<void>
  clearHistory: () => void
  showMLModal: boolean
  setShowMLModal: (show: boolean) => void
  showPrivacyModal: boolean
  setShowPrivacyModal: (show: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const LOCAL_STORAGE_HISTORY_KEY = 'rwh_analysis_history'

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: health, loading: healthLoading, error: healthError, refetch: refetchHealth } = useHealth(15000)
  const { user, claimCurrentAnalysis } = useAuth()
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null)
  const [showMLModal, setShowMLModal] = useState<boolean>(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false)

  const [history, setHistory] = useState<AnalysisResponse[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResponse[]>([])
  const [recentLoading, setRecentLoading] = useState<boolean>(false)
  const [recentError, setRecentError] = useState<string | null>(null)

  const refetchRecent = async () => {
    setRecentLoading(true)
    setRecentError(null)
    try {
      const res = await apiClient.get('/analysis/history?limit=5')
      if (res.data?.analyses) {
        setRecentAnalyses(res.data.analyses)
      }
    } catch (err: any) {
      setRecentError(err?.response?.data?.detail?.message || err?.message || 'Failed to fetch recent analyses')
    } finally {
      setRecentLoading(false)
    }
  }

  // Sync history and recent records with backend when user session changes
  useEffect(() => {
    async function syncHistory() {
      setRecentLoading(true)
      setRecentError(null)
      try {
        const [recentRes, fullRes] = await Promise.all([
          apiClient.get('/analysis/history?limit=5'),
          apiClient.get('/analysis/history'),
        ])
        if (recentRes.data?.analyses) {
          setRecentAnalyses(recentRes.data.analyses)
        }
        if (fullRes.data?.analyses) {
          setHistory(fullRes.data.analyses)
          localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(fullRes.data.analyses))
        }
      } catch (err: any) {
        setRecentError(err?.response?.data?.detail?.message || err?.message || 'Failed to connect to history service')
      } finally {
        setRecentLoading(false)
      }
    }
    syncHistory()
  }, [user])

  const reopenAnalysis = async (id: string): Promise<AnalysisResponse | null> => {
    try {
      const res = await apiClient.get<AnalysisResponse>(`/analysis/${id}`)
      if (res.data) {
        setAnalysisResult(res.data)
        return res.data
      }
    } catch (err) {
      console.warn('Reopen from backend failed, checking local store:', err)
    }

    // Fallback if cached locally
    const cached = history.find((h) => h.request_id === id) || recentAnalyses.find((h) => h.request_id === id)
    if (cached) {
      setAnalysisResult(cached)
      return cached
    }
    return null
  }

  const saveToHistory = async (item: AnalysisResponse) => {
    try {
      // Prepend to recent analyses ensuring max 5 displayed
      setRecentAnalyses((prev) => [item, ...prev.filter((h) => h.request_id !== item.request_id)].slice(0, 5))

      const updated = [item, ...history.filter((h) => h.request_id !== item.request_id)].slice(0, 50)
      setHistory(updated)
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updated))

      if (user && item.is_guest) {
        await claimCurrentAnalysis(item.request_id)
      }
    } catch {
      // Fallback
    }
  }

  const deleteFromHistory = async (requestId: string) => {
    try {
      await apiClient.delete(`/analysis/${requestId}`)
    } catch {
      // Ignore network errors on local deletion
    }
    setRecentAnalyses((prev) => prev.filter((h) => h.request_id !== requestId))
    const updated = history.filter((h) => h.request_id !== requestId)
    setHistory(updated)
    localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updated))
  }

  const clearHistory = () => {
    setHistory([])
    setRecentAnalyses([])
    localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY)
  }

  return (
    <AppContext.Provider
      value={{
        health,
        healthLoading,
        healthError,
        refetchHealth,
        analysisResult,
        setAnalysisResult,
        history,
        recentAnalyses,
        recentLoading,
        recentError,
        refetchRecent,
        reopenAnalysis,
        saveToHistory,
        deleteFromHistory,
        clearHistory,
        showMLModal,
        setShowMLModal,
        showPrivacyModal,
        setShowPrivacyModal,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}


export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
