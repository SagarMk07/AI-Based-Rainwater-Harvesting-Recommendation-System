import React, { useState } from 'react'
import type { MonthlyBalanceStep } from '../types/analysis'

interface WaterBalanceChartProps {
  data: MonthlyBalanceStep[]
}

export const WaterBalanceChart: React.FC<WaterBalanceChartProps> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  if (!data || data.length === 0) {
    return <div className="text-center py-6 text-slate-400 text-xs">No simulation data available</div>
  }

  // Find max value for scaling chart
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.inflow_litres, d.demand_litres, d.supplied_litres, d.overflow_litres)),
    1000
  )

  const chartHeight = 220
  const chartWidth = 720
  const barWidth = 10

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">12-Month Hydrological Water Balance Simulation</h3>
          <p className="text-xs text-slate-500">
            Iterative monthly tracking of rainwater inflow, household demand, actual water supplied, and overflow.
          </p>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-600">
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-sm bg-sky-500"></span>
            <span>Rainfall Inflow</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-sm bg-slate-300"></span>
            <span>Demand</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-sm bg-emerald-500"></span>
            <span>Usable Supplied</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-sm bg-amber-400"></span>
            <span>Recharge Overflow</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[640px]">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
            className="w-full h-auto"
            style={{ minHeight: '260px' }}
          >
            {/* Grid horizontal lines */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
              const y = chartHeight - ratio * (chartHeight - 30)
              const val = Math.round(maxVal * ratio)
              return (
                <g key={i}>
                  <line
                    x1="45"
                    y1={y}
                    x2={chartWidth - 10}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text x="40" y={y + 3} textAnchor="end" className="text-[9px] fill-slate-400 font-mono">
                    {val >= 1000 ? `${(val / 1000).toFixed(0)}kL` : `${val}L`}
                  </text>
                </g>
              )
            })}

            {/* Bars for each of the 12 months */}
            {data.map((step, idx) => {
              const groupX = 55 + idx * ((chartWidth - 65) / 12)
              const usableHeight = chartHeight - 30

              const hInflow = (step.inflow_litres / maxVal) * usableHeight
              const hDemand = (step.demand_litres / maxVal) * usableHeight
              const hSupplied = (step.supplied_litres / maxVal) * usableHeight
              const hOverflow = (step.overflow_litres / maxVal) * usableHeight

              const yInflow = chartHeight - hInflow
              const yDemand = chartHeight - hDemand
              const ySupplied = chartHeight - hSupplied
              const yOverflow = chartHeight - hOverflow

              const isHovered = hoveredIdx === idx

              return (
                <g
                  key={idx}
                  className="cursor-pointer transition-opacity"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Highlight bar group on hover */}
                  {isHovered && (
                    <rect
                      x={groupX - 5}
                      y="10"
                      width={barWidth * 4 + 10}
                      height={chartHeight + 25}
                      fill="#f8fafc"
                      rx="4"
                    />
                  )}

                  {/* Demand bar (Gray) */}
                  <rect
                    x={groupX}
                    y={yDemand}
                    width={barWidth}
                    height={Math.max(2, hDemand)}
                    fill="#cbd5e1"
                    rx="2"
                  />

                  {/* Inflow bar (Blue) */}
                  <rect
                    x={groupX + barWidth + 1}
                    y={yInflow}
                    width={barWidth}
                    height={Math.max(2, hInflow)}
                    fill="#0ea5e9"
                    rx="2"
                  />

                  {/* Supplied bar (Green) */}
                  <rect
                    x={groupX + (barWidth + 1) * 2}
                    y={ySupplied}
                    width={barWidth}
                    height={Math.max(2, hSupplied)}
                    fill="#10b981"
                    rx="2"
                  />

                  {/* Overflow bar (Amber) */}
                  <rect
                    x={groupX + (barWidth + 1) * 3}
                    y={yOverflow}
                    width={barWidth}
                    height={Math.max(1, hOverflow)}
                    fill="#f59e0b"
                    rx="2"
                  />

                  {/* Month Label */}
                  <text
                    x={groupX + barWidth * 2}
                    y={chartHeight + 18}
                    textAnchor="middle"
                    className={`text-[11px] font-medium transition-colors ${
                      isHovered ? 'fill-emerald-600 font-bold' : 'fill-slate-600'
                    }`}
                  >
                    {step.month_name}
                  </text>
                  <text
                    x={groupX + barWidth * 2}
                    y={chartHeight + 30}
                    textAnchor="middle"
                    className="text-[9px] fill-slate-400 font-mono"
                  >
                    {step.rainfall_mm}mm
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      {/* Interactive Tooltip Card */}
      {hoveredIdx !== null && (
        <div className="bg-slate-900 text-white rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-200">
          <div>
            <span className="font-bold text-emerald-400 text-sm">{data[hoveredIdx].month_name} Simulation Data</span>
            <span className="text-slate-400 ml-2">({data[hoveredIdx].rainfall_mm} mm rainfall)</span>
          </div>
          <div className="flex flex-wrap gap-4 font-mono text-[11px]">
            <div>
              <span className="text-slate-400 block">Inflow</span>
              <span className="text-sky-300 font-semibold">{data[hoveredIdx].inflow_litres.toLocaleString()} L</span>
            </div>
            <div>
              <span className="text-slate-400 block">Demand</span>
              <span className="text-slate-200 font-semibold">{data[hoveredIdx].demand_litres.toLocaleString()} L</span>
            </div>
            <div>
              <span className="text-slate-400 block">Supplied</span>
              <span className="text-emerald-400 font-semibold">{data[hoveredIdx].supplied_litres.toLocaleString()} L</span>
            </div>
            <div>
              <span className="text-slate-400 block">Recharge / Overflow</span>
              <span className="text-amber-300 font-semibold">{data[hoveredIdx].overflow_litres.toLocaleString()} L</span>
            </div>
            <div>
              <span className="text-slate-400 block">End Storage</span>
              <span className="text-indigo-300 font-semibold">{data[hoveredIdx].ending_storage_litres.toLocaleString()} L</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
