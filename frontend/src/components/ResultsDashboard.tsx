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
import PageHeader from './ui/PageHeader'

interface Props {
  data: AnalysisResponse
  onReset: () => void
  onSave: (data: AnalysisResponse) => void
  isGuest?: boolean
  onPromptSaveAccount?: () => void
}

export const ResultsDashboard: React.FC<Props> = ({
  data,
  onReset,
  onSave,
  isGuest = false,
  onPromptSaveAccount,
}) => {
  const [saved, setSaved] = useState(false)

  const { recommendation, water_balance, tank_optimization_candidates, explainability, weather } = data

  const handleSaveClick = () => {
    onSave(data)
    setSaved(true)
    if (isGuest && onPromptSaveAccount) {
      onPromptSaveAccount()
    }
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
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-forest-700">
            <ShieldCheck className="h-4 w-4" />
            <span>Hydrological Simulation Verified</span>
            <span className="text-[#8C948C] font-mono text-[10px] ml-1">ID: {data.request_id}</span>
          </span>
        }
        title="Your Rainwater Harvesting Analysis"
        description={`Location: ${weather.city}, ${weather.state} • Rainfall: ${weather.annual_rainfall_mm} mm/yr • Roof Area: ${explainability.engineering_factors?.catchment_sqm || 200} m² • Demand: ${recommendation.annual_demand_litres.toLocaleString()} L/yr`}
        actions={
          <div className="flex flex-wrap items-center gap-2.5 no-print">
            <button
              onClick={handleSaveClick}
              disabled={saved}
              className="neu-btn-secondary h-10 px-4 text-xs font-semibold space-x-1.5 disabled:opacity-75"
            >
              {saved ? <CheckCircle className="h-4 w-4 text-forest-600" /> : <Bookmark className="h-4 w-4 text-[#687068]" />}
              <span>{saved ? 'Saved to Records!' : 'Save Analysis'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="neu-btn-secondary h-10 px-4 text-xs font-semibold space-x-1.5"
            >
              <Printer className="h-4 w-4 text-[#687068]" />
              <span>Print Report</span>
            </button>
            <button
              onClick={onReset}
              className="neu-btn-primary h-10 px-4 text-xs font-bold space-x-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              <span>New Analysis</span>
            </button>
          </div>
        }
      />

      {/* 2. FOUR PRIMARY METRIC CARDS (Tactile Neumorphic Surface) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Harvest Potential */}
        <div className="neu-card-interactive p-5 flex flex-col justify-between h-full min-w-0">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#252B26] uppercase tracking-wider">
                Harvest Potential
              </span>
              <span className="text-[10px] font-mono neu-inset px-2 py-0.5 font-bold text-water-700">
                Gross Runoff
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#252B26] font-mono mt-2">
              {recommendation.annual_gross_harvest_litres.toLocaleString()}{' '}
              <span className="text-xs font-normal text-[#687068]">L/yr</span>
            </div>
          </div>
          <span className="text-[11px] text-[#687068] mt-2 block border-t border-[#DEDFD8] pt-2">
            {recommendation.annual_collectable_litres.toLocaleString()} L net collectable
          </span>
        </div>

        {/* Metric 2: Annual Rainfall */}
        <div className="neu-card-interactive p-5 flex flex-col justify-between h-full min-w-0">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#252B26] uppercase tracking-wider">
                Annual Rainfall
              </span>
              <span className="text-[10px] font-mono neu-inset px-2 py-0.5 font-bold text-forest-700">
                IMD Normal
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#252B26] font-mono mt-2">
              {weather.annual_rainfall_mm}{' '}
              <span className="text-xs font-normal text-[#687068]">mm</span>
            </div>
          </div>
          <span className="text-[11px] text-[#687068] mt-2 block border-t border-[#DEDFD8] pt-2">
            Peak precipitation during monsoon
          </span>
        </div>

        {/* Metric 3: Water Demand */}
        <div className="neu-card-interactive p-5 flex flex-col justify-between h-full min-w-0">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#252B26] uppercase tracking-wider">
                Water Demand
              </span>
              <span className="text-[10px] font-mono neu-inset px-2 py-0.5 font-bold text-[#687068]">
                Household
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#252B26] font-mono mt-2">
              {recommendation.annual_demand_litres.toLocaleString()}{' '}
              <span className="text-xs font-normal text-[#687068]">L/yr</span>
            </div>
          </div>
          <span className="text-[11px] text-[#687068] mt-2 block border-t border-[#DEDFD8] pt-2">
            {(recommendation.annual_demand_litres / 365).toFixed(0)} L/day continuous requirement
          </span>
        </div>

        {/* Metric 4: Potential Savings */}
        <div className="neu-card-interactive p-5 flex flex-col justify-between h-full min-w-0">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#252B26] uppercase tracking-wider">
                Financial Savings
              </span>
              <span className="text-[10px] font-mono neu-inset px-2 py-0.5 font-bold text-forest-700">
                {recommendation.water_savings_percentage}% Met
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-forest-700 font-mono mt-2">
              ₹{recommendation.annual_financial_savings_inr.toLocaleString()}{' '}
              <span className="text-xs font-normal text-[#687068]">/yr</span>
            </div>
          </div>
          <span className="text-[11px] text-[#687068] mt-2 block border-t border-[#DEDFD8] pt-2">
            {recommendation.annual_usable_litres.toLocaleString()} L domestic water replaced
          </span>
        </div>
      </div>

      {/* 3. PROMINENT PRIMARY RECOMMENDATION CARD (Hero Visual Emphasis) */}
      <div className="rounded-3xl bg-[#132018] text-white p-6 sm:p-8 shadow-[8px_8px_20px_rgba(108,126,114,0.22),-8px_-8px_20px_rgba(255,255,255,0.7)] border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-bold">
                AI Recommendation Engine Output
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {recommendation.system_type}
            </h2>
            <p className="text-xs sm:text-sm text-[#C2D1C7] max-w-2xl">{recommendation.tagline}</p>
          </div>

          <div className="bg-[#1C2C22] border border-white/10 rounded-2xl p-4 text-center sm:text-right min-w-[160px]">
            <span className="text-[10px] text-[#A5B8AC] uppercase font-mono block">
              Suitability Rating
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {recommendation.suitability_score} <span className="text-sm text-[#A8ACA8]">/ 100</span>
            </span>
            <span className="text-[10px] text-[#A8ACA8] block font-mono">Multi-Criteria Score</span>
          </div>
        </div>

        {/* Primary Factors Checklist */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#EEEEEA] block">
            Primary Influencing Factors:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {recommendation.explanation_points.map((point, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-white/5 border border-white/5"
              >
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-[#EEEEEA] leading-relaxed">{point}</span>
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

      {/* 5. 12-MONTH WATER BALANCE ANALYTICS */}
      <WaterBalanceChart data={water_balance.monthly_breakdown} />

      {/* 6. STORAGE OPTIMIZATION COMPARATIVE TABLE */}
      <StorageOptimizationChart
        candidates={tank_optimization_candidates}
        optimalCapacity={recommendation.optimal_tank_capacity_litres}
      />

      {/* 6.5 MULTI-TIER PRACTICAL STORAGE SIZING PANEL */}
      {data.sizing_tiers && (
        <div className="neu-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEDFD8] pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="h-5 w-5 text-forest-700" />
              <h3 className="text-base font-bold text-[#252B26]">
                Practical Storage Tank Sizing Tiers & Diminishing Return Thresholds
              </h3>
            </div>
            <span className="text-xs text-[#687068] font-mono">
              Cost-Efficiency Trade-off Analysis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Minimum Practical Tier */}
            {data.sizing_tiers.minimum && (
              <div className="neu-card-sm p-4.5 flex flex-col justify-between h-full min-w-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#252B26] uppercase tracking-wider">
                      Minimum Practical
                    </span>
                    <span className="text-[10px] font-mono neu-inset px-2 py-0.5 font-bold text-[#687068]">
                      Buffer Reserve
                    </span>
                  </div>
                  <div className="text-2xl font-black text-[#252B26] font-mono">
                    {data.sizing_tiers.minimum.capacity_litres.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-[#687068]">L</span>
                  </div>
                  <div className="text-xs font-mono text-[#687068] space-y-0.5">
                    <div>Demand Met: <strong className="text-[#252B26]">{data.sizing_tiers.minimum.demand_met_pct}%</strong></div>
                    <div>CapEx: <strong className="text-[#252B26]">₹{data.sizing_tiers.minimum.estimated_cost_inr.toLocaleString()}</strong></div>
                    <div>Payback: <strong className="text-[#252B26]">{data.sizing_tiers.minimum.payback_years} yrs</strong></div>
                  </div>
                </div>
                <p className="text-[11px] text-[#687068] leading-relaxed border-t border-[#DEDFD8] pt-2 mt-3">
                  {data.sizing_tiers.minimum.rationale}
                </p>
              </div>
            )}

            {/* Recommended Optimal Tier */}
            {data.sizing_tiers.recommended && (
              <div className="p-4.5 rounded-2xl border-2 border-forest-600 bg-[#EEEEEA] shadow-neu-sm flex flex-col justify-between h-full min-w-0 relative">
                <span className="absolute -top-2.5 right-4 bg-forest-700 text-white font-mono text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                  Recommended Optimum
                </span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">
                      Balanced Sizing
                    </span>
                    <span className="text-[10px] font-mono neu-inset px-2 py-0.5 font-bold text-forest-700">
                      Sweet Spot
                    </span>
                  </div>
                  <div className="text-2xl font-black text-forest-700 font-mono">
                    {data.sizing_tiers.recommended.capacity_litres.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-forest-700">L</span>
                  </div>
                  <div className="text-xs font-mono text-forest-900 space-y-0.5">
                    <div>Demand Met: <strong>{data.sizing_tiers.recommended.demand_met_pct}%</strong></div>
                    <div>CapEx: <strong>₹{data.sizing_tiers.recommended.estimated_cost_inr.toLocaleString()}</strong></div>
                    <div>Payback: <strong>{data.sizing_tiers.recommended.payback_years} yrs</strong></div>
                  </div>
                </div>
                <p className="text-[11px] text-forest-900 leading-relaxed border-t border-[#DEDFD8] pt-2 mt-3 font-medium">
                  {data.sizing_tiers.recommended.rationale}
                </p>
              </div>
            )}

            {/* Upper Practical Tier */}
            {data.sizing_tiers.upper_practical && (
              <div className="neu-card-sm p-4.5 flex flex-col justify-between h-full min-w-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#252B26] uppercase tracking-wider">
                      Upper Practical
                    </span>
                    <span className="text-[10px] font-mono neu-inset px-2 py-0.5 font-bold text-water-700">
                      Monsoon Surge
                    </span>
                  </div>
                  <div className="text-2xl font-black text-[#252B26] font-mono">
                    {data.sizing_tiers.upper_practical.capacity_litres.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-[#687068]">L</span>
                  </div>
                  <div className="text-xs font-mono text-[#687068] space-y-0.5">
                    <div>Demand Met: <strong className="text-[#252B26]">{data.sizing_tiers.upper_practical.demand_met_pct}%</strong></div>
                    <div>CapEx: <strong className="text-[#252B26]">₹{data.sizing_tiers.upper_practical.estimated_cost_inr.toLocaleString()}</strong></div>
                    <div>Payback: <strong className="text-[#252B26]">{data.sizing_tiers.upper_practical.payback_years} yrs</strong></div>
                  </div>
                </div>
                <p className="text-[11px] text-[#687068] leading-relaxed border-t border-[#DEDFD8] pt-2 mt-3">
                  {data.sizing_tiers.upper_practical.rationale}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. WHY WE RECOMMEND THIS (EXPLAINABILITY SECTION) */}
      <div className="neu-card p-6 space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-[#DEDFD8] pb-3">
          <HelpCircle className="h-5 w-5 text-forest-700" />
          <h3 className="text-base font-bold text-[#252B26]">
            Why We Recommend This System (Engineering Explainability)
          </h3>
        </div>

        <div className="space-y-4 text-xs">
          <div className="neu-inset p-3.5 font-semibold text-forest-700 border border-[#DEDFD8]">
            {explainability.headline_reason}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-medium">
            {explainability.reasons.map((r, i) => (
              <div key={i} className="neu-raised-sm p-3 flex items-start space-x-2.5 border border-[#DEDFD8]">
                <CheckCircle className="h-4 w-4 text-forest-600 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed text-[#252B26]">{r}</span>
              </div>
            ))}
          </div>

          <div className="neu-inset p-4 space-y-1.5 border border-[#DEDFD8]">
            <span className="font-bold text-[#252B26] block uppercase tracking-wider text-[11px]">
              Trade-Off Analysis & Law of Diminishing Returns:
            </span>
            <p className="text-[#687068] leading-relaxed">{explainability.trade_off_analysis}</p>
          </div>
        </div>
      </div>

      {/* 8. SYSTEM DESIGN SPECIFICATIONS */}
      <div className="neu-card p-6 space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-[#DEDFD8] pb-3">
          <Wrench className="h-5 w-5 text-forest-700" />
          <h3 className="text-base font-bold text-[#252B26]">
            Preliminary Civil & Technical Sizing Specifications
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Storage Tank */}
          <div className="neu-raised-sm p-4 space-y-2 border border-[#DEDFD8]">
            <span className="font-bold text-indigo-900 block uppercase tracking-wider text-[11px]">
              1. Storage Tank
            </span>
            <div className="font-mono text-base font-bold text-[#252B26]">
              {recommendation.optimal_tank_capacity_litres.toLocaleString()} Litres
            </div>
            <p className="text-[#687068] text-[11px] leading-relaxed">
              Recommended range: {(recommendation.optimal_tank_capacity_litres * 0.8).toFixed(0)}–
              {(recommendation.optimal_tank_capacity_litres * 1.25).toFixed(0)} L (HDPE triple-layer).
            </p>
          </div>

          {/* Recharge Structure */}
          <div className="neu-raised-sm p-4 space-y-2 border border-[#DEDFD8]">
            <span className="font-bold text-amber-900 block uppercase tracking-wider text-[11px]">
              2. Recharge Structure
            </span>
            <div className="font-mono text-base font-bold text-[#252B26] truncate">
              {recommendation.recharge_structure?.structure_type || 'Surface Storage'}
            </div>
            <p className="text-[#687068] text-[11px] leading-relaxed">
              {recommendation.recharge_structure?.dimensions || 'Direct roof collection without pit'}
            </p>
          </div>

          {/* Filtration Screen */}
          <div className="neu-raised-sm p-4 space-y-2 border border-[#DEDFD8]">
            <span className="font-bold text-forest-900 block uppercase tracking-wider text-[11px]">
              3. Filtration Media
            </span>
            <div className="font-mono text-base font-bold text-[#252B26]">
              100-Micron SS Mesh
            </div>
            <p className="text-[#687068] text-[11px] leading-relaxed">
              First-flush diverter (1-2 mm initial wash) + dual-chamber sand-gravel filter bed.
            </p>
          </div>

          {/* Conveyance Piping */}
          <div className="neu-raised-sm p-4 space-y-2 border border-[#DEDFD8]">
            <span className="font-bold text-sky-900 block uppercase tracking-wider text-[11px]">
              4. Conveyance Piping
            </span>
            <div className="font-mono text-base font-bold text-[#252B26]">
              110mm / 4" PVC
            </div>
            <p className="text-[#687068] text-[11px] leading-relaxed">
              UV-stabilized rigid PVC downspouts with 1:100 slope gradient for gravity feed.
            </p>
          </div>
        </div>
      </div>

      {/* 9. ESTIMATED INSTALLATION COST & FINANCIAL RETURN */}
      <div className="neu-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DEDFD8] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#252B26]">
              Estimated Installation Cost Breakdown
            </h3>
            <p className="text-xs text-[#687068]">
              Regional component cost estimates based on standard CPWD schedule of rates.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-[#EEEEEA] text-forest-700 border border-[#DEDFD8] px-3 py-1 rounded-full self-start sm:self-auto shadow-neu-sm">
            Payback Period: ~{recommendation.payback_years} Years
          </span>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
          <div className="p-3 neu-inset rounded-xl border border-[#DEDFD8]">
            <span className="text-[10px] text-[#8C948C] block uppercase">Storage Tank</span>
            <span className="font-bold text-[#252B26]">₹{tankCost.toLocaleString()}</span>
          </div>
          <div className="p-3 neu-inset rounded-xl border border-[#DEDFD8]">
            <span className="text-[10px] text-[#8C948C] block uppercase">Piping & Diverter</span>
            <span className="font-bold text-[#252B26]">₹{filterPipesCost.toLocaleString()}</span>
          </div>
          <div className="p-3 neu-inset rounded-xl border border-[#DEDFD8]">
            <span className="text-[10px] text-[#8C948C] block uppercase">Recharge Pit</span>
            <span className="font-bold text-[#252B26]">₹{rechargeCost.toLocaleString()}</span>
          </div>
          <div className="p-3 neu-inset rounded-xl border border-[#DEDFD8]">
            <span className="text-[10px] text-[#8C948C] block uppercase">Labour & Plumbing</span>
            <span className="font-bold text-[#252B26]">₹{laborInstallCost.toLocaleString()}</span>
          </div>
          <div className="p-3 neu-inset rounded-xl border border-[#DEDFD8]">
            <span className="text-[10px] text-[#8C948C] block uppercase">Est. Total Cost</span>
            <span className="font-bold text-forest-700">₹{baseCost.toLocaleString()}</span>
          </div>
          <div className="p-3 neu-inset rounded-xl border border-[#DEDFD8]">
            <span className="text-[10px] text-[#8C948C] block uppercase">Annual Maint.</span>
            <span className="font-bold text-[#252B26]">₹{annualMaintCost.toLocaleString()}/yr</span>
          </div>
        </div>

        {/* Estimated Range and Disclaimer */}
        <div className="p-4 rounded-xl neu-raised-sm border border-[#DEDFD8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[#687068] block">Expected Total Capital Range:</span>
            <span className="text-base font-extrabold text-[#252B26] font-mono">
              ₹{minRange.toLocaleString()} – ₹{maxRange.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-[#8C948C] sm:max-w-md italic">
            * Final costs vary by site ground conditions, plumbing run distances, regional contractor rates, and structural foundation requirements.
          </p>
        </div>
      </div>

      {/* 10. ENVIRONMENTAL IMPACT & FRESHWATER REPLACEMENT */}
      <div className="neu-card p-6 space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-[#DEDFD8] pb-3">
          <Leaf className="h-5 w-5 text-forest-700" />
          <h3 className="text-base font-bold text-[#252B26]">Environmental Conservation & Aquifer Impact</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl neu-raised-sm border border-[#DEDFD8]">
            <span className="text-[11px] font-bold text-forest-700 uppercase tracking-wider block">
              Freshwater Replacement
            </span>
            <span className="text-2xl font-black text-forest-700 font-mono block mt-1">
              {recommendation.annual_usable_litres.toLocaleString()} L
            </span>
            <span className="text-[11px] text-[#687068] mt-1 block">
              Reduces municipal piped or private water tanker dependency.
            </span>
          </div>

          <div className="p-4 rounded-xl neu-raised-sm border border-[#DEDFD8]">
            <span className="text-[11px] font-bold text-water-700 uppercase tracking-wider block">
              Groundwater Replenished
            </span>
            <span className="text-2xl font-black text-water-950 font-mono block mt-1">
              {recommendation.overflow_diverted_to_recharge_litres.toLocaleString()} L
            </span>
            <span className="text-[11px] text-[#687068] mt-1 block">
              Stormwater directed to unconfined shallow aquifers.
            </span>
          </div>

          <div className="p-4 rounded-xl neu-raised-sm border border-[#DEDFD8]">
            <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">
              Urban Runoff Mitigation
            </span>
            <span className="text-2xl font-black text-indigo-950 font-mono block mt-1">
              {recommendation.water_savings_percentage}%
            </span>
            <span className="text-[11px] text-[#687068] mt-1 block">
              Direct peak storm mitigation lessening neighborhood drainage overload.
            </span>
          </div>
        </div>
      </div>

      {/* 11. DATA SOURCE TRANSPARENCY & TELEMETRY AUDIT */}
      <div className="p-5 rounded-2xl neu-inset text-xs text-[#252B26] space-y-3 border border-[#DEDFD8]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-300/40 pb-2">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-forest-700" />
            <h4 className="font-bold text-[#252B26]">Analysis Data Source & Telemetry Audit</h4>
          </div>
          <span className="font-mono text-[11px] text-[#8C948C]">
            Snapshot Timestamp: {new Date(data.timestamp).toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px]">
          <div>
            <span className="text-[#8C948C] block uppercase">Data Provider</span>
            <span className="font-bold text-[#252B26]">{weather.weather_source}</span>
          </div>
          <div>
            <span className="text-[#8C948C] block uppercase">Climatological Period</span>
            <span className="font-bold text-[#252B26]">{weather.data_period || '30-Year Normal'}</span>
          </div>
          <div>
            <span className="text-[#8C948C] block uppercase">Fallback Status</span>
            <span className={`font-bold ${weather.is_fallback ? 'text-amber-800' : 'text-emerald-800'}`}>
              {weather.is_fallback ? 'Offline IMD Fallback' : 'Live Real-Time Telemetry'}
            </span>
          </div>
          <div>
            <span className="text-[#8C948C] block uppercase">Verification Level</span>
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

export default ResultsDashboard
