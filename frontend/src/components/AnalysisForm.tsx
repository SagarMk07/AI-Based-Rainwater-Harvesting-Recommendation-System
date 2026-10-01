import React, { useState, useEffect } from 'react'
import {
  MapPin,
  Home,
  Users,
  Layers,
  Sparkles,
  Calculator,
} from 'lucide-react'
import type { AnalysisFormData, CityRainfallProfile } from '../types/analysis'
import { analysisService } from '../services/analysisService'

interface Props {
  onSubmit: (data: AnalysisFormData) => void
  loading: boolean
}

const POPULAR_CITIES = [
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Chennai',
  'Hyderabad',
  'Pune',
  'Jaipur',
  'Kolkata',
  'Kochi',
  'Ahmedabad',
]

const ROOF_TYPES = [
  { id: 'rcc', name: 'RCC (Flat Concrete)', coeff: 0.85 },
  { id: 'metal_sheet', name: 'Galvanized Metal Sheet', coeff: 0.90 },
  { id: 'clay_tiles', name: 'Clay / Terracotta Tiles', coeff: 0.80 },
  { id: 'asbestos', name: 'Corrugated Asbestos / Cement', coeff: 0.80 },
  { id: 'paved_tiles', name: 'Paved / Concrete Pavers', coeff: 0.70 },
]

const SOIL_TYPES = [
  { id: 'sandy', name: 'Sandy (35 mm/hr percolation · High)', desc: 'Excellent for direct infiltration' },
  { id: 'loamy', name: 'Loamy (18 mm/hr percolation · Balanced)', desc: 'Optimal balanced drainage' },
  { id: 'silty', name: 'Silty (7 mm/hr percolation · Slow)', desc: 'Requires extended trench surface' },
  { id: 'clay', name: 'Clay (2 mm/hr percolation · Poor)', desc: 'Low percolation; risks waterlogging' },
  { id: 'rocky', name: 'Rocky / Hard Strata (0.5 mm/hr)', desc: 'Impermeable; requires deep shaft' },
]

export const AnalysisForm: React.FC<Props> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState<AnalysisFormData>({
    city: 'Bengaluru',
    annual_rainfall_mm: 900,
    roof_area_sqm: 200,
    roof_type: 'rcc',
    occupants: 5,
    daily_demand_litres: 600,
    soil_type: 'loamy',
    open_area_sqm: 50,
    has_existing_borewell: false,
    budget_inr: 100000,
    filter_efficiency: 0.90,
  })

  const [weatherInfo, setWeatherInfo] = useState<CityRainfallProfile | null>(null)

  // Fetch weather profile whenever city changes
  useEffect(() => {
    let isMounted = true
    const fetchWeather = async () => {
      try {
        const info = await analysisService.getCityWeather(formData.city)
        if (isMounted) {
          setWeatherInfo(info)
          setFormData((prev) => ({
            ...prev,
            annual_rainfall_mm: info.annual_rainfall_mm,
          }))
        }
      } catch {
        // Keep current state
      }
    }
    fetchWeather()
    return () => {
      isMounted = false
    }
  }, [formData.city])

  // Real-time instantaneous theoretical preview
  const currentCoeff = ROOF_TYPES.find((r) => r.id === formData.roof_type)?.coeff || 0.85
  const instantGrossHarvest = Math.round(formData.annual_rainfall_mm * formData.roof_area_sqm * currentCoeff)
  const instantAnnualDemand = Math.round(formData.daily_demand_litres * 365)

  // Handlers for benchmark presets
  const applyPreset = (preset: 'A' | 'B' | 'C' | 'D') => {
    if (preset === 'A') {
      setFormData({
        city: 'Bengaluru',
        annual_rainfall_mm: 900,
        roof_area_sqm: 200,
        roof_type: 'rcc',
        occupants: 5,
        daily_demand_litres: 600,
        soil_type: 'loamy',
        open_area_sqm: 50,
        has_existing_borewell: false,
        budget_inr: 100000,
        filter_efficiency: 0.90,
      })
    } else if (preset === 'B') {
      setFormData({
        city: 'Mumbai',
        annual_rainfall_mm: 1800,
        roof_area_sqm: 500,
        roof_type: 'rcc',
        occupants: 12,
        daily_demand_litres: 1500,
        soil_type: 'sandy',
        open_area_sqm: 100,
        has_existing_borewell: true,
        budget_inr: 250000,
        filter_efficiency: 0.90,
      })
    } else if (preset === 'C') {
      setFormData({
        city: 'Kolkata',
        annual_rainfall_mm: 1600,
        roof_area_sqm: 200,
        roof_type: 'rcc',
        occupants: 4,
        daily_demand_litres: 500,
        soil_type: 'clay',
        open_area_sqm: 15,
        has_existing_borewell: false,
        budget_inr: 120000,
        filter_efficiency: 0.90,
      })
    } else if (preset === 'D') {
      setFormData({
        city: 'Jaipur',
        annual_rainfall_mm: 350,
        roof_area_sqm: 50,
        roof_type: 'rcc',
        occupants: 2,
        daily_demand_litres: 200,
        soil_type: 'loamy',
        open_area_sqm: 25,
        has_existing_borewell: false,
        budget_inr: 35000,
        filter_efficiency: 0.90,
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Verification Benchmark Presets */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>Load Quick Verification Presets</span>
          </div>
          <span className="text-[11px] text-slate-500">Populates exact test scenarios</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <button
            type="button"
            onClick={() => applyPreset('A')}
            className="p-2 text-left rounded-lg border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/50 transition-all font-medium text-slate-700 hover:text-emerald-900"
          >
            <span className="font-bold block text-emerald-700">Scenario A</span>
            <span className="text-[10px] text-slate-500 block truncate">Residential 200m² · 900mm</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('B')}
            className="p-2 text-left rounded-lg border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/50 transition-all font-medium text-slate-700 hover:text-emerald-900"
          >
            <span className="font-bold block text-sky-700">Scenario B</span>
            <span className="text-[10px] text-slate-500 block truncate">Large Roof 500m² · 1800mm</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('C')}
            className="p-2 text-left rounded-lg border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/50 transition-all font-medium text-slate-700 hover:text-emerald-900"
          >
            <span className="font-bold block text-amber-700">Scenario C</span>
            <span className="text-[10px] text-slate-500 block truncate">Poor Recharge (Clay Soil)</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('D')}
            className="p-2 text-left rounded-lg border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/50 transition-all font-medium text-slate-700 hover:text-emerald-900"
          >
            <span className="font-bold block text-purple-700">Scenario D</span>
            <span className="text-[10px] text-slate-500 block truncate">Small Roof 50m² · 350mm</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Location & Climate */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2.5">
            <MapPin className="h-4 w-4 text-sky-600" />
            <span>1. Location & Climate Profile</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select City / Region</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {POPULAR_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Annual Rainfall (mm)</label>
                <span className="font-mono text-emerald-700 font-bold">{formData.annual_rainfall_mm} mm</span>
              </div>
              <input
                type="number"
                min="50"
                max="5000"
                step="10"
                value={formData.annual_rainfall_mm}
                onChange={(e) =>
                  setFormData({ ...formData, annual_rainfall_mm: Math.max(0, Number(e.target.value)) })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Weather status telemetry disclosure */}
            {weatherInfo && (
              <div className="rounded-lg bg-sky-50 border border-sky-100 p-2.5 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-sky-900 font-medium">
                  <span>Data Source: {weatherInfo.weather_source}</span>
                  {weatherInfo.is_fallback && (
                    <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-mono">
                      Offline Normal Active
                    </span>
                  )}
                </div>
                {weatherInfo.warning_notice && (
                  <p className="text-slate-600 text-[10px] leading-relaxed">{weatherInfo.warning_notice}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Property & Catchment */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2.5">
            <Home className="h-4 w-4 text-emerald-600" />
            <span>2. Catchment Area & Surface</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Catchment Roof Area (m²)</label>
                <span className="font-mono text-emerald-700 font-bold">{formData.roof_area_sqm} m²</span>
              </div>
              <input
                type="number"
                min="10"
                max="10000"
                value={formData.roof_area_sqm}
                onChange={(e) =>
                  setFormData({ ...formData, roof_area_sqm: Math.max(1, Number(e.target.value)) })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Roof Surface Material</label>
              <select
                value={formData.roof_type}
                onChange={(e) => setFormData({ ...formData, roof_type: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {ROOF_TYPES.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name} (Runoff Coeff: {rt.coeff})
                  </option>
                ))}
              </select>
            </div>

            {/* Instant Physical Runoff Calculation Display */}
            <div className="rounded-lg bg-emerald-50/70 border border-emerald-200 p-2.5 text-[11px] flex items-center justify-between">
              <div>
                <span className="text-emerald-900 font-semibold block">Theoretical Gross Harvest</span>
                <span className="text-slate-500 text-[10px] font-mono">
                  {formData.annual_rainfall_mm} mm × {formData.roof_area_sqm} m² × {currentCoeff}
                </span>
              </div>
              <span className="text-sm font-bold text-emerald-700 font-mono">
                {instantGrossHarvest.toLocaleString()} L/yr
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Water Demand & Inhabitants */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2.5">
            <Users className="h-4 w-4 text-indigo-600" />
            <span>3. Water Usage & Inhabitants</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Occupants</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.occupants}
                  onChange={(e) =>
                    setFormData({ ...formData, occupants: Math.max(1, Number(e.target.value)) })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Daily Demand (L/day)</label>
                <input
                  type="number"
                  min="50"
                  max="50000"
                  step="50"
                  value={formData.daily_demand_litres}
                  onChange={(e) =>
                    setFormData({ ...formData, daily_demand_litres: Math.max(1, Number(e.target.value)) })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Demand calculation display */}
            <div className="rounded-lg bg-indigo-50/70 border border-indigo-200 p-2.5 text-[11px] flex items-center justify-between">
              <div>
                <span className="text-indigo-900 font-semibold block">Total Annual Water Demand</span>
                <span className="text-slate-500 text-[10px] font-mono">
                  {formData.daily_demand_litres} L/day × 365 days
                </span>
              </div>
              <span className="text-sm font-bold text-indigo-700 font-mono">
                {instantAnnualDemand.toLocaleString()} L/yr
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Soil & Ground Conditions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2.5">
            <Layers className="h-4 w-4 text-amber-600" />
            <span>4. Soil & Hydrogeology Conditions</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Sub-surface Soil Type</label>
              <select
                value={formData.soil_type}
                onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SOIL_TYPES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Available Open Area (m²)</label>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={formData.open_area_sqm}
                  onChange={(e) =>
                    setFormData({ ...formData, open_area_sqm: Math.max(0, Number(e.target.value)) })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Capital Budget (₹)</label>
                <input
                  type="number"
                  min="5000"
                  max="1000000"
                  step="5000"
                  value={formData.budget_inr}
                  onChange={(e) =>
                    setFormData({ ...formData, budget_inr: Math.max(0, Number(e.target.value)) })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="borewellCheck"
                checked={formData.has_existing_borewell}
                onChange={(e) => setFormData({ ...formData, has_existing_borewell: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="borewellCheck" className="text-slate-700 select-none">
                Site has an existing borewell (available for filtered aquifer injection)
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Simulating 12-Month Water Balance & Optimizing Storage...</span>
            </>
          ) : (
            <>
              <Calculator className="h-5 w-5" />
              <span>Run Engineering Intelligence & Optimization</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
