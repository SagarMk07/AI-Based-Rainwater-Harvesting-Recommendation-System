import React from 'react'
import type { CandidateEvaluation } from '../types/analysis'

interface Props {
  candidates: CandidateEvaluation[]
  optimalCapacity: number
}

export const StorageOptimizationChart: React.FC<Props> = ({ candidates, optimalCapacity }) => {
  if (!candidates || candidates.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Storage Tank Capacity Multi-Objective Optimization</h3>
          <p className="text-xs text-slate-500">
            Simulated performance curves balancing household demand coverage against capital expenditure and payback.
          </p>
        </div>
        <span className="text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
          Optimal: {optimalCapacity.toLocaleString()} Litres
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-medium">
              <th className="py-2.5 px-3">Tank Capacity</th>
              <th className="py-2.5 px-3">Demand Met %</th>
              <th className="py-2.5 px-3">Usable Supplied</th>
              <th className="py-2.5 px-3">Overflow to Recharge</th>
              <th className="py-2.5 px-3">Estimated Cost</th>
              <th className="py-2.5 px-3">Payback</th>
              <th className="py-2.5 px-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {candidates.map((cand) => {
              const isOptimal = cand.capacity_litres === optimalCapacity
              return (
                <tr
                  key={cand.capacity_litres}
                  className={`transition-colors ${
                    isOptimal ? 'bg-emerald-50/70 font-semibold text-emerald-950' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <td className="py-2 px-3 flex items-center space-x-1.5">
                    {isOptimal && <span className="h-2 w-2 rounded-full bg-emerald-500"></span>}
                    <span>{cand.capacity_litres.toLocaleString()} L</span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, cand.demand_met_percentage)}%` }}
                        ></div>
                      </div>
                      <span>{cand.demand_met_percentage}%</span>
                    </div>
                  </td>
                  <td className="py-2 px-3">{cand.total_supplied_litres.toLocaleString()} L</td>
                  <td className="py-2 px-3 text-slate-500">{cand.total_overflow_litres.toLocaleString()} L</td>
                  <td className="py-2 px-3">₹{cand.tank_cost_inr.toLocaleString()}</td>
                  <td className="py-2 px-3">{cand.payback_years} yrs</td>
                  <td className="py-2 px-3 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        isOptimal ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {cand.optimization_score}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
