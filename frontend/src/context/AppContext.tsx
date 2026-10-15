import React, { useState, useEffect } from 'react'
import { useHealth } from '../hooks/useHealth'
import type { AnalysisResponse } from '../types/analysis'
import { useAuth } from './useAuth'
import { apiClient } from '../services/api'
import { AppContext, type AppContextType } from './appContextDef'

export type { AppContextType }

const getStorageKey = (userId?: string | null) => `rwh_history_${userId || 'guest'}`

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: health, loading: healthLoading, error: healthError, refetch: refetchHealth } = useHealth(15000)
  const { user, claimCurrentAnalysis } = useAuth()
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null)
  const [showMLModal, setShowMLModal] = useState<boolean>(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false)

  const [history, setHistory] = useState<AnalysisResponse[]>(() => {
    try {
      const stored = localStorage.getItem(getStorageKey(user?.id))
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
    let isMounted = true
    const key = getStorageKey(user?.id)

    async function syncHistory() {
      try {
        const localCached = localStorage.getItem(key)
        if (localCached && isMounted) {
          setHistory(JSON.parse(localCached))
        }
      } catch {
        // Ignore cache parse error
      }

      setRecentLoading(true)
      setRecentError(null)
      try {
        const [recentRes, fullRes] = await Promise.all([
          apiClient.get('/analysis/history?limit=5'),
          apiClient.get('/analysis/history'),
        ])
        if (!isMounted) return
        if (recentRes.data?.analyses) {
          setRecentAnalyses(recentRes.data.analyses)
        }
        if (fullRes.data?.analyses) {
          setHistory(fullRes.data.analyses)
          localStorage.setItem(key, JSON.stringify(fullRes.data.analyses))
        }
      } catch (err: any) {
        if (isMounted) {
          setRecentError(err?.response?.data?.detail?.message || err?.message || 'Failed to connect to history service')
        }
      } finally {
        if (isMounted) {
          setRecentLoading(false)
        }
      }
    }
    syncHistory()

    return () => {
      isMounted = false
    }
  }, [user?.id])

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
      localStorage.setItem(getStorageKey(user?.id), JSON.stringify(updated))

      if (user && item.is_guest) {
        await claimCurrentAnalysis(item.request_id)
      }
    } catch {
      // Fallback
    }
  }

  const deleteFromHistory = async (requestId: string) => {
    // 1. Delete from backend persistent storage first (throws if unauthorized or failed)
    await apiClient.delete(`/analysis/${requestId}`)

    // 2. Only upon confirmed backend deletion, invalidate in-memory and local caches
    setRecentAnalyses((prev) => prev.filter((h) => h.request_id !== requestId))
    setHistory((prev) => {
      const updated = prev.filter((h) => h.request_id !== requestId)
      localStorage.setItem(getStorageKey(user?.id), JSON.stringify(updated))
      return updated
    })
  }

  const clearHistory = async () => {
    try {
      if (user) {
        await apiClient.delete('/analysis/history/clear')
      }
    } catch (e) {
      console.warn('Backend clear history failed:', e)
    }
    setHistory([])
    setRecentAnalyses([])
    localStorage.removeItem(getStorageKey(user?.id))
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
