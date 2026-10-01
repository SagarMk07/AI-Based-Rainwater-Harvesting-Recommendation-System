import React from 'react'
import {
  Trash2,
  ArrowUpRight,
  Clock,
  PlusCircle,
} from 'lucide-react'
import type { AnalysisResponse } from '../types/analysis'

interface Props {
  history: AnalysisResponse[]
  onSelect: (item: AnalysisResponse) => void
  onClear: () => void
  onDelete: (requestId: string) => void
  onStartNew: () => void
}

export const HistorySection: React.FC<Props> = ({
  history,
  onSelect,
  onClear,
  onDelete,
  onStartNew,
}) => {
  // Empty State (Section 23)
  if (history.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center bg-white space-y-4 shadow-subtle max-w-xl mx-auto my-8">
        <div className="h-14 w-14 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center mx-auto border border-forest-100">
          <Clock className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">No Analyses Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Analyze your first property to evaluate rainfall catchment yield, compare candidate tanks, and see your customized AI recommendation.
          </p>
        </div>
        <button
          type="button"
          onClick={onStartNew}
          className="px-5 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs shadow-sm transition-all inline-flex items-center space-x-2"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Start Analysis</span>
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-5 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-mono font-bold text-forest-700 tracking-wider">
              Saved Archives
            </span>
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {history.length} Saved
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
            Archived Property Analyses
          </h2>
          <p className="text-xs text-slate-500">
            Past property evaluations, storage sizing simulations, and investment reports.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={onStartNew}
            className="px-3.5 py-2 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold shadow-subtle flex items-center space-x-1.5 transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>+ New Analysis</span>
          </button>

          <button
            type="button"
            onClick={onClear}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors flex items-center space-x-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View (hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Location</th>
              <th className="py-3 px-3">Roof Area</th>
              <th className="py-3 px-3">Rainfall</th>
              <th className="py-3 px-3">Recommended System</th>
              <th className="py-3 px-3">Harvest Potential</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {history.map((item) => (
              <tr key={item.request_id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-3 font-mono text-slate-500 text-[11px]">
                  {new Date(item.timestamp).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td className="py-3.5 px-3">
                  <span className="font-bold text-slate-900 block">{item.weather.city}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{item.weather.state}</span>
                </td>
                <td className="py-3.5 px-3 font-mono text-slate-700">
                  {item.explainability?.engineering_factors?.catchment_sqm || 200} m²
                </td>
                <td className="py-3.5 px-3 font-mono text-slate-700">
                  {item.weather.annual_rainfall_mm} mm
                </td>
                <td className="py-3.5 px-3">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-forest-50 text-forest-800 border border-forest-200/80 text-[11px] font-semibold">
                    {item.recommendation.system_type}
                  </span>
                </td>
                <td className="py-3.5 px-3 font-mono">
                  <span className="font-bold text-slate-900 block">
                    {item.recommendation.annual_gross_harvest_litres.toLocaleString()} L
                  </span>
                  <span className="text-[10px] text-forest-700">
                    {item.recommendation.water_savings_percentage}% demand met
                  </span>
                </td>
                <td className="py-3.5 px-3 text-right">
                  <div className="inline-flex items-center space-x-1.5">
                    <button
                      onClick={() => onSelect(item)}
                      className="px-2.5 py-1.5 rounded-lg bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs flex items-center space-x-1 transition-colors shadow-subtle"
                    >
                      <span>View</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onDelete(item.request_id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout (Section 22) */}
      <div className="md:hidden space-y-3">
        {history.map((item) => (
          <div
            key={item.request_id}
            className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{item.weather.city}</span>
              <span className="text-[11px] font-mono text-slate-400">
                {new Date(item.timestamp).toLocaleDateString()}
              </span>
            </div>

            <div className="text-xs">
              <span className="font-semibold text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-200 block truncate">
                {item.recommendation.system_type}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
              <div>
                <span className="text-slate-400 block">Rainfall</span>
                <span>{item.weather.annual_rainfall_mm} mm</span>
              </div>
              <div>
                <span className="text-slate-400 block">Roof Area</span>
                <span>{item.explainability?.engineering_factors?.catchment_sqm || 200} m²</span>
              </div>
              <div>
                <span className="text-slate-400 block">Harvest</span>
                <span className="font-bold text-slate-900">
                  {item.recommendation.annual_gross_harvest_litres.toLocaleString()} L
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Savings</span>
                <span className="text-forest-700 font-bold">
                  {item.recommendation.water_savings_percentage}%
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
              <button
                onClick={() => onSelect(item)}
                className="px-3 py-1.5 rounded-lg bg-forest-600 text-white font-bold text-xs flex items-center space-x-1"
              >
                <span>View Analysis</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
              <button
                onClick={() => onDelete(item.request_id)}
                className="text-slate-400 hover:text-red-600 p-1.5"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
