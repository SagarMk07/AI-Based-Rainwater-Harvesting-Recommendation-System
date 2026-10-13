import React, { useState } from 'react'
import type { MonthlyBalanceStep } from '../types/analysis'

interface WaterBalanceChartProps {
  data: MonthlyBalanceStep[]
}

type ChartView = 'all' | 'rainfall' | 'harvest' | 'demand_vs_supplied'

export const WaterBalanceChart: React.FC<WaterBalanceChartProps> = ({ data }) => {
  const [activeView, setActiveView] = useState<ChartView>('all')
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  if (!data || data.length === 0) {
    return <div className="text-center py-6 text-ink-muted text-xs font-mono">No simulation data available</div>
  }

  // Max value calculation for active view scaling
  let maxVal = 1000
  if (activeView === 'rainfall') {
    maxVal = Math.max(...data.map((d) => d.rainfall_mm), 50)
  } else if (activeView === 'harvest') {
    maxVal = Math.max(...data.map((d) => d.inflow_litres), 1000)
  } else if (activeView === 'demand_vs_supplied') {
    maxVal = Math.max(...data.map((d) => Math.max(d.demand_litres, d.supplied_litres)), 1000)
  } else {
    maxVal = Math.max(
      ...data.map((d) => Math.max(d.inflow_litres, d.demand_litres, d.supplied_litres, d.overflow_litres)),
      1000
    )
  }

  const chartHeight = 220
  const chartWidth = 720
  const barWidth = activeView === 'all' ? 10 : 20

  return (
    <div className="neu-card p-5 sm:p-6 space-y-5">
      {/* Header and View Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DEDFD8] pb-4">
        <div>
          <span className="text-xs uppercase font-mono font-bold text-forest-700 tracking-wider">
            Hydrological Analytics
          </span>
          <h3 className="text-base font-bold text-ink mt-0.5">
            12-Month Water Balance & Rainfall Analytics
          </h3>
          <p className="text-xs text-ink-muted">
            Monthly tracking of rainfall precipitation, rooftop yield, household demand, and aquifer replenishment.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1 neu-inset p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveView('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeView === 'all'
                ? 'bg-surface text-ink shadow-neu-sm font-bold border border-white/80'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            All Metrics
          </button>
          <button
            type="button"
            onClick={() => setActiveView('rainfall')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeView === 'rainfall'
                ? 'bg-surface text-sky-800 shadow-neu-sm font-bold border border-white/80'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Rainfall (mm)
          </button>
          <button
            type="button"
            onClick={() => setActiveView('harvest')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeView === 'harvest'
                ? 'bg-surface text-forest-800 shadow-neu-sm font-bold border border-white/80'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Yield (L)
          </button>
          <button
            type="button"
            onClick={() => setActiveView('demand_vs_supplied')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeView === 'demand_vs_supplied'
                ? 'bg-surface text-forest-900 shadow-neu-sm font-bold border border-white/80'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Demand vs Supplied
          </button>
        </div>
      </div>

      {/* Dynamic Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-ink-secondary">
        {(activeView === 'all' || activeView === 'rainfall') && (
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-sm bg-sky-500 shadow-sm"></span>
            <span>{activeView === 'rainfall' ? 'Rainfall (mm)' : 'Rainfall Inflow (L)'}</span>
          </div>
        )}
        {(activeView === 'all' || activeView === 'demand_vs_supplied') && (
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-sm bg-[#B8C4BC] shadow-sm"></span>
            <span>Monthly Demand (L)</span>
          </div>
        )}
        {(activeView === 'all' || activeView === 'demand_vs_supplied' || activeView === 'harvest') && (
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-sm bg-forest-600 shadow-sm"></span>
            <span>{activeView === 'harvest' ? 'Gross Catchment Runoff (L)' : 'Usable Water Supplied (L)'}</span>
          </div>
        )}
        {activeView === 'all' && (
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-sm bg-amber-500 shadow-sm"></span>
            <span>Aquifer Recharge Overflow (L)</span>
          </div>
        )}
      </div>

      {/* SVG Chart Container */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[620px]">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
            className="w-full h-auto"
            style={{ minHeight: '260px' }}
          >
            {/* Grid horizontal lines */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
              const y = chartHeight - ratio * (chartHeight - 30)
              const val = Math.round(maxVal * ratio)
              const unitLabel =
                activeView === 'rainfall'
                  ? `${val}mm`
                  : val >= 1000
                  ? `${(val / 1000).toFixed(0)}kL`
                  : `${val}L`

              return (
                <g key={i}>
                  <line
                    x1="45"
                    y1={y}
                    x2={chartWidth - 10}
                    y2={y}
                    stroke="#DEDFD8"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text x="40" y={y + 3} textAnchor="end" className="text-[9px] fill-ink-muted font-mono">
                    {unitLabel}
                  </text>
                </g>
              )
            })}

            {/* Bars for each of the 12 months */}
            {data.map((step, idx) => {
              const groupX = 55 + idx * ((chartWidth - 65) / 12)
              const usableHeight = chartHeight - 30
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
                      x={groupX - 4}
                      y="10"
                      width={activeView === 'all' ? barWidth * 4 + 8 : barWidth * 2 + 8}
                      height={chartHeight + 25}
                      fill="rgba(255, 255, 255, 0.6)"
                      rx="6"
                    />
                  )}

                  {/* ACTIVE VIEW: ALL */}
                  {activeView === 'all' && (
                    <>
                      {/* Demand */}
                      <rect
                        x={groupX}
                        y={chartHeight - (step.demand_litres / maxVal) * usableHeight}
                        width={barWidth}
                        height={Math.max(2, (step.demand_litres / maxVal) * usableHeight)}
                        fill="#B8C4BC"
                        rx="2"
                      />
                      {/* Inflow */}
                      <rect
                        x={groupX + barWidth + 1}
                        y={chartHeight - (step.inflow_litres / maxVal) * usableHeight}
                        width={barWidth}
                        height={Math.max(2, (step.inflow_litres / maxVal) * usableHeight)}
                        fill="#0284c7"
                        rx="2"
                      />
                      {/* Supplied */}
                      <rect
                        x={groupX + (barWidth + 1) * 2}
                        y={chartHeight - (step.supplied_litres / maxVal) * usableHeight}
                        width={barWidth}
                        height={Math.max(2, (step.supplied_litres / maxVal) * usableHeight)}
                        fill="#168447"
                        rx="2"
                      />
                      {/* Overflow */}
                      <rect
                        x={groupX + (barWidth + 1) * 3}
                        y={chartHeight - (step.overflow_litres / maxVal) * usableHeight}
                        width={barWidth}
                        height={Math.max(1, (step.overflow_litres / maxVal) * usableHeight)}
                        fill="#d97706"
                        rx="2"
                      />
                    </>
                  )}

                  {/* ACTIVE VIEW: RAINFALL (mm) */}
                  {activeView === 'rainfall' && (
                    <rect
                      x={groupX + 6}
                      y={chartHeight - (step.rainfall_mm / maxVal) * usableHeight}
                      width={barWidth}
                      height={Math.max(2, (step.rainfall_mm / maxVal) * usableHeight)}
                      fill="#0284c7"
                      rx="3"
                    />
                  )}

                  {/* ACTIVE VIEW: HARVEST YIELD (L) */}
                  {activeView === 'harvest' && (
                    <rect
                      x={groupX + 6}
                      y={chartHeight - (step.inflow_litres / maxVal) * usableHeight}
                      width={barWidth}
                      height={Math.max(2, (step.inflow_litres / maxVal) * usableHeight)}
                      fill="#168447"
                      rx="3"
                    />
                  )}

                  {/* ACTIVE VIEW: DEMAND VS SUPPLIED */}
                  {activeView === 'demand_vs_supplied' && (
                    <>
                      <rect
                        x={groupX + 2}
                        y={chartHeight - (step.demand_litres / maxVal) * usableHeight}
                        width={barWidth - 2}
                        height={Math.max(2, (step.demand_litres / maxVal) * usableHeight)}
                        fill="#B8C4BC"
                        rx="2"
                      />
                      <rect
                        x={groupX + barWidth + 2}
                        y={chartHeight - (step.supplied_litres / maxVal) * usableHeight}
                        width={barWidth - 2}
                        height={Math.max(2, (step.supplied_litres / maxVal) * usableHeight)}
                        fill="#168447"
                        rx="2"
                      />
                    </>
                  )}

                  {/* Month Label */}
                  <text
                    x={groupX + (activeView === 'all' ? barWidth * 2 : barWidth)}
                    y={chartHeight + 18}
                    textAnchor="middle"
                    className={`text-[11px] font-medium transition-colors ${
                      isHovered ? 'fill-forest-800 font-bold' : 'fill-ink-secondary'
                    }`}
                  >
                    {step.month_name}
                  </text>
                  <text
                    x={groupX + (activeView === 'all' ? barWidth * 2 : barWidth)}
                    y={chartHeight + 30}
                    textAnchor="middle"
                    className="text-[9px] fill-ink-muted font-mono"
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
        <div className="bg-[#132018] text-white rounded-2xl p-4 text-xs flex flex-wrap items-center justify-between gap-4 border border-white/10 shadow-neu-lg animate-in fade-in duration-150">
          <div>
            <span className="font-bold text-forest-300 text-sm">
              {data[hoveredIdx].month_name} Hydrological Record
            </span>
            <span className="text-[#9EADA3] ml-2 font-mono">({data[hoveredIdx].rainfall_mm} mm rainfall)</span>
          </div>
          <div className="flex flex-wrap gap-4 font-mono text-[11px]">
            <div>
              <span className="text-[#9EADA3] block">Rooftop Inflow</span>
              <span className="text-sky-300 font-semibold">{data[hoveredIdx].inflow_litres.toLocaleString()} L</span>
            </div>
            <div>
              <span className="text-[#9EADA3] block">Demand</span>
              <span className="text-slate-200 font-semibold">{data[hoveredIdx].demand_litres.toLocaleString()} L</span>
            </div>
            <div>
              <span className="text-[#9EADA3] block">Supplied</span>
              <span className="text-emerald-400 font-semibold">{data[hoveredIdx].supplied_litres.toLocaleString()} L</span>
            </div>
            <div>
              <span className="text-[#9EADA3] block">Aquifer Recharge</span>
              <span className="text-amber-300 font-semibold">{data[hoveredIdx].overflow_litres.toLocaleString()} L</span>
            </div>
            <div>
              <span className="text-[#9EADA3] block">Remaining Storage</span>
              <span className="text-teal-300 font-semibold">{data[hoveredIdx].ending_storage_litres.toLocaleString()} L</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
