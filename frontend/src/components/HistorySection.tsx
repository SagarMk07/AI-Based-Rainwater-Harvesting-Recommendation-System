import React from 'react'
import {
  Trash2,
  ArrowUpRight,
  Clock,
  PlusCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import type { AnalysisResponse } from '../types/analysis'
import { PageHeader } from './ui/PageHeader'

interface Props {
  history: AnalysisResponse[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  onSelect: (item: AnalysisResponse) => void
  onClear: () => void
  onDelete: (requestId: string) => void
  onStartNew: () => void
  onBackToDashboard?: () => void
  page?: number
  pageSize?: number
  totalPages?: number
  totalCount?: number
  onPageChange?: (newPage: number) => void
}

export const HistorySection: React.FC<Props> = ({
  history,
  loading = false,
  error = null,
  onRetry,
  onSelect,
  onClear,
  onDelete,
  onStartNew,
  onBackToDashboard,
  page = 1,
  pageSize = 10,
  totalPages = 1,
  totalCount = 0,
  onPageChange,
}) => {
  const currentTotal = totalCount || history.length

  // Loading State
  if (loading && history.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <PageHeader
          eyebrow={
            <span className="text-xs uppercase font-mono font-bold text-forest-700 tracking-wider">
              Saved Archives
            </span>
          }
          title="Archived Property Analyses"
          description="Past property evaluations, storage sizing simulations, and investment reports."
          actions={
            onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="neu-btn-secondary h-10 px-4 rounded-xl font-semibold text-xs inline-flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
            )
          }
        />
        <div className="neu-card p-8 text-center space-y-4 rounded-3xl animate-pulse">
          <div className="h-10 w-10 bg-[#DEDFD8] rounded-xl mx-auto"></div>
          <div className="h-4 bg-[#DEDFD8] rounded w-1/3 mx-auto"></div>
          <div className="h-3 bg-[#DEDFD8] rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    )
  }

  // Error State
  if (error && history.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <PageHeader
          eyebrow={
            <span className="text-xs uppercase font-mono font-bold text-rose-700 tracking-wider">
              System Notice
            </span>
          }
          title="Analysis History Unavailable"
          description="Could not synchronize persisted records from storage."
          actions={
            onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="neu-btn-secondary h-10 px-4 rounded-xl font-semibold text-xs inline-flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
            )
          }
        />
        <div className="neu-card p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 rounded-3xl border border-rose-200">
          <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-ink">Failed to Load Saved Analyses</h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">{error}</p>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="neu-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Request</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  // Empty State
  if (history.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <PageHeader
          eyebrow={
            <span className="text-xs uppercase font-mono font-bold text-forest-700 tracking-wider">
              Saved Archives
            </span>
          }
          title="Archived Property Analyses"
          description="Past property evaluations, storage sizing simulations, and investment reports."
          actions={
            <div className="flex items-center space-x-2">
              {onBackToDashboard && (
                <button
                  type="button"
                  onClick={onBackToDashboard}
                  className="neu-btn-secondary h-10 px-4 rounded-xl font-semibold text-xs inline-flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Dashboard</span>
                </button>
              )}
              <button
                type="button"
                onClick={onStartNew}
                className="neu-btn-primary h-10 px-5 rounded-xl font-bold text-xs inline-flex items-center space-x-2"
              >
                <PlusCircle className="h-4 w-4" />
                <span>+ New Analysis</span>
              </button>
            </div>
          }
        />

        <div className="neu-card p-8 sm:p-12 text-center max-w-xl mx-auto my-6 space-y-4 rounded-3xl">
          <div className="h-14 w-14 rounded-2xl bg-surface border border-white/80 shadow-neu-sm text-forest-700 flex items-center justify-center mx-auto">
            <Clock className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-ink">No Analyses Yet</h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
              Analyze your first property to evaluate rainfall catchment yield, compare candidate tanks, and see your customized AI recommendation.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartNew}
            className="neu-btn-primary h-10 px-5 rounded-xl font-bold text-xs inline-flex items-center space-x-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Start Analysis</span>
          </button>
        </div>
      </div>
    )
  }

  const startRecord = (page - 1) * pageSize + 1
  const endRecord = Math.min(page * pageSize, currentTotal)

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Unified Page Header */}
      <PageHeader
        eyebrow={
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-mono font-bold text-forest-700 tracking-wider">
              Saved Archives
            </span>
            <span className="text-xs font-mono bg-surface border border-white/80 shadow-neu-sm text-ink-secondary px-2.5 py-0.5 rounded-full font-bold">
              {currentTotal} Persisted
            </span>
          </div>
        }
        title="Archived Property Analyses"
        description="Past property evaluations, storage sizing simulations, and investment reports."
        actions={
          <>
            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="neu-btn-secondary h-10 px-4 rounded-xl text-xs font-semibold inline-flex items-center space-x-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
            )}

            <button
              type="button"
              onClick={onStartNew}
              className="neu-btn-primary h-10 px-4 rounded-xl text-xs font-bold inline-flex items-center space-x-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>+ New Analysis</span>
            </button>

            <button
              type="button"
              onClick={onClear}
              className="neu-btn-secondary h-10 px-4 rounded-xl text-xs font-semibold hover:text-rose-700 inline-flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear Local</span>
            </button>
          </>
        }
      />

      <div className="neu-card p-5 sm:p-6 space-y-6 rounded-3xl">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DEDFD8] text-ink-muted font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Roof Area</th>
                <th className="py-3 px-3">Rainfall</th>
                <th className="py-3 px-3">Recommended System</th>
                <th className="py-3 px-3">Harvest Potential</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEDFD8] font-medium">
              {history.map((item) => {
                const cityName = item.weather?.city || 'Location'
                const stateName = item.weather?.state || ''
                const roofArea = item.explainability?.engineering_factors?.catchment_sqm || 200
                const annualRain = item.weather?.annual_rainfall_mm ?? 0
                const sysType = item.recommendation?.system_type || 'Custom System'
                const grossHarvest = item.recommendation?.annual_gross_harvest_litres ?? 0
                const savingsPct = item.recommendation?.water_savings_percentage ?? 0
                const formattedDate = item.timestamp
                  ? new Date(item.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Saved'

                return (
                  <tr key={item.request_id} className="hover:bg-[#EEEEEA] transition-colors">
                    <td className="py-3.5 px-3 font-mono text-ink-muted text-[11px]">
                      {formattedDate}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-ink block">{cityName}</span>
                      {stateName && <span className="text-[10px] text-ink-muted font-mono">{stateName}</span>}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-ink-secondary">
                      {roofArea} m²
                    </td>
                    <td className="py-3.5 px-3 font-mono text-ink-secondary">
                      {annualRain} mm
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-surface border border-white/80 shadow-neu-sm text-forest-800 text-[11px] font-bold">
                        {sysType}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono">
                      <span className="font-bold text-ink block">
                        {grossHarvest.toLocaleString()} L
                      </span>
                      <span className="text-[10px] text-forest-700 font-bold">
                        {savingsPct}% demand met
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          onClick={() => onSelect(item)}
                          className="neu-btn-primary px-3 py-1.5 rounded-lg font-bold text-xs inline-flex items-center space-x-1"
                        >
                          <span>Reopen</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => onDelete(item.request_id)}
                          className="p-1.5 text-ink-muted hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-3.5">
          {history.map((item) => {
            const cityName = item.weather?.city || 'Location'
            const roofArea = item.explainability?.engineering_factors?.catchment_sqm || 200
            const annualRain = item.weather?.annual_rainfall_mm ?? 0
            const sysType = item.recommendation?.system_type || 'Custom System'
            const grossHarvest = item.recommendation?.annual_gross_harvest_litres ?? 0
            const savingsPct = item.recommendation?.water_savings_percentage ?? 0
            const formattedDate = item.timestamp
              ? new Date(item.timestamp).toLocaleDateString()
              : 'Saved'

            return (
              <div
                key={item.request_id}
                className="neu-card-sm p-4 space-y-3 rounded-2xl"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink text-sm">{cityName}</span>
                  <span className="text-[11px] font-mono text-ink-muted">
                    {formattedDate}
                  </span>
                </div>

                <div className="text-xs">
                  <span className="font-semibold text-forest-800 bg-surface px-2.5 py-1 rounded-lg border border-white/80 shadow-neu-sm block truncate">
                    {sysType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-ink-secondary">
                  <div>
                    <span className="text-ink-muted block text-[10px]">Rainfall</span>
                    <span>{annualRain} mm</span>
                  </div>
                  <div>
                    <span className="text-ink-muted block text-[10px]">Roof Area</span>
                    <span>{roofArea} m²</span>
                  </div>
                  <div>
                    <span className="text-ink-muted block text-[10px]">Harvest</span>
                    <span className="font-bold text-ink">
                      {grossHarvest.toLocaleString()} L
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-muted block text-[10px]">Savings</span>
                    <span className="text-forest-700 font-bold">
                      {savingsPct}%
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#DEDFD8] flex items-center justify-between">
                  <button
                    onClick={() => onSelect(item)}
                    className="neu-btn-primary px-3 py-1.5 rounded-lg font-bold text-xs inline-flex items-center space-x-1"
                  >
                    <span>Reopen Analysis</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onDelete(item.request_id)}
                    className="text-ink-muted hover:text-rose-600 p-1.5"
                    title="Delete record"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && onPageChange && (
          <div className="pt-4 border-t border-[#DEDFD8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <span className="text-ink-muted">
              Showing {startRecord}–{endRecord} of {currentTotal} assessments
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="neu-btn-secondary px-3 py-1.5 rounded-lg font-bold inline-flex items-center space-x-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </button>

              <span className="px-3 py-1 bg-surface border border-white/80 shadow-neu-sm rounded-lg font-bold text-ink">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="neu-btn-secondary px-3 py-1.5 rounded-lg font-bold inline-flex items-center space-x-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default HistorySection
