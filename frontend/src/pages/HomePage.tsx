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
  } = useOutletContext<AppContextType>()

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
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-start space-x-3 shadow-sm animate-in fade-in">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <span className="font-bold text-sm block">Engine Communication Error</span>
              <p className="leading-relaxed">{apiError}</p>
              <button
                type="button"
                onClick={() => setApiError(null)}
                className="mt-2 inline-flex items-center space-x-1 font-semibold text-red-900 underline hover:no-underline"
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
                <div className="pt-6 border-t border-slate-200/80">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Hydrological System Architecture</h3>
                      <p className="text-xs text-slate-500">
                        How RainHarvest AI transforms precipitation data into sizing specifications
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('about')}
                      className="text-xs font-semibold text-forest-700 hover:text-forest-800 flex items-center space-x-1"
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
            <div className="border-b border-slate-200 pb-4">
              <div className="inline-flex items-center space-x-2 rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-700 border border-forest-200 mb-2">
                <Calculator className="h-3.5 w-3.5" />
                <span>5-Step Guided Configuration</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Site & Catchment Input Specification
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
                Provide property dimensions, select location weather data, and specify water demand.
                You can also choose any of the 4 benchmark test scenarios to pre-fill standard parameters.
              </p>
            </div>

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
              />
            ) : (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-12 text-center shadow-card max-w-2xl mx-auto my-12 space-y-5">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-50 text-forest-700 border border-forest-200">
                  <FileText className="h-7 w-7 text-forest-600" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-slate-900">No Active Analysis Loaded</h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
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
                    className="inline-flex items-center space-x-2 rounded-xl bg-forest-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-forest-800 transition"
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
                      className="inline-flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
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
        <section className="pt-8 border-t border-slate-200/80">
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
