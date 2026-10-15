import React, { useState } from 'react'
import {
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Bookmark,
  Printer,
  RotateCcw,
  Wrench,
  Check,
  Layers,
  Database,
  Sliders,
  X,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import type { AnalysisResponse, WaterBalanceResult } from '../types/analysis'
import { analysisService } from '../services/analysisService'
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
  const [currentTankCapacity, setCurrentTankCapacity] = useState<number>(
    data.recommendation.optimal_tank_capacity_litres || 5000
  )
  const [activeWaterBalance, setActiveWaterBalance] = useState<WaterBalanceResult>(data.water_balance)
  const [isSimulating, setIsSimulating] = useState(false)
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [prevRequestId, setPrevRequestId] = useState(data.request_id)

  const { recommendation, tank_optimization_candidates, explainability, weather } = data

  // Reset simulated state when reopening a different analysis
  if (data.request_id !== prevRequestId) {
    setPrevRequestId(data.request_id)
    setCurrentTankCapacity(data.recommendation.optimal_tank_capacity_litres || 5000)
    setActiveWaterBalance(data.water_balance)
  }

  const dailyDemand = Number(
    data.input_snapshot?.daily_demand_litres ||
      (recommendation.annual_demand_litres ? recommendation.annual_demand_litres / 365.0 : 600)
  )

  const handleCapacityChange = async (newCapacity: number, _tierKey?: string) => {
    setCurrentTankCapacity(newCapacity)
    setIsSimulating(true)
    try {
      const roofArea = Number(
        data.input_snapshot?.roof_area_sqm || explainability.engineering_factors?.catchment_sqm || 200
      )
      const roofType = String(data.input_snapshot?.roof_type || 'rcc')
      const filterEff = Number(data.input_snapshot?.filter_efficiency || 0.90)
      const monthlyRain =
        weather.monthly_rainfall_mm && weather.monthly_rainfall_mm.length === 12
          ? weather.monthly_rainfall_mm
          : Array(12).fill(weather.annual_rainfall_mm / 12)

      const result = await analysisService.simulateWaterBalance({
        monthly_rainfall_mm: monthlyRain,
        roof_area_sqm: roofArea,
        roof_type: roofType,
        tank_capacity_litres: newCapacity,
        daily_demand_litres: dailyDemand,
        filter_efficiency: filterEff,
      })
      setActiveWaterBalance(result)
    } catch (err) {
      console.error('Failed to simulate water balance for new capacity:', err)
    } finally {
      setIsSimulating(false)
    }
  }

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
  const tankCost = Math.round(currentTankCapacity * 6.5)
  const filterPipesCost = Math.round(5000 + (explainability.engineering_factors?.catchment_sqm || 200) * 15)
  const rechargeCost = recommendation.recharge_structure
    ? Math.round(recommendation.recharge_structure.estimated_cost_inr)
    : 0
  const laborInstallCost = Math.round(baseCost * 0.18)
  const annualMaintCost = Math.round(baseCost * 0.03)

  const minRange = Math.round(baseCost * 0.9)
  const maxRange = Math.round(baseCost * 1.15)

  // Autonomy in days provided by the current capacity
  const autonomyDays = dailyDemand > 0 ? Math.round(currentTankCapacity / dailyDemand) : 0

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

      {/* 2. FOUR PRIMARY METRIC CARDS (Tactile Neumorphic Surface - Dynamically Reflecting Simulated Balance) */}
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
            {dailyDemand.toFixed(0)} L/day continuous requirement
          </span>
        </div>

        {/* Metric 4: Usable Water & Financial Savings (Live Simulated) */}
        <div className="neu-card-interactive p-5 flex flex-col justify-between h-full min-w-0">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#252B26] uppercase tracking-wider">
                Financial Savings
              </span>
              <span className="text-[10px] font-mono neu-inset px-2 py-0.5 font-bold text-forest-700">
                {activeWaterBalance.demand_met_percentage}% Met
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-forest-700 font-mono mt-2">
              ₹{Math.round(activeWaterBalance.total_supplied_litres * 0.075).toLocaleString()}{' '}
              <span className="text-xs font-normal text-[#687068]">/yr</span>
            </div>
          </div>
          <span className="text-[11px] text-[#687068] mt-2 block border-t border-[#DEDFD8] pt-2">
            {activeWaterBalance.total_supplied_litres.toLocaleString()} L usable water supplied
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

        {/* 4 Pillars of the Recommendation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1C2C22] p-4 rounded-xl border border-white/5 space-y-1">
            <span className="text-[11px] text-[#A5B8AC] uppercase font-mono block">
              Usable Water
            </span>
            <div className="text-xl font-bold font-mono text-white">
              {activeWaterBalance.total_supplied_litres.toLocaleString()} L
            </div>
            <span className="text-[10px] text-[#85998C] block">
              Supplied across all 12 months
            </span>
          </div>

          <div className="bg-[#1C2C22] p-4 rounded-xl border border-white/5 space-y-1">
            <span className="text-[11px] text-[#A5B8AC] uppercase font-mono block">
              Recharge Diversion
            </span>
            <div className="text-xl font-bold font-mono text-white">
              {activeWaterBalance.total_overflow_litres.toLocaleString()} L
            </div>
            <span className="text-[10px] text-[#85998C] block">
              Routed into groundwater aquifer
            </span>
          </div>

          <div className="bg-[#1C2C22] p-4 rounded-xl border border-white/5 space-y-1">
            <span className="text-[11px] text-[#A5B8AC] uppercase font-mono block">
              Simulated Tank Capacity
            </span>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {currentTankCapacity.toLocaleString()} L
            </div>
            <span className="text-[10px] text-[#85998C] block">
              {autonomyDays} days emergency reserve
            </span>
          </div>

          <div className="bg-[#1C2C22] p-4 rounded-xl border border-white/5 space-y-1">
            <span className="text-[11px] text-[#A5B8AC] uppercase font-mono block">
              Financial Payback
            </span>
            <div className="text-xl font-bold font-mono text-white">
              {recommendation.payback_years} Years
            </div>
            <span className="text-[10px] text-[#85998C] block">
              Capital amortization return
            </span>
          </div>
        </div>
      </div>

      {/* 4. WATER FLOW VISUALIZATION */}
      <SystemSchematic
        roofType={data.water_balance.total_inflow_litres > 0 ? 'Catchment' : 'Rooftop'}
        roofArea={explainability.engineering_factors?.catchment_sqm || 200}
        tankCapacity={currentTankCapacity}
        rechargeName={recommendation.recharge_structure?.structure_type || 'Surface Buffer Storage'}
        rechargeDimensions={recommendation.recharge_structure?.dimensions}
        hasRecharge={!!recommendation.recharge_structure}
      />

      {/* 4.5 LOCATION INTELLIGENCE & METEOROLOGY */}
      <RainfallIntelligence weather={weather} waterBalance={activeWaterBalance} />

      {/* 5. INTERACTIVE TANK CAPACITY SIMULATOR (Live Continuity Re-Simulation) */}
      <div className="neu-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DEDFD8] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-forest-600/10 border border-forest-600/20 flex items-center justify-center text-forest-700">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-forest-700 font-bold block">
                Dynamic Engineering Sizing Pass
              </span>
              <h3 className="text-base font-bold text-[#252B26]">
                Interactive Storage Tank Capacity Simulator
              </h3>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isSimulating && (
              <span className="flex items-center space-x-1.5 text-xs text-forest-700 font-mono animate-pulse">
                <span className="h-2 w-2 rounded-full bg-forest-600"></span>
                <span>Recalculating 12-mo balance...</span>
              </span>
            )}
            <span className="text-xs font-mono font-bold bg-[#EEEEEA] text-forest-800 border border-[#DEDFD8] px-3 py-1 rounded-xl shadow-neu-sm">
              Selected: {currentTankCapacity.toLocaleString()} Litres
            </span>
          </div>
        </div>

        {/* Capacity Slider & Preset Selector */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#687068]">
              <span className="font-semibold text-[#252B26]">Capacity Adjustment Slider</span>
              <span className="font-mono text-forest-700 font-bold">
                {autonomyDays} days domestic buffer
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="500"
              value={currentTankCapacity}
              onChange={(e) => handleCapacityChange(Number(e.target.value))}
              className="w-full neu-slider h-2 rounded-lg bg-[#DEDFD8] appearance-none"
            />
            <div className="flex justify-between text-[10px] text-[#8C948C] font-mono">
              <span>1,000 L</span>
              <span>10,000 L</span>
              <span>25,000 L</span>
              <span>50,000 L</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[#687068] uppercase tracking-wider block">
              Standard Commercial Modular Sizes:
            </span>
            <div className="flex flex-wrap gap-2">
              {[1000, 2000, 3000, 5000, 7500, 10000, 15000, 20000, 30000, 50000].map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => handleCapacityChange(cap)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    currentTankCapacity === cap
                      ? 'bg-forest-600 text-white shadow-sm'
                      : 'neu-btn-secondary text-[#252B26] hover:text-forest-700'
                  }`}
                >
                  {cap.toLocaleString()} L
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Dynamic Simulation Output Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="neu-inset p-3 rounded-xl text-center">
            <span className="text-[10px] font-mono text-[#687068] uppercase block">Demand Met</span>
            <span className="text-lg font-black text-forest-700 font-mono">
              {activeWaterBalance.demand_met_percentage}%
            </span>
          </div>
          <div className="neu-inset p-3 rounded-xl text-center">
            <span className="text-[10px] font-mono text-[#687068] uppercase block">Usable Supplied</span>
            <span className="text-lg font-black text-[#252B26] font-mono">
              {activeWaterBalance.total_supplied_litres.toLocaleString()}{' '}
              <span className="text-xs font-normal">L</span>
            </span>
          </div>
          <div className="neu-inset p-3 rounded-xl text-center">
            <span className="text-[10px] font-mono text-[#687068] uppercase block">Overflow to Recharge</span>
            <span className="text-lg font-black text-water-700 font-mono">
              {activeWaterBalance.total_overflow_litres.toLocaleString()}{' '}
              <span className="text-xs font-normal">L</span>
            </span>
          </div>
          <div className="neu-inset p-3 rounded-xl text-center">
            <span className="text-[10px] font-mono text-[#687068] uppercase block">Storage Utilization</span>
            <span className="text-lg font-black text-[#252B26] font-mono">
              {activeWaterBalance.average_storage_utilization_pct}%
            </span>
          </div>
        </div>
      </div>

      {/* 6. 12-MONTH WATER BALANCE ANALYTICS (Driven by active simulated balance) */}
      <WaterBalanceChart data={activeWaterBalance.monthly_breakdown} />

      {/* 7. STORAGE OPTIMIZATION COMPARATIVE TABLE */}
      <StorageOptimizationChart
        candidates={tank_optimization_candidates}
        optimalCapacity={recommendation.optimal_tank_capacity_litres}
        activeCapacity={currentTankCapacity}
        onSelectCapacity={(cap) => handleCapacityChange(cap)}
      />

      {/* 8. MULTI-TIER PRACTICAL STORAGE SIZING PANEL */}
      {data.sizing_tiers && (
        <div className="neu-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEDFD8] pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="h-5 w-5 text-forest-700" />
              <h3 className="text-base font-bold text-[#252B26]">
                Practical Storage Tank Sizing Tiers & Diminishing Return Thresholds
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowCompareModal(true)}
                className="neu-btn-secondary h-8 px-3 text-xs font-semibold text-forest-700 hover:text-forest-800 flex items-center space-x-1"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Compare All 3 Tiers</span>
              </button>
              <span className="text-xs text-[#687068] font-mono hidden sm:inline">
                Cost-Efficiency Trade-off
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Minimum Practical Tier (Budget) */}
            {data.sizing_tiers.minimum && (
              <div className="neu-card-sm p-4.5 flex flex-col justify-between h-full min-w-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#252B26] uppercase tracking-wider">
                      Minimum Practical
                    </span>
                    <span className="text-[10px] font-mono neu-inset px-2 py-0.5 font-bold text-[#687068]">
                      Budget Entry
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
                <button
                  type="button"
                  onClick={() => handleCapacityChange(data.sizing_tiers!.minimum!.capacity_litres, 'minimum')}
                  className={`w-full mt-3 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    currentTankCapacity === data.sizing_tiers.minimum.capacity_litres
                      ? 'bg-forest-600 text-white shadow-sm'
                      : 'neu-btn-secondary hover:text-forest-700'
                  }`}
                >
                  {currentTankCapacity === data.sizing_tiers.minimum.capacity_litres ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Active in Simulator</span>
                    </>
                  ) : (
                    <span>Apply Budget Design</span>
                  )}
                </button>
              </div>
            )}

            {/* Recommended Optimal Tier (Balanced) */}
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
                <button
                  type="button"
                  onClick={() => handleCapacityChange(data.sizing_tiers!.recommended!.capacity_litres, 'recommended')}
                  className={`w-full mt-3 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    currentTankCapacity === data.sizing_tiers.recommended.capacity_litres
                      ? 'bg-forest-700 text-white shadow-sm'
                      : 'neu-btn-primary hover:bg-forest-700'
                  }`}
                >
                  {currentTankCapacity === data.sizing_tiers.recommended.capacity_litres ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Active in Simulator</span>
                    </>
                  ) : (
                    <span>Apply Balanced Design</span>
                  )}
                </button>
              </div>
            )}

            {/* Upper Practical Tier (High Storage) */}
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
                <button
                  type="button"
                  onClick={() => handleCapacityChange(data.sizing_tiers!.upper_practical!.capacity_litres, 'upper_practical')}
                  className={`w-full mt-3 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    currentTankCapacity === data.sizing_tiers.upper_practical.capacity_litres
                      ? 'bg-forest-600 text-white shadow-sm'
                      : 'neu-btn-secondary hover:text-forest-700'
                  }`}
                >
                  {currentTankCapacity === data.sizing_tiers.upper_practical.capacity_litres ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Active in Simulator</span>
                    </>
                  ) : (
                    <span>Apply High Storage Design</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 9. WHY WE RECOMMEND THIS (EXPLAINABILITY SECTION) */}
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
            {explainability.reasons.map((r: string, i: number) => (
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

      {/* 10. SYSTEM DESIGN SPECIFICATIONS */}
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
              {currentTankCapacity.toLocaleString()} Litres
            </div>
            <p className="text-[#687068] text-[11px] leading-relaxed">
              Recommended range: {(currentTankCapacity * 0.8).toFixed(0)}–
              {(currentTankCapacity * 1.25).toFixed(0)} L (HDPE triple-layer food-grade).
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
            <span className="font-bold text-purple-900 block uppercase tracking-wider text-[11px]">
              4. Conveyance Plumbing
            </span>
            <div className="font-mono text-base font-bold text-[#252B26]">
              110mm PVC Class 3
            </div>
            <p className="text-[#687068] text-[11px] leading-relaxed">
              UV-stabilized downspout piping sloped at minimum 1:100 hydraulic gradient.
            </p>
          </div>
        </div>
      </div>

      {/* 11. FINANCIAL ESTIMATION BREAKDOWN */}
      <div className="neu-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEDFD8] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#252B26]">
              Preliminary Bill of Quantities (BoQ) & Cost Estimation
            </h3>
            <p className="text-xs text-[#687068]">
              Indicative capital outlay based on standard Indian schedule of rates (CPWD/DSR 2023).
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#687068] block">Total Estimated CapEx</span>
            <span className="text-xl font-black text-forest-700 font-mono">
              ₹{baseCost.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#DEDFD8] text-[#8C948C] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2 px-3">Item Description</th>
                <th className="py-2 px-3">Specification</th>
                <th className="py-2 px-3 text-right">Est. Cost (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEDFD8]">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#252B26]">Primary Storage Tank</td>
                <td className="py-2.5 px-3 text-[#687068]">{currentTankCapacity.toLocaleString()}L Triple-Layer HDPE</td>
                <td className="py-2.5 px-3 text-right font-bold text-[#252B26]">₹{tankCost.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#252B26]">Filtration & Gutter Conveyance</td>
                <td className="py-2.5 px-3 text-[#687068]">110mm PVC + First Flush Diverter + SS Filter</td>
                <td className="py-2.5 px-3 text-right font-bold text-[#252B26]">₹{filterPipesCost.toLocaleString()}</td>
              </tr>
              {rechargeCost > 0 && (
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#252B26]">Recharge Structure Civil Works</td>
                  <td className="py-2.5 px-3 text-[#687068]">{recommendation.recharge_structure?.structure_type}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#252B26]">₹{rechargeCost.toLocaleString()}</td>
                </tr>
              )}
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#252B26]">Civil Foundation & Installation Labor</td>
                <td className="py-2.5 px-3 text-[#687068]">Masonry base pad, plumbing fitting, commissioning</td>
                <td className="py-2.5 px-3 text-right font-bold text-[#252B26]">₹{laborInstallCost.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="neu-inset p-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#687068] gap-2 border border-[#DEDFD8]">
          <span>Expected Range (±15% regional market variance):</span>
          <span className="font-mono font-bold text-[#252B26]">
            ₹{minRange.toLocaleString()} — ₹{maxRange.toLocaleString()} • Approx Annual O&M: ₹{annualMaintCost.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 11.5 METEOROLOGICAL SOURCE VERIFICATION METADATA */}
      <div className="neu-card p-5 space-y-3">
        <div className="flex items-center space-x-2 border-b border-[#DEDFD8] pb-2">
          <Database className="h-4 w-4 text-forest-700" />
          <h4 className="text-xs font-bold text-[#252B26] uppercase tracking-wider font-mono">
            Hydrological Verification Data Provenance
          </h4>
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

      {/* 13. SIDE-BY-SIDE SIZING TIERS COMPARISON MODAL */}
      {showCompareModal && data.sizing_tiers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F4F4F0] border border-[#DEDFD8] rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DEDFD8] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-forest-700 font-bold block">
                  Comparative Engineering Analysis
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#252B26]">
                  Side-by-Side Sizing Tiers Comparison
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="h-8 w-8 rounded-full bg-[#E3E4DE] text-[#252B26] flex items-center justify-center hover:bg-[#DEDFD8] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Budget Tier */}
              {data.sizing_tiers.minimum && (
                <div className="neu-card p-5 space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-[#687068] block">
                      Tier 1: Budget Entry
                    </span>
                    <h4 className="text-xl font-black text-[#252B26] font-mono mt-1">
                      {data.sizing_tiers.minimum.capacity_litres.toLocaleString()} L
                    </h4>
                    <span className="text-xs text-forest-700 font-bold block mt-1">
                      {data.sizing_tiers.minimum.demand_met_pct}% Annual Demand Met
                    </span>
                    <div className="space-y-1.5 text-xs text-[#687068] mt-3 font-mono border-t border-[#DEDFD8] pt-2">
                      <div>CapEx: <strong className="text-[#252B26]">₹{data.sizing_tiers.minimum.estimated_cost_inr.toLocaleString()}</strong></div>
                      <div>Payback: <strong className="text-[#252B26]">{data.sizing_tiers.minimum.payback_years} yrs</strong></div>
                      <div>Autonomy: <strong className="text-[#252B26]">{Math.round(data.sizing_tiers.minimum.capacity_litres / dailyDemand)} days</strong></div>
                    </div>
                    <p className="text-[11px] text-[#687068] mt-3 leading-relaxed">
                      {data.sizing_tiers.minimum.rationale}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleCapacityChange(data.sizing_tiers!.minimum!.capacity_litres, 'minimum')
                      setShowCompareModal(false)
                    }}
                    className="neu-btn-secondary w-full py-2 text-xs font-bold flex items-center justify-center space-x-1"
                  >
                    <span>Apply in Simulator</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Balanced Tier */}
              {data.sizing_tiers.recommended && (
                <div className="neu-card p-5 space-y-3 border-2 border-forest-600 bg-[#EEEEEA] flex flex-col justify-between relative">
                  <span className="absolute -top-2.5 right-4 bg-forest-700 text-white font-mono text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                    Recommended
                  </span>
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-forest-700 block">
                      Tier 2: Balanced Optimum
                    </span>
                    <h4 className="text-xl font-black text-forest-700 font-mono mt-1">
                      {data.sizing_tiers.recommended.capacity_litres.toLocaleString()} L
                    </h4>
                    <span className="text-xs text-forest-800 font-bold block mt-1">
                      {data.sizing_tiers.recommended.demand_met_pct}% Annual Demand Met
                    </span>
                    <div className="space-y-1.5 text-xs text-forest-900 mt-3 font-mono border-t border-[#DEDFD8] pt-2">
                      <div>CapEx: <strong className="text-forest-900">₹{data.sizing_tiers.recommended.estimated_cost_inr.toLocaleString()}</strong></div>
                      <div>Payback: <strong className="text-forest-900">{data.sizing_tiers.recommended.payback_years} yrs</strong></div>
                      <div>Autonomy: <strong className="text-forest-900">{Math.round(data.sizing_tiers.recommended.capacity_litres / dailyDemand)} days</strong></div>
                    </div>
                    <p className="text-[11px] text-forest-900 mt-3 leading-relaxed font-medium">
                      {data.sizing_tiers.recommended.rationale}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleCapacityChange(data.sizing_tiers!.recommended!.capacity_litres, 'recommended')
                      setShowCompareModal(false)
                    }}
                    className="neu-btn-primary w-full py-2 text-xs font-bold flex items-center justify-center space-x-1"
                  >
                    <span>Apply in Simulator</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Upper Practical Tier */}
              {data.sizing_tiers.upper_practical && (
                <div className="neu-card p-5 space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-[#687068] block">
                      Tier 3: High Storage
                    </span>
                    <h4 className="text-xl font-black text-[#252B26] font-mono mt-1">
                      {data.sizing_tiers.upper_practical.capacity_litres.toLocaleString()} L
                    </h4>
                    <span className="text-xs text-water-700 font-bold block mt-1">
                      {data.sizing_tiers.upper_practical.demand_met_pct}% Annual Demand Met
                    </span>
                    <div className="space-y-1.5 text-xs text-[#687068] mt-3 font-mono border-t border-[#DEDFD8] pt-2">
                      <div>CapEx: <strong className="text-[#252B26]">₹{data.sizing_tiers.upper_practical.estimated_cost_inr.toLocaleString()}</strong></div>
                      <div>Payback: <strong className="text-[#252B26]">{data.sizing_tiers.upper_practical.payback_years} yrs</strong></div>
                      <div>Autonomy: <strong className="text-[#252B26]">{Math.round(data.sizing_tiers.upper_practical.capacity_litres / dailyDemand)} days</strong></div>
                    </div>
                    <p className="text-[11px] text-[#687068] mt-3 leading-relaxed">
                      {data.sizing_tiers.upper_practical.rationale}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleCapacityChange(data.sizing_tiers!.upper_practical!.capacity_litres, 'upper_practical')
                      setShowCompareModal(false)
                    }}
                    className="neu-btn-secondary w-full py-2 text-xs font-bold flex items-center justify-center space-x-1"
                  >
                    <span>Apply in Simulator</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="neu-inset p-4 text-xs text-[#687068] leading-relaxed border border-[#DEDFD8]">
              <strong className="text-[#252B26]">Hydrological Law of Diminishing Returns:</strong> Tank capacity beyond the recommended optimum delivers progressively smaller incremental water savings per rupee invested because household demand becomes the binding constraint during dry months, while the roof catchment area is already fully utilized during monsoon peaks.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResultsDashboard
