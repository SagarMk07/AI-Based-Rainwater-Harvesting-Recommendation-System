import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  AlertTriangle,
  Calculator,
  FileText,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'
import type { AppContextType } from '../layouts/RootLayout'
import type { AnalysisFormData } from '../types/analysis'
import { analysisService } from '../services/analysisService'
import { AnalysisForm } from '../components/AnalysisForm'
import { ResultsDashboard } from '../components/ResultsDashboard'
import { HistorySection } from '../components/HistorySection'
import { DashboardSummary } from '../components/DashboardSummary'
import { LandingHero } from '../components/LandingHero'
import { AboutSection } from '../components/AboutSection'
import { StatusCard } from '../components/StatusCard'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'

export const HomePage: React.FC = () => {
  const {
    health,
    loading: healthLoading,
    error: healthError,
    refetch,
    activeTab,
    setActiveTab,
    analysisResult,
    setAnalysisResult,
    history,
    saveToHistory,
    deleteFromHistory,
    clearHistory,
    openTelemetry,
    openAuth,
  } = useOutletContext<AppContextType>()

  const { isGuest } = useAuth()

  const [analyzing, setAnalyzing] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleRunAnalysis = async (formData: AnalysisFormData) => {
    setAnalyzing(true)
    setApiError(null)
    try {
      const result = await analysisService.runAnalysis(formData)
      setAnalysisResult(result)
      saveToHistory(result)
      setActiveTab('results')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      setApiError(err.message || 'Failed to complete analysis. Please verify backend connection.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="py-6 sm:py-8 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* API Error Notification */}
        {apiError && (
          <div className="neu-card p-4 text-xs text-rose-900 border border-rose-300 bg-rose-50/70 flex items-start space-x-3 rounded-2xl animate-in fade-in">
            <AlertTriangle className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <span className="font-bold text-sm block">Engine Communication Error</span>
              <p className="leading-relaxed">{apiError}</p>
              <button
                type="button"
                onClick={() => setApiError(null)}
                className="mt-2 inline-flex items-center space-x-1 font-bold text-rose-900 underline hover:no-underline"
              >
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab View 1: DASHBOARD (Summary if data exists, or Landing Hero if empty) */}
        {activeTab === 'dashboard' && (
          <>
            {history.length > 0 || analysisResult ? (
              <div className="space-y-10">
                <DashboardSummary
                  history={history}
                  latestAnalysis={analysisResult}
                  onStartNew={() => {
                    setActiveTab('wizard')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  onSelectAnalysis={(item) => {
                    setAnalysisResult(item)
                    setActiveTab('results')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  onOpenTelemetry={openTelemetry}
                  onViewAllHistory={() => {
                    setActiveTab('history')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                />

                {/* Subordinate landing features to keep platform overview accessible */}
                <div className="pt-6 border-t border-[#DEDFD8]">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-ink">Hydrological System Architecture</h3>
                      <p className="text-xs text-ink-muted">
                        How RainHarvest AI transforms precipitation data into sizing specifications
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('about')}
                      className="text-xs font-bold text-forest-700 hover:text-forest-800 flex items-center space-x-1"
                    >
                      <span>Read Engineering Specs</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <LandingHero
                    onStartAnalysis={() => {
                      setActiveTab('wizard')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    onOpenTelemetry={openTelemetry}
                  />
                </div>
              </div>
            ) : (
              <LandingHero
                onStartAnalysis={() => {
                  setActiveTab('wizard')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                onOpenTelemetry={openTelemetry}
              />
            )}
          </>
        )}

        {/* Tab View 2: WIZARD */}
        {activeTab === 'wizard' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <PageHeader
              eyebrow="5-Step Guided Configuration"
              title="Site & Catchment Input Specification"
              description="Provide property dimensions, select location weather data, and specify water demand. You can also choose any of the 4 benchmark test scenarios to pre-fill standard parameters."
            />

            <AnalysisForm onSubmit={handleRunAnalysis} loading={analyzing} />
          </div>
        )}

        {/* Tab View 3: RESULTS */}
        {activeTab === 'results' && (
          <div className="animate-in fade-in duration-300">
            {analysisResult ? (
              <ResultsDashboard
                data={analysisResult}
                onReset={() => {
                  setActiveTab('wizard')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                onSave={saveToHistory}
                isGuest={isGuest}
                onPromptSaveAccount={() => openAuth('signup')}
              />
            ) : (
              <div className="neu-card p-12 text-center max-w-2xl mx-auto my-12 space-y-5 rounded-3xl">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface border border-white/80 shadow-neu-sm text-forest-700">
                  <FileText className="h-7 w-7 text-forest-700" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-ink">No Active Analysis Loaded</h3>
                  <p className="text-xs sm:text-sm text-ink-secondary max-w-md mx-auto leading-relaxed">
                    Configure your site parameters or choose a verification benchmark preset to calculate
                    optimal tank sizing, recharge structures, and water-balance curves.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('wizard')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
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
                      }}
                      className="neu-btn-secondary px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center space-x-2"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-ink-muted" />
                      <span>Load Latest Saved Run</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab View 4: HISTORY */}
        {activeTab === 'history' && (
          <div className="animate-in fade-in duration-300">
            <HistorySection
              history={history}
              onSelect={(item) => {
                setAnalysisResult(item)
                setActiveTab('results')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              onClear={clearHistory}
              onDelete={deleteFromHistory}
              onStartNew={() => {
                setActiveTab('wizard')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          </div>
        )}

        {/* Tab View 5: ABOUT / METHODOLOGY */}
        {activeTab === 'about' && (
          <div className="animate-in fade-in duration-300">
            <AboutSection />
          </div>
        )}

        {/* Real-time System Connectivity Telemetry (Bottom collapsible) */}
        <section className="pt-8 border-t border-[#DEDFD8]">
          <StatusCard
            health={health}
            loading={healthLoading}
            error={healthError}
            onRefresh={refetch}
          />
        </section>
      </div>
    </div>
  )
}
export default HomePage
