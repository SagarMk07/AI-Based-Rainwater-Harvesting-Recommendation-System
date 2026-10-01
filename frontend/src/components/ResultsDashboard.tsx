import React, { useState } from 'react'
import {
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Bookmark,
  Printer,
  RotateCcw,
} from 'lucide-react'
import type { AnalysisResponse } from '../types/analysis'
import { WaterBalanceChart } from './WaterBalanceChart'
import { StorageOptimizationChart } from './StorageOptimizationChart'
import { SystemSchematic } from './SystemSchematic'
import { PropertyMap } from './PropertyMap'

interface Props {
  data: AnalysisResponse
  onReset: () => void
  onSave: (data: AnalysisResponse) => void
}

export const ResultsDashboard: React.FC<Props> = ({ data, onReset, onSave }) => {
  const [saved, setSaved] = useState(false)

  const { recommendation, water_balance, tank_optimization_candidates, explainability, weather } = data

  const handleSaveClick = () => {
    onSave(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Hydrological Simulation Verified</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {data.request_id}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Rainwater Harvesting Intelligence Report</h2>
          <p className="text-xs text-slate-500">
            Location: {weather.city}, {weather.state} · Rainfall: {weather.annual_rainfall_mm} mm · {weather.weather_source}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSaveClick}
            disabled={saved}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm flex items-center space-x-1.5 transition-colors disabled:bg-emerald-50 disabled:text-emerald-700"
          >
            {saved ? <CheckCircle className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
            <span>{saved ? 'Saved to History!' : 'Save Analysis'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={onReset}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm flex items-center space-x-1.5 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* Top 4 Key Hydrological Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Gross Harvest */}
        <div className="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/60 to-white p-4 shadow-sm">
          <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
            Annual Gross Harvest
          </span>
          <div className="text-2xl font-black text-sky-950 font-mono mt-1">
            {recommendation.annual_gross_harvest_litres.toLocaleString()} <span className="text-sm font-normal">L</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Theoretical runoff ({recommendation.annual_collectable_litres.toLocaleString()} L collectable)
          </span>
        </div>

        {/* Metric 2: Net Usable Water */}
        <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Usable Water Supplied
            </span>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              {recommendation.water_savings_percentage}% Saved
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-950 font-mono mt-1">
            {recommendation.annual_usable_litres.toLocaleString()} <span className="text-sm font-normal">L</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Directly replaces municipal/tanker water
          </span>
        </div>

        {/* Metric 3: Groundwater Recharge */}
        <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50/60 to-white p-4 shadow-sm">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
            Recharge / Overflow
          </span>
          <div className="text-2xl font-black text-amber-950 font-mono mt-1">
            {recommendation.overflow_diverted_to_recharge_litres.toLocaleString()}{' '}
            <span className="text-sm font-normal">L</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Monsoon excess routed into ground aquifer
          </span>
        </div>

        {/* Metric 4: Optimal Tank & Payback */}
        <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">
              Optimized Tank Size
            </span>
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
              {recommendation.payback_years} yr payback
            </span>
          </div>
          <div className="text-2xl font-black text-indigo-950 font-mono mt-1">
            {recommendation.optimal_tank_capacity_litres.toLocaleString()}{' '}
            <span className="text-sm font-normal">L</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Est. Cost: ₹{recommendation.total_estimated_cost_inr.toLocaleString()} (₹
            {recommendation.annual_financial_savings_inr.toLocaleString()}/yr saved)
          </span>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      <div className="rounded-2xl border border-slate-700 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 text-white p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-bold">
                Recommended System Architecture
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {recommendation.system_type}
            </h3>
            <p className="text-xs text-slate-300">{recommendation.tagline}</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-center sm:text-right min-w-[140px]">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Suitability Rating</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              {recommendation.suitability_score} / 100
            </span>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 space-y-2">
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
              1. Storage Tank Specification
            </span>
            <p className="text-slate-200 leading-relaxed">{recommendation.tank_design_summary}</p>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 space-y-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              2. Groundwater Recharge Specification
            </span>
            {recommendation.recharge_structure ? (
              <div className="space-y-1 text-slate-200">
                <p className="font-semibold text-white">{recommendation.recharge_structure.structure_type}</p>
                <p className="text-[11px] text-slate-300">{recommendation.recharge_structure.dimensions}</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Filter Media: {recommendation.recharge_structure.filter_media}
                </p>
              </div>
            ) : (
              <p className="text-slate-400">
                Direct rooftop storage prioritized; separate excavation omitted for small catchment volume.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* STEP 7 Explainability Card: Why did the system recommend this? */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2.5">
          <HelpCircle className="h-4 w-4 text-emerald-600" />
          <span>Why Did the System Recommend This? (Engineering Explainability)</span>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            {explainability.headline_reason}
          </p>

          <ul className="space-y-2 text-xs text-slate-700">
            {explainability.reasons.map((reason, i) => (
              <li key={i} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-lg bg-amber-50/70 border border-amber-200 p-3 text-xs text-amber-900 space-y-1">
            <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-800">
              Trade-Off Analysis & Diminishing Returns
            </span>
            <p className="leading-relaxed text-[11px] text-slate-700">{explainability.trade_off_analysis}</p>
          </div>
        </div>
      </div>

      {/* System Schematic Flow */}
      <SystemSchematic
        roofType={data.water_balance.total_inflow_litres > 0 ? 'Catchment' : 'Rooftop'}
        roofArea={explainability.engineering_factors.catchment_sqm || 200}
        tankCapacity={recommendation.optimal_tank_capacity_litres}
        rechargeName={recommendation.recharge_structure?.structure_type || 'Surface Storage Tank'}
        rechargeDimensions={recommendation.recharge_structure?.dimensions}
      />

      {/* Property & Rainfall Catchment Geographic Verification Map */}
      <PropertyMap
        city={weather.city}
        state={weather.state}
        annualRainfallMm={weather.annual_rainfall_mm}
        roofAreaSqm={explainability.engineering_factors.catchment_sqm || 200}
        recommendedSystem={recommendation.system_type}
      />

      {/* 12-Month Water Balance Chart */}
      <WaterBalanceChart data={water_balance.monthly_breakdown} />

      {/* Multi-Candidate Storage Optimization Table */}
      <StorageOptimizationChart
        candidates={tank_optimization_candidates}
        optimalCapacity={recommendation.optimal_tank_capacity_litres}
      />
    </div>
  )
}
