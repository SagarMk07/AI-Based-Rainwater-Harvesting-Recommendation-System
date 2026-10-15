import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar, type NavTab } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { useHealth } from '../hooks/useHealth'
import type { HealthResponse } from '../types/health'
import type { AnalysisResponse } from '../types/analysis'
import { MLTelemetryModal } from '../components/MLTelemetryModal'
import { RainHarvestChatWidget } from '../components/RainHarvestChatWidget'
import { AuthProvider } from '../context/AuthContext'
import { useAuth } from '../context/useAuth'
import { AuthModal, type AuthMode } from '../components/auth/AuthModal'
import { PrivacyPolicyModal } from '../components/PrivacyPolicyModal'
import { registerSessionExpiredHandler } from '../services/api'
import { apiClient } from '../services/api'

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
  openAuth: (mode?: AuthMode) => void
  openPrivacy: () => void
}

const RootLayoutInner: React.FC = () => {
  const { data: health, loading, error, refetch } = useHealth(15000)
  const { user, isGuest, logout, deleteAccount, pendingAnalysis, setPendingAnalysis, claimCurrentAnalysis } = useAuth()
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null)
  const [showMLModal, setShowMLModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('login')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Listen for 401 session expiration from API client
  useEffect(() => {
    registerSessionExpiredHandler(() => {
      setAuthModalMode('session_expired')
      setShowAuthModal(true)
    })
  }, [])

  const [history, setHistory] = useState<AnalysisResponse[]>(() => {
    try {
      const stored = localStorage.getItem('rwh_analysis_history')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Sync history with backend on auth state changes
  useEffect(() => {
    async function syncUserHistory() {
      try {
        const res = await apiClient.get('/analysis/history')
        if (res.data?.analyses) {
          setHistory(res.data.analyses)
          localStorage.setItem('rwh_analysis_history', JSON.stringify(res.data.analyses))
        }
      } catch {
        // Fallback to local storage cache if offline
      }
    }
    syncUserHistory()
  }, [user])

  const saveToHistory = async (item: AnalysisResponse) => {
    try {
      const updated = [item, ...history.filter((h) => h.request_id !== item.request_id)].slice(0, 25)
      setHistory(updated)
      localStorage.setItem('rwh_analysis_history', JSON.stringify(updated))

      // If user is logged in and analysis is guest, claim it on backend
      if (user && item.is_guest) {
        await claimCurrentAnalysis(item.request_id)
      }
    } catch {
      // Fallback
    }
  }

  const deleteFromHistory = async (requestId: string) => {
    await apiClient.delete(`/analysis/${requestId}`)
    const updated = history.filter((h) => h.request_id !== requestId)
    setHistory(updated)
    localStorage.setItem('rwh_analysis_history', JSON.stringify(updated))
  }

  const clearHistory = async () => {
    try {
      if (user) {
        await apiClient.delete('/analysis/history/clear')
      }
    } catch {
      // Fallback
    }
    setHistory([])
    localStorage.removeItem('rwh_analysis_history')
  }

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenAuth = (mode: AuthMode = 'login') => {
    setAuthModalMode(mode)
    setShowAuthModal(true)
  }

  const handleAuthSuccess = async () => {
    if (pendingAnalysis) {
      try {
        await claimCurrentAnalysis(pendingAnalysis.request_id)
        setPendingAnalysis(null)
      } catch (e) {
        console.warn('Could not auto-claim analysis:', e)
      }
    }
  }

  const handleDeleteAccountConfirm = async () => {
    const res = await deleteAccount()
    setShowDeleteConfirm(false)
    if (res.success) {
      clearHistory()
      setAnalysisResult(null)
      setActiveTab('dashboard')
    } else {
      alert(res.error || 'Failed to delete account')
    }
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
        user={user}
        isGuest={isGuest}
        onOpenAuth={handleOpenAuth}
        onLogout={logout}
        onOpenPrivacy={() => setShowPrivacyModal(true)}
        onDeleteAccount={() => setShowDeleteConfirm(true)}
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
            openAuth: handleOpenAuth,
            openPrivacy: () => setShowPrivacyModal(true),
          }}
        />
      </main>

      <Footer
        onTabChange={handleTabChange}
        onOpenTelemetry={() => setShowMLModal(true)}
      />

      {/* Modals */}
      <MLTelemetryModal isOpen={showMLModal} onClose={() => setShowMLModal(false)} />
      <PrivacyPolicyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      <AuthModal
        isOpen={showAuthModal}
        initialMode={authModalMode}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Delete Account Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-rose-200">
            <h3 className="text-base font-bold text-rose-900">Confirm Permanent Account Deletion</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              This will permanently delete your profile, saved properties, and all associated hydrological recommendations from both the cloud database and local cache. This action is irreversible.
            </p>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccountConfirm}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                Permanently Delete Data
              </button>
            </div>
          </div>
        </div>
      )}

      <RainHarvestChatWidget />
    </div>
  )
}

export const RootLayout: React.FC = () => {
  return (
    <AuthProvider>
      <RootLayoutInner />
    </AuthProvider>
  )
}

export default RootLayout
