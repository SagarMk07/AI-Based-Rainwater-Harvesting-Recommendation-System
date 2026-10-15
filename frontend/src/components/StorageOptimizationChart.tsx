import React from 'react'
import type { CandidateEvaluation } from '../types/analysis'

interface Props {
  candidates: CandidateEvaluation[]
  optimalCapacity: number
  activeCapacity?: number
  onSelectCapacity?: (capacityLitres: number) => void
}

export const StorageOptimizationChart: React.FC<Props> = ({
  candidates,
  optimalCapacity,
  activeCapacity,
  onSelectCapacity,
}) => {
  if (!candidates || candidates.length === 0) return null

  return (
    <div className="neu-card p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEDFD8] pb-3">
        <div>
          <span className="text-xs uppercase font-mono font-bold text-forest-700 tracking-wider">
            CapEx & Payback Analysis
          </span>
          <h3 className="text-sm sm:text-base font-bold text-ink mt-0.5">
            Storage Tank Capacity Multi-Objective Optimization
          </h3>
          <p className="text-xs text-ink-muted">
            Simulated performance curves balancing household demand coverage against capital expenditure and payback.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {activeCapacity && activeCapacity !== optimalCapacity && (
            <span className="text-xs font-mono bg-[#E3E4DE] text-[#252B26] px-3 py-1 rounded-full font-bold shadow-neu-inset-sm">
              Current: {activeCapacity.toLocaleString()} L
            </span>
          )}
          <span className="text-xs font-mono bg-[#EEEEEA] text-forest-700 border border-forest-600/30 px-3 py-1 rounded-full font-bold shadow-neu-sm">
            Optimal: {optimalCapacity.toLocaleString()} L
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#DEDFD8] text-ink-muted font-bold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-3">Tank Capacity</th>
              <th className="py-2.5 px-3">Demand Met %</th>
              <th className="py-2.5 px-3">Usable Supplied</th>
              <th className="py-2.5 px-3">Overflow to Recharge</th>
              <th className="py-2.5 px-3">Estimated Cost</th>
              <th className="py-2.5 px-3">Payback</th>
              <th className="py-2.5 px-3 text-right">Score</th>
              {onSelectCapacity && <th className="py-2.5 px-3 text-center">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DEDFD8] font-mono">
            {candidates.map((cand) => {
              const isOptimal = cand.capacity_litres === optimalCapacity
              const isActive = cand.capacity_litres === activeCapacity
              return (
                <tr
                  key={cand.capacity_litres}
                  onClick={() => onSelectCapacity?.(cand.capacity_litres)}
                  className={`transition-colors ${
                    onSelectCapacity ? 'cursor-pointer' : ''
                  } ${
                    isActive
                      ? 'bg-forest-50/60 font-semibold text-ink border-l-4 border-l-forest-600'
                      : isOptimal
                        ? 'bg-[#EEEEEA] font-semibold text-ink border-l-4 border-l-forest-400'
                        : 'hover:bg-white/60 text-ink-secondary'
                  }`}
                >
                  <td className="py-2.5 px-3 flex items-center space-x-2">
                    {isActive ? (
                      <span className="h-2 w-2 rounded-full bg-forest-600 shadow-sm animate-pulse"></span>
                    ) : isOptimal ? (
                      <span className="h-2 w-2 rounded-full bg-forest-400 shadow-sm"></span>
                    ) : null}
                    <span className={isActive || isOptimal ? 'text-forest-700 font-bold' : ''}>
                      {cand.capacity_litres.toLocaleString()} L
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 neu-inset-sm rounded-full overflow-hidden">
                        <div
                          className="h-full bg-forest-600 rounded-full"
                          style={{ width: `${Math.min(100, cand.demand_met_percentage)}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold">{cand.demand_met_percentage}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-semibold">{cand.total_supplied_litres.toLocaleString()} L</td>
                  <td className="py-2.5 px-3 text-ink-muted">{cand.total_overflow_litres.toLocaleString()} L</td>
                  <td className="py-2.5 px-3">₹{cand.tank_cost_inr.toLocaleString()}</td>
                  <td className="py-2.5 px-3">{cand.payback_years} yrs</td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                        isOptimal
                          ? 'bg-forest-700 text-white shadow-sm'
                          : 'bg-[#E3E4DE] text-ink-secondary'
                      }`}
                    >
                      {cand.optimization_score}
                    </span>
                  </td>
                  {onSelectCapacity && (
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectCapacity(cand.capacity_litres)
                        }}
                        className={`text-[10px] font-bold font-sans py-1 px-2.5 rounded-lg transition-all ${
                          isActive
                            ? 'bg-forest-600 text-white shadow-sm'
                            : 'neu-btn-secondary hover:text-forest-700'
                        }`}
                      >
                        {isActive ? 'Simulating' : 'Simulate'}
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default StorageOptimizationChart
