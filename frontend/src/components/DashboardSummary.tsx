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

interface DashboardSummaryProps {
  history: AnalysisResponse[]
  latestAnalysis: AnalysisResponse | null
  onStartNew: () => void
  onSelectAnalysis: (item: AnalysisResponse) => void
  onOpenTelemetry: () => void
  onViewAllHistory: () => void
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  history,
  latestAnalysis,
  onStartNew,
  onSelectAnalysis,
  onOpenTelemetry,
  onViewAllHistory,
}) => {
  // Compute real aggregated stats from actual saved data
  const totalHarvestPotential = history.reduce(
    (sum, item) => sum + (item.recommendation.annual_gross_harvest_litres || 0),
    0
  )
  const totalUsablePotential = history.reduce(
    (sum, item) => sum + (item.recommendation.annual_usable_litres || 0),
    0
  )
  const avgDemandMet =
    history.length > 0
      ? Math.round(
          history.reduce((sum, item) => sum + item.recommendation.water_savings_percentage, 0) /
            history.length
        )
      : 0

  const activeLatest = latestAnalysis || (history.length > 0 ? history[0] : null)

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs uppercase font-mono font-bold text-forest-700 tracking-wider">
            Environmental Intelligence Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            System Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time summary of evaluated catchments, simulated storage capacities, and ecological savings.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={onStartNew}
            className="px-5 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs shadow-subtle flex items-center space-x-1.5 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ New Analysis</span>
          </button>

          <button
            type="button"
            onClick={onOpenTelemetry}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-subtle flex items-center space-x-1.5 transition-colors"
          >
            <Cpu className="h-4 w-4 text-forest-600" />
            <span>ML Models</span>
          </button>
        </div>
      </div>

      {/* Aggregate Overview Metrics (Real calculated values from history) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Evaluated Properties
            </span>
            <span className="h-7 w-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Layers className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {history.length} <span className="text-xs font-normal text-slate-400">sites</span>
          </div>
          <span className="text-[11px] text-slate-400 block">
            {history.length === 0 ? 'No property evaluated yet' : 'Stored in session archives'}
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">
              Total Harvest Potential
            </span>
            <span className="h-7 w-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Droplet className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-sky-950 font-mono">
            {totalHarvestPotential.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">L/yr</span>
          </div>
          <span className="text-[11px] text-slate-400 block">
            Aggregated gross catchment yield
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-forest-700 uppercase tracking-wider">
              Domestic Water Replaced
            </span>
            <span className="h-7 w-7 rounded-lg bg-forest-50 text-forest-600 flex items-center justify-center">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-forest-950 font-mono">
            {totalUsablePotential.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">L/yr</span>
          </div>
          <span className="text-[11px] text-slate-400 block">
            Direct municipal replacement
          </span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
              Average Demand Met
            </span>
            <span className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-indigo-950 font-mono">
            {avgDemandMet}%
          </div>
          <span className="text-[11px] text-slate-400 block">
            Mean household self-sufficiency
          </span>
        </div>
      </div>

      {/* Latest Analysis Section (Section 21) */}
      {activeLatest ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-forest-500"></span>
                <span className="text-xs uppercase font-mono font-bold text-forest-700 tracking-wider">
                  Latest Evaluated Property
                </span>
                <span className="text-slate-400 text-xs font-mono">ID: {activeLatest.request_id}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                {activeLatest.weather.city}, {activeLatest.weather.state}
              </h3>
            </div>

            <button
              onClick={() => onSelectAnalysis(activeLatest)}
              className="px-4 py-2 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs shadow-subtle flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
            >
              <span>View Full Report</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Recommended System</span>
              <span className="font-bold text-slate-900 block truncate" title={activeLatest.recommendation.system_type}>
                {activeLatest.recommendation.system_type}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Optimal Tank</span>
              <span className="font-bold text-forest-700">
                {activeLatest.recommendation.optimal_tank_capacity_litres.toLocaleString()} Litres
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Harvest Potential</span>
              <span className="font-bold text-sky-800">
                {activeLatest.recommendation.annual_gross_harvest_litres.toLocaleString()} L
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Demand Coverage</span>
              <span className="font-bold text-indigo-700">
                {activeLatest.recommendation.water_savings_percentage}% Met
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 p-8 sm:p-12 text-center bg-white space-y-4 shadow-subtle">
          <div className="h-12 w-12 rounded-2xl bg-forest-50 text-forest-600 flex items-center justify-center mx-auto border border-forest-100">
            <Compass className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Assessment Recorded Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Run a quick property assessment to simulate rainfall runoff, compare candidate storage tanks, and discover whether hybrid recharge is appropriate for your site.
            </p>
          </div>
          <button
            onClick={onStartNew}
            className="px-5 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs shadow-sm transition-all inline-flex items-center space-x-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Start First Property Analysis</span>
          </button>
        </div>
      )}

      {/* Recent Analyses Quick List */}
      {history.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900">Recent Assessments</h4>
            <button
              onClick={onViewAllHistory}
              className="text-xs font-semibold text-forest-700 hover:text-forest-800 flex items-center space-x-1"
            >
              <span>View All ({history.length})</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {history.slice(0, 3).map((item) => (
              <div
                key={item.request_id}
                onClick={() => onSelectAnalysis(item)}
                className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-bold text-xs text-slate-900 block">{item.weather.city}</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {item.recommendation.system_type} · {item.recommendation.optimal_tank_capacity_litres.toLocaleString()} L Tank
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-right">
                  <div>
                    <span className="text-xs font-bold text-forest-700 block font-mono">
                      {item.recommendation.water_savings_percentage}% Saved
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
