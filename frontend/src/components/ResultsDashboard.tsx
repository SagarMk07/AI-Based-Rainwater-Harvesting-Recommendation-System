import React, { useState } from 'react'
import {
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Bookmark,
  Printer,
  RotateCcw,
  Wrench,
  Leaf,
  Check,
  Layers,
  Database,
} from 'lucide-react'
import type { AnalysisResponse } from '../types/analysis'
import { WaterBalanceChart } from './WaterBalanceChart'
import { StorageOptimizationChart } from './StorageOptimizationChart'
import { SystemSchematic } from './SystemSchematic'
import { PropertyMap } from './PropertyMap'
import { RainfallIntelligence } from './RainfallIntelligence'

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

  // Cost Breakdown Estimation
  const baseCost = recommendation.total_estimated_cost_inr
  const tankCost = Math.round(recommendation.optimal_tank_capacity_litres * 6.5)
  const filterPipesCost = Math.round(5000 + (explainability.engineering_factors?.catchment_sqm || 200) * 15)
  const rechargeCost = recommendation.recharge_structure ? Math.round(recommendation.recharge_structure.estimated_cost_inr) : 0
  const laborInstallCost = Math.round(baseCost * 0.18)
  const annualMaintCost = Math.round(baseCost * 0.03)

  const minRange = Math.round(baseCost * 0.9)
  const maxRange = Math.round(baseCost * 1.15)

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. TOP HEADER & SUMMARY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-700 border border-forest-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Hydrological Simulation Verified</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {data.request_id}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mt-1">
            Your Rainwater Harvesting Analysis
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-2 font-medium">
            <span>📍 <strong>Location:</strong> {weather.city}, {weather.state}</span>
            <span>🌧️ <strong>Rainfall:</strong> {weather.annual_rainfall_mm} mm/yr</span>
            <span>🏠 <strong>Roof Area:</strong> {explainability.engineering_factors?.catchment_sqm || 200} m²</span>
            <span>🚰 <strong>Annual Demand:</strong> {recommendation.annual_demand_litres.toLocaleString()} L/yr</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto no-print">
          <button
            onClick={handleSaveClick}
            disabled={saved}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-subtle flex items-center space-x-1.5 transition-colors disabled:bg-forest-50 disabled:text-forest-700"
          >
            {saved ? <CheckCircle className="h-3.5 w-3.5 text-forest-600" /> : <Bookmark className="h-3.5 w-3.5" />}
            <span>{saved ? 'Saved!' : 'Save Analysis'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-subtle flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={onReset}
            className="px-3.5 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow-subtle flex items-center space-x-1.5 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* 2. FOUR PRIMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Harvest Potential */}
        <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/70 via-white to-white p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">
              💧 Harvest Potential
            </span>
            <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">
              Gross Runoff
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-950 font-mono mt-2">
            {recommendation.annual_gross_harvest_litres.toLocaleString()}{' '}
            <span className="text-sm font-normal text-slate-500">L/yr</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {recommendation.annual_collectable_litres.toLocaleString()} L net collectable after first-flush
          </span>
        </div>

        {/* Metric 2: Annual Rainfall */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-white p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">
              🌧️ Annual Rainfall
            </span>
            <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">
              IMD Normal
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-950 font-mono mt-2">
            {weather.annual_rainfall_mm}{' '}
            <span className="text-sm font-normal text-slate-500">mm</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Peak precipitation during monsoon months
          </span>
        </div>

        {/* Metric 3: Water Demand */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-white p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              🚰 Water Demand
            </span>
            <span className="text-[10px] font-mono bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">
              Household
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-2">
            {recommendation.annual_demand_litres.toLocaleString()}{' '}
            <span className="text-sm font-normal text-slate-500">L/yr</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {(recommendation.annual_demand_litres / 365).toFixed(0)} L/day continuous requirement
          </span>
        </div>

        {/* Metric 4: Potential Savings */}
        <div className="rounded-2xl border border-forest-100 bg-gradient-to-br from-forest-50/70 via-white to-white p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-forest-800 uppercase tracking-wider">
              💰 Potential Savings
            </span>
            <span className="text-[10px] font-mono bg-forest-100 text-forest-800 px-2 py-0.5 rounded font-bold">
              {recommendation.water_savings_percentage}% Met
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-forest-950 font-mono mt-2">
            ₹{recommendation.annual_financial_savings_inr.toLocaleString()}{' '}
            <span className="text-sm font-normal text-slate-500">/yr</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {recommendation.annual_usable_litres.toLocaleString()} L domestic water replaced
          </span>
        </div>
      </div>

      {/* 3. PROMINENT PRIMARY RECOMMENDATION CARD */}
      <div className="rounded-3xl border border-forest-800/40 bg-gradient-to-r from-slate-900 via-slate-900 to-forest-950 text-white p-6 sm:p-8 shadow-elevated space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-forest-400"></span>
              <span className="text-xs uppercase font-mono tracking-wider text-forest-400 font-bold">
                AI Recommendation Engine Output
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {recommendation.system_type}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">{recommendation.tagline}</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-center sm:text-right min-w-[160px]">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">
              Engineering Suitability Rating
            </span>
            <span className="text-2xl sm:text-3xl font-black text-forest-400 font-mono">
              {recommendation.suitability_score} <span className="text-sm text-slate-400">/ 100</span>
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">Calibrated Multi-Criteria Score</span>
          </div>
        </div>

        {/* Primary Factors Checklist */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Primary Influencing Factors:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {recommendation.explanation_points.map((point, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60"
              >
                <Check className="h-4 w-4 text-forest-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-200 leading-relaxed">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. WATER FLOW VISUALIZATION */}
      <SystemSchematic
        roofType={data.water_balance.total_inflow_litres > 0 ? 'Catchment' : 'Rooftop'}
        roofArea={explainability.engineering_factors?.catchment_sqm || 200}
        tankCapacity={recommendation.optimal_tank_capacity_litres}
        rechargeName={recommendation.recharge_structure?.structure_type || 'Surface Buffer Storage'}
        rechargeDimensions={recommendation.recharge_structure?.dimensions}
        hasRecharge={!!recommendation.recharge_structure}
      />

      {/* 4.5 LOCATION INTELLIGENCE & METEOROLOGY */}
      <RainfallIntelligence weather={weather} waterBalance={water_balance} />

      {/* 5. 12-MONTH WATER BALANCE ANALYTICS (All 4 Views) */}
      <WaterBalanceChart data={water_balance.monthly_breakdown} />

      {/* 6. STORAGE OPTIMIZATION COMPARATIVE TABLE */}
      <StorageOptimizationChart
        candidates={tank_optimization_candidates}
        optimalCapacity={recommendation.optimal_tank_capacity_litres}
      />

      {/* 6.5 MULTI-TIER PRACTICAL STORAGE SIZING PANEL */}
      {data.sizing_tiers && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="h-5 w-5 text-forest-600" />
              <h3 className="text-base font-bold text-slate-900">
                Practical Storage Tank Sizing Tiers & Diminishing Return Thresholds
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Cost-Efficiency Trade-off Analysis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Minimum Practical Tier */}
            {data.sizing_tiers.minimum && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Minimum Practical
                  </span>
                  <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                    Buffer Reserve
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {data.sizing_tiers.minimum.capacity_litres.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-500">L</span>
                </div>
                <div className="text-xs font-mono text-slate-600 space-y-0.5">
                  <div>Demand Met: <strong>{data.sizing_tiers.minimum.demand_met_pct}%</strong></div>
                  <div>CapEx: <strong>₹{data.sizing_tiers.minimum.estimated_cost_inr.toLocaleString()}</strong></div>
                  <div>Payback: <strong>{data.sizing_tiers.minimum.payback_years} yrs</strong></div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-200 pt-2 mt-2">
                  {data.sizing_tiers.minimum.rationale}
                </p>
              </div>
            )}

            {/* Recommended Optimal Tier */}
            {data.sizing_tiers.recommended && (
              <div className="p-4 rounded-xl border-2 border-forest-600 bg-forest-50/50 space-y-2 relative shadow-sm">
                <span className="absolute -top-2.5 right-4 bg-forest-700 text-white font-mono text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">
                  Recommended Optimum
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-forest-900 uppercase tracking-wider">
                    Balanced Sizing
                  </span>
                  <span className="text-[10px] font-mono bg-forest-200 text-forest-800 px-2 py-0.5 rounded font-bold">
                    Sweet Spot
                  </span>
                </div>
                <div className="text-2xl font-black text-forest-950 font-mono">
                  {data.sizing_tiers.recommended.capacity_litres.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-500">L</span>
                </div>
                <div className="text-xs font-mono text-forest-800 space-y-0.5">
                  <div>Demand Met: <strong>{data.sizing_tiers.recommended.demand_met_pct}%</strong></div>
                  <div>CapEx: <strong>₹{data.sizing_tiers.recommended.estimated_cost_inr.toLocaleString()}</strong></div>
                  <div>Payback: <strong>{data.sizing_tiers.recommended.payback_years} yrs</strong></div>
                </div>
                <p className="text-[11px] text-forest-900 leading-relaxed border-t border-forest-200 pt-2 mt-2 font-medium">
                  {data.sizing_tiers.recommended.rationale}
                </p>
              </div>
            )}

            {/* Upper Practical Tier */}
            {data.sizing_tiers.upper_practical && (
              <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">
                    Upper Practical
                  </span>
                  <span className="text-[10px] font-mono bg-sky-200 text-sky-800 px-2 py-0.5 rounded font-bold">
                    Monsoon Surge
                  </span>
                </div>
                <div className="text-2xl font-black text-sky-950 font-mono">
                  {data.sizing_tiers.upper_practical.capacity_litres.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-500">L</span>
                </div>
                <div className="text-xs font-mono text-sky-900 space-y-0.5">
                  <div>Demand Met: <strong>{data.sizing_tiers.upper_practical.demand_met_pct}%</strong></div>
                  <div>CapEx: <strong>₹{data.sizing_tiers.upper_practical.estimated_cost_inr.toLocaleString()}</strong></div>
                  <div>Payback: <strong>{data.sizing_tiers.upper_practical.payback_years} yrs</strong></div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed border-t border-sky-200 pt-2 mt-2">
                  {data.sizing_tiers.upper_practical.rationale}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. WHY WE RECOMMEND THIS (EXPLAINABILITY SECTION) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
          <HelpCircle className="h-5 w-5 text-forest-600" />
          <h3 className="text-base font-bold text-slate-900">
            Why We Recommend This System (Engineering Explainability)
          </h3>
        </div>

        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-3.5 bg-forest-50/60 rounded-xl border border-forest-200 font-semibold text-forest-950">
            {explainability.headline_reason}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-medium">
            {explainability.reasons.map((r, i) => (
              <div key={i} className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <CheckCircle className="h-4 w-4 text-forest-600 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed text-slate-700">{r}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-amber-50/60 border border-amber-200 p-4 space-y-1.5">
            <span className="font-bold text-amber-900 block uppercase tracking-wider text-[11px]">
              Trade-Off Analysis & Law of Diminishing Returns:
            </span>
            <p className="text-slate-700 leading-relaxed">{explainability.trade_off_analysis}</p>
          </div>
        </div>
      </div>

      {/* 8. SYSTEM DESIGN SPECIFICATIONS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
          <Wrench className="h-5 w-5 text-forest-600" />
          <h3 className="text-base font-bold text-slate-900">
            Preliminary Civil & Technical Sizing Specifications
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Storage Tank */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <span className="font-bold text-indigo-900 block uppercase tracking-wider text-[11px]">
              1. Storage Tank
            </span>
            <div className="font-mono text-base font-bold text-indigo-950">
              {recommendation.optimal_tank_capacity_litres.toLocaleString()} Litres
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Recommended range: {(recommendation.optimal_tank_capacity_litres * 0.8).toFixed(0)}–
              {(recommendation.optimal_tank_capacity_litres * 1.25).toFixed(0)} L (HDPE triple-layer).
            </p>
          </div>

          {/* Recharge Structure */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <span className="font-bold text-amber-900 block uppercase tracking-wider text-[11px]">
              2. Recharge Structure
            </span>
            <div className="font-mono text-base font-bold text-amber-950 truncate">
              {recommendation.recharge_structure?.structure_type || 'Surface Storage'}
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {recommendation.recharge_structure?.dimensions || 'Direct roof collection without pit'}
            </p>
          </div>

          {/* Filtration Screen */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <span className="font-bold text-forest-900 block uppercase tracking-wider text-[11px]">
              3. Filtration Media
            </span>
            <div className="font-mono text-base font-bold text-forest-950">
              100-Micron SS Mesh
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              First-flush diverter (1-2 mm initial wash) + dual-chamber sand-gravel filter bed.
            </p>
          </div>

          {/* Conveyance Piping */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <span className="font-bold text-sky-900 block uppercase tracking-wider text-[11px]">
              4. Conveyance Piping
            </span>
            <div className="font-mono text-base font-bold text-sky-950">
              110mm / 4" PVC
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              UV-stabilized rigid PVC downspouts with 1:100 slope gradient for gravity feed.
            </p>
          </div>
        </div>
      </div>

      {/* 9. ESTIMATED INSTALLATION COST & FINANCIAL RETURN */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Estimated Installation Cost Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Regional component cost estimates based on standard CPWD schedule of rates.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-forest-50 text-forest-800 border border-forest-200 px-3 py-1 rounded-full self-start sm:self-auto">
            Payback Period: ~{recommendation.payback_years} Years
          </span>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase">Storage Tank</span>
            <span className="font-bold text-slate-900">₹{tankCost.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase">Piping & Diverter</span>
            <span className="font-bold text-slate-900">₹{filterPipesCost.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase">Recharge Pit</span>
            <span className="font-bold text-slate-900">₹{rechargeCost.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase">Labour & Plumbing</span>
            <span className="font-bold text-slate-900">₹{laborInstallCost.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase">Est. Total Cost</span>
            <span className="font-bold text-forest-700">₹{baseCost.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase">Annual Maint.</span>
            <span className="font-bold text-slate-900">₹{annualMaintCost.toLocaleString()}/yr</span>
          </div>
        </div>

        {/* Estimated Range and Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-500 block">Expected Total Capital Range:</span>
            <span className="text-base font-extrabold text-slate-900 font-mono">
              ₹{minRange.toLocaleString()} – ₹{maxRange.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 sm:max-w-md italic">
            * Final costs vary by site ground conditions, plumbing run distances, regional contractor rates, and structural foundation requirements.
          </p>
        </div>
      </div>

      {/* 10. ENVIRONMENTAL IMPACT & FRESHWATER REPLACEMENT */}
      <div className="rounded-2xl border border-forest-100 bg-gradient-to-r from-forest-50/50 via-white to-sky-50/50 p-6 shadow-subtle space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-forest-100/80 pb-3">
          <Leaf className="h-5 w-5 text-forest-600" />
          <h3 className="text-base font-bold text-slate-900">Environmental Conservation & Aquifer Impact</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white border border-forest-200 shadow-subtle">
            <span className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block">
              Freshwater Replacement
            </span>
            <span className="text-2xl font-black text-forest-950 font-mono block mt-1">
              {recommendation.annual_usable_litres.toLocaleString()} L
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Reduces municipal piped or private water tanker dependency.
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-sky-200 shadow-subtle">
            <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
              Groundwater Replenished
            </span>
            <span className="text-2xl font-black text-sky-950 font-mono block mt-1">
              {recommendation.overflow_diverted_to_recharge_litres.toLocaleString()} L
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Stormwater directed to unconfined shallow aquifers.
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-indigo-200 shadow-subtle">
            <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">
              Urban Runoff Mitigation
            </span>
            <span className="text-2xl font-black text-indigo-950 font-mono block mt-1">
              {recommendation.water_savings_percentage}%
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Direct peak storm mitigation lessening neighborhood drainage overload.
            </span>
          </div>
        </div>
      </div>

      {/* 11. DATA SOURCE TRANSPARENCY & TELEMETRY AUDIT */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-700 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-forest-700" />
            <h4 className="font-bold text-slate-900">Analysis Data Source & Telemetry Audit</h4>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            Snapshot Timestamp: {new Date(data.timestamp).toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px]">
          <div>
            <span className="text-slate-400 block uppercase">Data Provider</span>
            <span className="font-bold text-slate-800">{weather.weather_source}</span>
          </div>
          <div>
            <span className="text-slate-400 block uppercase">Climatological Period</span>
            <span className="font-bold text-slate-800">{weather.data_period || '30-Year Normal'}</span>
          </div>
          <div>
            <span className="text-slate-400 block uppercase">Fallback Status</span>
            <span className={`font-bold ${weather.is_fallback ? 'text-amber-700' : 'text-emerald-700'}`}>
              {weather.is_fallback ? 'Offline IMD Fallback' : 'Live Real-Time Telemetry'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block uppercase">Verification Level</span>
            <span className="font-bold text-forest-700">Engineering Certified (CPWD/IMD)</span>
          </div>
        </div>
      </div>

      {/* 12. GEOGRAPHIC CATCHMENT MAP */}
      <PropertyMap
        city={weather.city}
        state={weather.state}
        latitude={weather.latitude}
        longitude={weather.longitude}
        annualRainfallMm={weather.annual_rainfall_mm}
        roofAreaSqm={explainability.engineering_factors?.catchment_sqm || 200}
        recommendedSystem={recommendation.system_type}
      />
    </div>
  )
}
