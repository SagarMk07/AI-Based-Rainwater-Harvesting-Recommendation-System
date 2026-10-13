import React from 'react'
import {
  PlusCircle,
  Compass,
  ArrowUpRight,
  Droplet,
  Layers,
  ShieldCheck,
  TrendingUp,
  Cpu,
} from 'lucide-react'
import type { AnalysisResponse } from '../types/analysis'
import { PageHeader } from './ui/PageHeader'

interface DashboardSummaryProps {
  recentAnalyses?: AnalysisResponse[]
  recentLoading?: boolean
  recentError?: string | null
  onRetryRecent?: () => void
  totalCount?: number
  history?: AnalysisResponse[]
  latestAnalysis: AnalysisResponse | null
  onStartNew: () => void
  onSelectAnalysis: (item: AnalysisResponse) => void
  onOpenTelemetry: () => void
  onViewAllHistory: () => void
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  recentAnalyses,
  recentLoading = false,
  recentError = null,
  onRetryRecent,
  totalCount,
  history = [],
  latestAnalysis,
  onStartNew,
  onSelectAnalysis,
  onOpenTelemetry,
  onViewAllHistory,
}) => {
  // Use recentAnalyses prop if provided; otherwise fallback to history.slice(0, 5)
  const displayRecent = recentAnalyses !== undefined ? recentAnalyses : history.slice(0, 5)

  // Aggregate stats: computed from all available historical records (or recent if full history not loaded)
  const statsSource = history.length > 0 ? history : displayRecent
  const totalHarvestPotential = statsSource.reduce(
    (sum, item) => sum + (item.recommendation?.annual_gross_harvest_litres || 0),
    0
  )
  const totalUsablePotential = statsSource.reduce(
    (sum, item) => sum + (item.recommendation?.annual_usable_litres || 0),
    0
  )
  const avgDemandMet =
    statsSource.length > 0
      ? Math.round(
          statsSource.reduce(
            (sum, item) => sum + (item.recommendation?.water_savings_percentage || 0),
            0
          ) / statsSource.length
        )
      : 0

  const activeLatest = latestAnalysis || (displayRecent.length > 0 ? displayRecent[0] : null)
  const totalSavedCount = totalCount !== undefined ? totalCount : (history.length || displayRecent.length)


  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Quick Action */}
      <PageHeader
        eyebrow={
          <span className="text-xs uppercase font-mono font-bold text-forest-700 tracking-wider">
            Environmental Intelligence Overview
          </span>
        }
        title="System Dashboard"
        description="Real-time summary of evaluated catchments, simulated storage capacities, and ecological savings."
        actions={
          <>
            <button
              type="button"
              onClick={onStartNew}
              className="neu-btn-primary h-10 px-5 rounded-xl font-bold text-xs inline-flex items-center space-x-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>+ New Analysis</span>
            </button>

            <button
              type="button"
              onClick={onOpenTelemetry}
              className="neu-btn-secondary h-10 px-4 rounded-xl font-semibold text-xs inline-flex items-center space-x-2"
            >
              <Cpu className="h-4 w-4 text-forest-700" />
              <span>ML Models</span>
            </button>
          </>
        }
      />

      {/* Aggregate Overview Metrics (Real calculated values from history) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="neu-card-interactive p-5 flex flex-col justify-between h-full min-w-0 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider truncate">
              Evaluated Properties
            </span>
            <span className="h-8 w-8 rounded-xl bg-surface border border-white/80 shadow-neu-sm text-ink-secondary flex items-center justify-center flex-shrink-0">
              <Layers className="h-4 w-4" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-ink font-mono truncate">
              {totalSavedCount} <span className="text-xs font-normal text-ink-muted">sites</span>
            </div>
            <span className="text-[11px] text-ink-muted block truncate">
              {totalSavedCount === 0 ? 'No property evaluated yet' : 'Persisted in storage archives'}
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="neu-card-interactive p-5 flex flex-col justify-between h-full min-w-0 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider truncate">
              Total Harvest Potential
            </span>
            <span className="h-8 w-8 rounded-xl bg-surface border border-white/80 shadow-neu-sm text-sky-700 flex items-center justify-center flex-shrink-0">
              <Droplet className="h-4 w-4" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-sky-950 font-mono truncate">
              {totalHarvestPotential.toLocaleString()}{' '}
              <span className="text-xs font-normal text-ink-muted">L/yr</span>
            </div>
            <span className="text-[11px] text-ink-muted block truncate">
              Aggregated gross catchment yield
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="neu-card-interactive p-5 flex flex-col justify-between h-full min-w-0 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-forest-800 uppercase tracking-wider truncate">
              Domestic Water Replaced
            </span>
            <span className="h-8 w-8 rounded-xl bg-surface border border-white/80 shadow-neu-sm text-forest-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-forest-950 font-mono truncate">
              {totalUsablePotential.toLocaleString()}{' '}
              <span className="text-xs font-normal text-ink-muted">L/yr</span>
            </div>
            <span className="text-[11px] text-ink-muted block truncate">
              Direct municipal replacement
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="neu-card-interactive p-5 flex flex-col justify-between h-full min-w-0 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider truncate">
              Average Demand Met
            </span>
            <span className="h-8 w-8 rounded-xl bg-surface border border-white/80 shadow-neu-sm text-indigo-700 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-indigo-950 font-mono truncate">
              {avgDemandMet}%
            </div>
            <span className="text-[11px] text-ink-muted block truncate">
              Mean household self-sufficiency
            </span>
          </div>
        </div>
      </div>

      {/* Latest Evaluated Property Card */}
      {activeLatest && (
        <div className="neu-card p-6 sm:p-8 space-y-5 rounded-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DEDFD8] pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-forest-600 shadow-sm"></span>
                <span className="text-xs uppercase font-mono font-bold text-forest-700 tracking-wider">
                  Latest Evaluated Property
                </span>
                <span className="text-ink-muted text-xs font-mono">ID: {activeLatest.request_id}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-ink">
                {activeLatest.weather?.city || 'Location'}, {activeLatest.weather?.state || ''}
              </h3>
            </div>

            <button
              onClick={() => onSelectAnalysis(activeLatest)}
              className="neu-btn-primary h-10 px-4 rounded-xl font-bold text-xs inline-flex items-center space-x-1.5 self-start sm:self-auto flex-shrink-0"
            >
              <span>View Full Report</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="neu-card-sm p-3.5 flex flex-col justify-between h-full min-w-0 rounded-xl">
              <span className="text-[10px] text-ink-muted block uppercase truncate font-bold">Recommended System</span>
              <span className="font-bold text-ink block truncate mt-1" title={activeLatest.recommendation?.system_type}>
                {activeLatest.recommendation?.system_type || 'Custom System'}
              </span>
            </div>

            <div className="neu-card-sm p-3.5 flex flex-col justify-between h-full min-w-0 rounded-xl">
              <span className="text-[10px] text-ink-muted block uppercase truncate font-bold">Optimal Tank</span>
              <span className="font-bold text-forest-700 block truncate mt-1">
                {activeLatest.recommendation?.optimal_tank_capacity_litres ? `${activeLatest.recommendation.optimal_tank_capacity_litres.toLocaleString()} Litres` : 'Calculated per site'}
              </span>
            </div>

            <div className="neu-card-sm p-3.5 flex flex-col justify-between h-full min-w-0 rounded-xl">
              <span className="text-[10px] text-ink-muted block uppercase truncate font-bold">Harvest Potential</span>
              <span className="font-bold text-sky-800 block truncate mt-1">
                {activeLatest.recommendation?.annual_gross_harvest_litres ? `${activeLatest.recommendation.annual_gross_harvest_litres.toLocaleString()} L` : 'N/A'}
              </span>
            </div>

            <div className="neu-card-sm p-3.5 flex flex-col justify-between h-full min-w-0 rounded-xl">
              <span className="text-[10px] text-ink-muted block uppercase truncate font-bold">Demand Coverage</span>
              <span className="font-bold text-forest-700 block truncate mt-1">
                {activeLatest.recommendation?.water_savings_percentage ?? 0}% Met
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: Recent Analyses (Max 5, server-side sorted newest-first, durable records) */}
      <div className="neu-card p-6 space-y-4 rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEDFD8] pb-3">
          <div className="flex items-center space-x-2.5">
            <h4 className="text-sm font-bold text-ink">Recent Analyses</h4>
            <span className="text-[11px] font-mono bg-surface border border-white/80 shadow-neu-sm text-forest-800 px-2 py-0.5 rounded-full font-bold">
              {displayRecent.length > 0 ? `Showing ${displayRecent.slice(0, 5).length}` : '0 recorded'}
            </span>
          </div>

          <button
            onClick={onViewAllHistory}
            className="text-xs font-bold text-forest-700 hover:text-forest-800 flex items-center space-x-1 transition-colors self-start sm:self-auto"
          >
            <span>View All History</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Loading Skeleton */}
        {recentLoading && (
          <div className="space-y-3 py-2 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-3.5 rounded-xl bg-[#EEEEEA]/70 flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 bg-[#DEDFD8] rounded w-1/4"></div>
                  <div className="h-2.5 bg-[#DEDFD8] rounded w-1/2"></div>
                </div>
                <div className="h-8 w-24 bg-[#DEDFD8] rounded-lg"></div>
              </div>
            ))}
          </div>
        )}

        {/* API Error State with Retry */}
        {!recentLoading && recentError && (
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/60 text-center space-y-2">
            <p className="text-xs font-semibold text-rose-800">
              Unable to load recent analyses: {recentError}
            </p>
            {onRetryRecent && (
              <button
                type="button"
                onClick={onRetryRecent}
                className="neu-btn-secondary px-3.5 py-1.5 rounded-lg text-xs font-bold text-ink hover:text-forest-700"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Empty State */}
        {!recentLoading && !recentError && displayRecent.length === 0 && (
          <div className="p-8 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-surface border border-white/80 shadow-neu-sm text-forest-700 flex items-center justify-center mx-auto">
              <Compass className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h5 className="text-sm font-bold text-ink">No analyses yet</h5>
              <p className="text-xs text-ink-muted max-w-sm mx-auto">
                Complete your first property assessment to see your recommendations here.
              </p>
            </div>
            <button
              type="button"
              onClick={onStartNew}
              className="neu-btn-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center space-x-1.5"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Start Assessment</span>
            </button>
          </div>
        )}

        {/* Successful Results: Max 5 Records */}
        {!recentLoading && !recentError && displayRecent.length > 0 && (
          <div className="divide-y divide-[#DEDFD8]">
            {displayRecent.slice(0, 5).map((item) => {

              const locationLabel = item.weather?.city
                ? `${item.weather.city}${item.weather.state ? `, ${item.weather.state}` : ''}`
                : 'Property Location'
              const harvestLabel = item.recommendation?.annual_gross_harvest_litres
                ? `${item.recommendation.annual_gross_harvest_litres.toLocaleString()} L/yr`
                : 'N/A'
              const systemLabel = item.recommendation?.system_type || 'Rainwater System'
              const formattedDate = item.timestamp
                ? new Date(item.timestamp).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recent'

              return (
                <div
                  key={item.request_id}
                  onClick={() => onSelectAnalysis(item)}
                  className="py-3 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#EEEEEA] rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-ink block truncate">{locationLabel}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface border border-white/80 text-forest-800 font-bold">
                        {systemLabel}
                      </span>
                      <span className="text-[10px] font-mono text-ink-muted">
                        Completed
                      </span>
                    </div>
                    <div className="text-[11px] text-ink-muted font-mono flex items-center space-x-3">
                      <span>Harvest: {harvestLabel}</span>
                      <span>·</span>
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-auto flex-shrink-0">
                    <div className="text-right font-mono">
                      <span className="text-xs font-bold text-forest-800 block">
                        {item.recommendation?.water_savings_percentage ?? 0}% Saved
                      </span>
                      <span className="text-[10px] text-ink-muted">
                        {item.recommendation?.optimal_tank_capacity_litres
                          ? `${item.recommendation.optimal_tank_capacity_litres.toLocaleString()} L tank`
                          : 'Custom sizing'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg bg-surface border border-white/80 shadow-neu-sm text-forest-700 group-hover:text-forest-900 group-hover:scale-105 transition-all"
                      title="Reopen saved analysis"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
export default DashboardSummary

