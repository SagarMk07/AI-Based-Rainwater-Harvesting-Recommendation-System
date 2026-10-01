import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar, type NavTab } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { useHealth } from '../hooks/useHealth'
import type { HealthResponse } from '../types/health'
import type { AnalysisResponse } from '../types/analysis'
import { MLTelemetryModal } from '../components/MLTelemetryModal'

export interface AppContextType {
  health: HealthResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
  activeTab: NavTab
  setActiveTab: (tab: NavTab) => void
  analysisResult: AnalysisResponse | null
  setAnalysisResult: (result: AnalysisResponse | null) => void
  history: AnalysisResponse[]
  saveToHistory: (item: AnalysisResponse) => void
  deleteFromHistory: (id: string) => void
  clearHistory: () => void
  openTelemetry: () => void
}

export const RootLayout: React.FC = () => {
  const { data: health, loading, error, refetch } = useHealth(15000)
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null)
  const [showMLModal, setShowMLModal] = useState(false)

  const [history, setHistory] = useState<AnalysisResponse[]>(() => {
    try {
      const stored = localStorage.getItem('rwh_analysis_history')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const saveToHistory = (item: AnalysisResponse) => {
    try {
      const updated = [item, ...history.filter((h) => h.request_id !== item.request_id)].slice(0, 25)
      setHistory(updated)
      localStorage.setItem('rwh_analysis_history', JSON.stringify(updated))
    } catch {
      // Fallback
    }
  }

  const deleteFromHistory = (requestId: string) => {
    const updated = history.filter((h) => h.request_id !== requestId)
    setHistory(updated)
    localStorage.setItem('rwh_analysis_history', JSON.stringify(updated))
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('rwh_analysis_history')
  }

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-forest-100 selection:text-forest-900">
      <Navbar
        health={health}
        loading={loading}
        error={error}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenTelemetry={() => setShowMLModal(true)}
        historyCount={history.length}
        hasResult={!!analysisResult}
      />
      <main className="flex-1">
        <Outlet
          context={{
            health,
            loading,
            error,
            refetch,
            activeTab,
            setActiveTab,
            analysisResult,
            setAnalysisResult,
            history,
            saveToHistory,
            deleteFromHistory,
            clearHistory,
            openTelemetry: () => setShowMLModal(true),
          }}
        />
      </main>
      <Footer
        onTabChange={handleTabChange}
        onOpenTelemetry={() => setShowMLModal(true)}
      />
      <MLTelemetryModal isOpen={showMLModal} onClose={() => setShowMLModal(false)} />
    </div>
  )
}
export default RootLayout
