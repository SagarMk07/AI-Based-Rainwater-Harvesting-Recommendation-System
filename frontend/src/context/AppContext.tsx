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

  // Sync history with backend when user session changes
  useEffect(() => {
    async function syncHistory() {
      try {
        const res = await apiClient.get('/analysis/history')
        if (res.data?.analyses) {
          setHistory(res.data.analyses)
          localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(res.data.analyses))
        }
      } catch {
        // Fallback to local storage if offline
      }
    }
    syncHistory()
  }, [user])

  const saveToHistory = async (item: AnalysisResponse) => {
    try {
      const updated = [item, ...history.filter((h) => h.request_id !== item.request_id)].slice(0, 25)
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
    const updated = history.filter((h) => h.request_id !== requestId)
    setHistory(updated)
    localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updated))
  }

  const clearHistory = () => {
    setHistory([])
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
