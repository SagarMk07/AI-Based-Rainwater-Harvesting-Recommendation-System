import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Calculator, FileText, RotateCcw, UserPlus, Info, RefreshCw } from 'lucide-react'
import type { AnalysisFormData } from '../types/analysis'
import { analysisService } from '../services/analysisService'
import { AnalysisForm } from '../components/AnalysisForm'
import { ResultsDashboard } from '../components/ResultsDashboard'
import { AuthModal } from '../components/auth/AuthModal'
import { useAppContext } from '../context/useAppContext'
import { useAuth } from '../context/useAuth'
import PageHeader from '../components/ui/PageHeader'

export const AnalyzePage: React.FC = () => {
  const {
    analysisResult,
    setAnalysisResult,
    history,
    saveToHistory,
  } = useAppContext()

  const { isGuest, claimCurrentAnalysis } = useAuth()

  const [view, setView] = useState<'form' | 'results'>(analysisResult ? 'results' : 'form')
  const [analyzing, setAnalyzing] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [lastSubmittedData, setLastSubmittedData] = useState<AnalysisFormData | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleRunAnalysis = async (formData: AnalysisFormData) => {
    setAnalyzing(true)
    setApiError(null)
    setLastSubmittedData(formData)
    try {
      const result = await analysisService.runAnalysis(formData)
      setAnalysisResult(result)
      await saveToHistory(result)
      setView('results')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      setApiError(err.message || 'Failed to complete analysis. Please verify backend connection.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleRetry = () => {
    if (lastSubmittedData) {
      handleRunAnalysis(lastSubmittedData)
    }
  }

  const handleAuthSuccess = async () => {
    setShowAuthModal(false)
    if (analysisResult?.request_id) {
      try {
        await claimCurrentAnalysis(analysisResult.request_id)
        await saveToHistory({ ...analysisResult, is_guest: false })
      } catch (err) {
        console.warn('Could not auto-claim analysis:', err)
      }
    }
  }

  return (
    <div className="py-6 sm:py-8 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Guest Access Information Notice */}
        {isGuest && (
          <div className="neu-card p-4 sm:p-5 text-xs text-ink flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl animate-in fade-in">
            <div className="flex items-start space-x-3 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-surface border border-white/80 shadow-neu-sm flex items-center justify-center text-sky-700 flex-shrink-0 mt-0.5">
                <Info className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-sm block text-ink">Guest Property Analysis Mode</span>
                <p className="text-ink-secondary leading-relaxed mt-0.5">
                  You are evaluating property hydrology as a guest. All 5 steps, physical continuity equations,
                  and AI tank-sizing algorithms are active. Create an account to permanently save your records.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-auto">
              <Link
                to="/signup"
                state={{ from: { pathname: '/analyze' } }}
                className="neu-btn-primary px-3.5 py-2 rounded-xl font-bold text-xs inline-flex items-center space-x-1.5"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Create Free Account</span>
              </Link>
            </div>
          </div>
        )}

        {/* API Error Notification with Retry */}
        {apiError && (
          <div className="neu-card p-4 sm:p-5 text-xs text-rose-900 border border-rose-300 bg-rose-50/70 flex flex-col sm:flex-row items-start justify-between gap-3 rounded-2xl animate-in fade-in">
            <div className="flex items-start space-x-3 min-w-0">
              <AlertTriangle className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <span className="font-bold text-sm block text-rose-950">Calculation Engine Notice</span>
                <p className="leading-relaxed text-rose-800">{apiError}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-auto">
              {lastSubmittedData && (
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={analyzing}
                  className="inline-flex items-center space-x-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white px-3 py-1.5 font-bold text-xs shadow-sm transition disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                  <span>Retry Calculation</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setApiError(null)}
                className="neu-btn-secondary px-3 py-1.5 rounded-xl font-semibold text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* View Mode Switcher Header if Analysis is available */}
        {analysisResult && (
          <div className="flex items-center justify-between neu-card p-2 rounded-2xl">
            <div className="flex items-center space-x-1.5 neu-inset p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setView('form')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  view === 'form'
                    ? 'bg-surface text-ink shadow-neu-sm font-bold border border-white/80'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Edit Parameters
              </button>
              <button
                type="button"
                onClick={() => setView('results')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  view === 'results'
                    ? 'bg-surface text-forest-700 shadow-neu-sm font-bold border border-white/80'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Current Assessment Results
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setView('form')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="text-xs text-ink-secondary hover:text-ink font-semibold px-2.5 py-1 flex items-center space-x-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Assessment</span>
            </button>
          </div>
        )}

        {/* Main Content Area: Form or Results */}
        {view === 'form' ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <PageHeader
              eyebrow="5-Step Guided Configuration"
              title="Site & Catchment Input Specification"
              description="Provide property dimensions, select location weather data, and specify water demand. You can also choose any of the 4 benchmark test scenarios to pre-fill standard parameters."
            />

            <AnalysisForm onSubmit={handleRunAnalysis} loading={analyzing} />
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            {analysisResult ? (
              <ResultsDashboard
                data={analysisResult}
                onReset={() => {
                  setView('form')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                onSave={saveToHistory}
                isGuest={isGuest}
                onPromptSaveAccount={() => setShowAuthModal(true)}
              />
            ) : (
              <div className="neu-card p-12 text-center max-w-2xl mx-auto my-12 space-y-5 rounded-3xl">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface border border-white/80 shadow-neu-sm text-forest-700">
                  <FileText className="h-7 w-7 text-forest-700" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-black text-ink">No Active Analysis Loaded</h3>
                  <p className="text-xs sm:text-sm text-ink-secondary max-w-md mx-auto leading-relaxed">
                    Configure your site parameters or choose a verification benchmark preset to calculate
                    optimal tank sizing, recharge structures, and water-balance curves.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setView('form')}
                    className="neu-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center space-x-2"
                  >
                    <Calculator className="h-4 w-4" />
                    <span>Launch 5-Step Analysis Wizard</span>
                  </button>
                  {history.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setAnalysisResult(history[0])
                        setView('results')
                      }}
                      className="neu-btn-secondary px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center space-x-2"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-ink-muted" />
                      <span>Load Latest Run</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal for guests clicking Save Analysis */}
        <AuthModal
          isOpen={showAuthModal}
          initialMode="signup"
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    </div>
  )
}

export default AnalyzePage
