import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  ShieldCheck,
  Calculator,
  Cpu,
  Bookmark,
  AlertTriangle,
  FileText,
} from 'lucide-react'
import type { HealthResponse } from '../types/health'
import type { AnalysisFormData, AnalysisResponse } from '../types/analysis'
import { analysisService } from '../services/analysisService'
import { AnalysisForm } from '../components/AnalysisForm'
import { ResultsDashboard } from '../components/ResultsDashboard'
import { HistorySection } from '../components/HistorySection'
import { MLTelemetryModal } from '../components/MLTelemetryModal'
import { StatusCard } from '../components/StatusCard'

interface OutletContextType {
  health: HealthResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export const HomePage: React.FC = () => {
  const { health, loading: healthLoading, error: healthError, refetch } = useOutletContext<OutletContextType>()

  const [activeTab, setActiveTab] = useState<'wizard' | 'results' | 'history'>('wizard')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [showMLModal, setShowMLModal] = useState(false)

  // Local storage history initialized lazily to avoid setState in effect
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
      const updated = [item, ...history.filter((h) => h.request_id !== item.request_id)].slice(0, 20)
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

  const handleRunAnalysis = async (formData: AnalysisFormData) => {
    setAnalyzing(true)
    setApiError(null)
    try {
      const result = await analysisService.runAnalysis(formData)
      setAnalysisResult(result)
      setActiveTab('results')
      window.scrollTo({ top: 380, behavior: 'smooth' })
    } catch (err: any) {
      setApiError(err.message || 'Failed to complete analysis. Please verify backend connection.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="py-8 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Section */}
        <section className="rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white p-6 sm:p-10 shadow-xl border border-slate-700/50">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Engineering Intelligence & Optimization Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              AI-Based Rainwater Harvesting Optimization
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Combining hydrological physical laws (IS 15797 / CPWD standards), chronological machine learning,
              12-month iterative water-balance simulations, and multi-criteria optimization to deliver transparent,
              defensible rainwater harvesting architectures.
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('wizard')
                  window.scrollTo({ top: 350, behavior: 'smooth' })
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center space-x-2 transition-all shadow-sm"
              >
                <Calculator className="h-4 w-4" />
                <span>Start Site Analysis</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMLModal(true)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold flex items-center space-x-2 transition-all shadow-sm"
              >
                <Cpu className="h-4 w-4 text-emerald-400" />
                <span>View Audited ML Metrics</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium flex items-center space-x-1.5 transition-all"
              >
                <Bookmark className="h-3.5 w-3.5 text-sky-400" />
                <span>History ({history.length})</span>
              </button>
            </div>
          </div>
        </section>

        {/* Tab Navigation Controls */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('wizard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'wizard'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>1. Analysis Wizard</span>
            </button>

            <button
              onClick={() => setActiveTab('results')}
              disabled={!analysisResult}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'results'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : analysisResult
                  ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>2. Results Dashboard</span>
              {analysisResult && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'history'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>3. Saved History ({history.length})</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setShowMLModal(true)}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center space-x-1"
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Inspect ML Telemetry</span>
            </button>
          </div>
        </div>

        {/* API Error Notification */}
        {apiError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-start space-x-3">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <span className="font-bold block">Engine Communication Error</span>
              <p>{apiError}</p>
            </div>
          </div>
        )}

        {/* Active Content Area */}
        {activeTab === 'wizard' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-2">
              <h2 className="text-base font-bold text-slate-900">Site & Catchment Input Specification</h2>
              <p className="text-xs text-slate-500">
                Provide site physical parameters or choose a verification benchmark preset to calculate optimal storage and recharge design.
              </p>
            </div>
            <AnalysisForm onSubmit={handleRunAnalysis} loading={analyzing} />
          </div>
        )}

        {activeTab === 'results' && analysisResult && (
          <ResultsDashboard
            data={analysisResult}
            onReset={() => setActiveTab('wizard')}
            onSave={saveToHistory}
          />
        )}

        {activeTab === 'history' && (
          <HistorySection
            history={history}
            onSelect={(item) => {
              setAnalysisResult(item)
              setActiveTab('results')
            }}
            onClear={clearHistory}
            onDelete={deleteFromHistory}
          />
        )}

        {/* Real-time System Connectivity Telemetry (Collapsible at bottom) */}
        <section className="pt-6 border-t border-slate-200">
          <StatusCard
            health={health}
            loading={healthLoading}
            error={healthError}
            onRefresh={refetch}
          />
        </section>
      </div>

      {/* ML Telemetry Modal */}
      <MLTelemetryModal isOpen={showMLModal} onClose={() => setShowMLModal(false)} />
    </div>
  )
}
