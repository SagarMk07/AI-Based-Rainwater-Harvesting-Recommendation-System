import React from 'react'
import { History, Trash2, ArrowUpRight, Clock } from 'lucide-react'
import type { AnalysisResponse } from '../types/analysis'

interface Props {
  history: AnalysisResponse[]
  onSelect: (item: AnalysisResponse) => void
  onClear: () => void
  onDelete: (requestId: string) => void
}

export const HistorySection: React.FC<Props> = ({ history, onSelect, onClear, onDelete }) => {
  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50 space-y-2">
        <Clock className="h-8 w-8 text-slate-400 mx-auto" />
        <h4 className="text-sm font-semibold text-slate-700">No Saved Analyses Yet</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Run an analysis using the wizard above and click "Save Analysis" to archive the report here for future comparison.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <History className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Archived Analysis History</h3>
          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {history.length} Saved
          </span>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-red-600 hover:text-red-700 flex items-center space-x-1 font-medium"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {history.map((item) => (
          <div
            key={item.request_id}
            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-lg transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs text-slate-900">{item.weather.city}</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-mono">
                  {item.recommendation.water_savings_percentage}% Saved
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">{item.recommendation.system_type}</p>
              <div className="text-[11px] text-slate-500 flex flex-wrap gap-3 font-mono">
                <span>Gross: {item.recommendation.annual_gross_harvest_litres.toLocaleString()} L</span>
                <span>Tank: {item.recommendation.optimal_tank_capacity_litres.toLocaleString()} L</span>
                <span>Cost: ₹{item.recommendation.total_estimated_cost_inr.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-center">
              <button
                onClick={() => onSelect(item)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center space-x-1 transition-colors"
              >
                <span>View Dashboard</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete(item.request_id)}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete entry"
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
