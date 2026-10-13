import React, { useState, useEffect } from 'react'
import {
  MapPin,
  Users,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Navigation,
  Loader2,
  Radio,
} from 'lucide-react'
import type { AnalysisFormData, CityRainfallProfile } from '../types/analysis'
import { analysisService } from '../services/analysisService'
import { StepIndicator, type Step } from './ui/StepIndicator'
import { InfoTooltip } from './ui/InfoTooltip'

interface Props {
  onSubmit: (data: AnalysisFormData) => void
  loading: boolean
}

const WIZARD_STEPS: Step[] = [
  { id: 1, title: 'Location & Climate', shortTitle: 'Location' },
  { id: 2, title: 'Catchment Property', shortTitle: 'Property' },
  { id: 3, title: 'Water Demand', shortTitle: 'Demand' },
  { id: 4, title: 'Soil & Infiltration', shortTitle: 'Ground' },
  { id: 5, title: 'Budget & Review', shortTitle: 'Review' },
]

const POPULAR_CITIES = [
  { name: 'Bengaluru', state: 'Karnataka', rain: 924, lat: 12.9716, lon: 77.5946 },
  { name: 'Mumbai', state: 'Maharashtra', rain: 2213, lat: 18.9220, lon: 72.8347 },
  { name: 'Delhi', state: 'NCR', rain: 797, lat: 28.6139, lon: 77.2090 },
  { name: 'Chennai', state: 'Tamil Nadu', rain: 1382, lat: 13.0827, lon: 80.2707 },
  { name: 'Hyderabad', state: 'Telangana', rain: 812, lat: 17.3850, lon: 78.4867 },
  { name: 'Pune', state: 'Maharashtra', rain: 741, lat: 18.5204, lon: 73.8567 },
  { name: 'Jaipur', state: 'Rajasthan', rain: 602, lat: 26.9124, lon: 75.7873 },
  { name: 'Kolkata', state: 'West Bengal', rain: 1735, lat: 22.5726, lon: 88.3639 },
  { name: 'Kochi', state: 'Kerala', rain: 3014, lat: 9.9312, lon: 76.2673 },
  { name: 'Ahmedabad', state: 'Gujarat', rain: 782, lat: 23.0225, lon: 72.5714 },
]

const ROOF_TYPES = [
  {
    id: 'rcc',
    name: 'RCC (Flat Concrete)',
    coeff: 0.85,
    desc: 'Standard reinforced concrete slab with 85% runoff capture efficiency.',
  },
  {
    id: 'metal_sheet',
    name: 'Galvanized Metal Sheet',
    coeff: 0.90,
    desc: 'Smooth corrugated metal surface offering high 90% water yield.',
  },
  {
    id: 'clay_tiles',
    name: 'Clay / Terracotta Tiles',
    coeff: 0.80,
    desc: 'Traditional pitched roof tiles with moderate surface retention.',
  },
  {
    id: 'asbestos',
    name: 'Corrugated Cement / Asbestos',
    coeff: 0.80,
    desc: 'Common industrial or residential sheet with 80% collection factor.',
  },
  {
    id: 'paved_tiles',
    name: 'Paved / Paver Blocks',
    coeff: 0.70,
    desc: 'Permeable paved courtyard surface with 70% runoff factor.',
  },
]

const SOIL_TYPES = [
  {
    id: 'sandy',
    name: 'Sandy Soil',
    rate: '35 mm/hr (Fast)',
    desc: 'High percolation; ideal for shallow recharge pits or recharge trenches.',
  },
  {
    id: 'loamy',
    name: 'Loamy Soil',
    rate: '18 mm/hr (Balanced)',
    desc: 'Optimal balance of percolation and retention; standard pit design.',
  },
  {
    id: 'silty',
    name: 'Silty Soil',
    rate: '7 mm/hr (Moderate)',
    desc: 'Slower drainage; requires wider contact trenches or filtration media.',
  },
  {
    id: 'clay',
    name: 'Clay Soil',
    rate: '2 mm/hr (Poor)',
    desc: 'Very low percolation; risks waterlogging. Dedicated storage prioritized.',
  },
  {
    id: 'rocky',
    name: 'Rocky / Hard Strata',
    rate: '0.5 mm/hr (Impermeable)',
    desc: 'Hard bedrock; requires deep recharge borewell shaft or surface tank.',
  },
]

export const AnalysisForm: React.FC<Props> = ({ onSubmit, loading }) => {
  const [currentStep, setCurrentStep] = useState(1)

  const [formData, setFormData] = useState<AnalysisFormData>({
    city: 'Bengaluru',
    latitude: 12.9716,
    longitude: 77.5946,
    annual_rainfall_mm: 924,
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
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [rainfallSource, setRainfallSource] = useState<'preset' | 'manual' | 'telemetry'>('telemetry')
  const [activePreset, setActivePreset] = useState<'A' | 'B' | 'C' | 'D' | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [geolocationLoading, setGeolocationLoading] = useState(false)
  const [geolocationError, setGeolocationError] = useState<string | null>(null)

  // Fetch weather profile whenever city or coordinates change
  useEffect(() => {
    let isMounted = true
    setWeatherLoading(true)
    analysisService
      .getCityWeather(formData.city, formData.latitude, formData.longitude)
      .then((info) => {
        if (isMounted) {
          setWeatherInfo(info)
          // Only overwrite annual rainfall if not explicitly locked by a preset or manual override
          setFormData((prev) => {
            if (rainfallSource === 'telemetry') {
              return {
                ...prev,
                annual_rainfall_mm: info.annual_rainfall_mm,
              }
            }
            return prev
          })
          setWeatherLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) setWeatherLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [formData.city, formData.latitude, formData.longitude, rainfallSource])

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeolocationError('Geolocation is not supported by your browser.')
      return
    }
    setGeolocationLoading(true)
    setGeolocationError(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        try {
          const rev = await analysisService.reverseGeocode(lat, lon)
          const resolvedCity = rev?.city || `GPS (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`
          const weather = await analysisService.getCityWeather(resolvedCity, lat, lon)
          setWeatherInfo(weather)
          setActivePreset(null)
          setRainfallSource('telemetry')
          setFormData((prev) => ({
            ...prev,
            city: resolvedCity,
            latitude: lat,
            longitude: lon,
            annual_rainfall_mm: weather.annual_rainfall_mm,
          }))
        } catch {
          setGeolocationError('Failed to synchronize environmental records for acquired coordinates.')
        } finally {
          setGeolocationLoading(false)
        }
      },
      (err) => {
        setGeolocationLoading(false)
        if (err.code === err.PERMISSION_DENIED) {
          setGeolocationError('GPS location permission denied. Please choose a city or enter coordinates manually.')
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGeolocationError('Location position unavailable. Please choose a city manually.')
        } else if (err.code === err.TIMEOUT) {
          setGeolocationError('Location acquisition timed out. Please choose a city manually.')
        } else {
          setGeolocationError('Could not acquire current location. Please choose a city manually.')
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  // Instantaneous theoretical calculation preview
  const currentCoeff = ROOF_TYPES.find((r) => r.id === formData.roof_type)?.coeff || 0.85
  const instantGrossHarvest = Math.round(formData.annual_rainfall_mm * formData.roof_area_sqm * currentCoeff)
  const instantAnnualDemand = Math.round(formData.daily_demand_litres * 365)
  const potentialDemandCovered = Math.min(100, Math.round((instantGrossHarvest / (instantAnnualDemand || 1)) * 100))

  // Handlers for benchmark presets - updating documented fields and exact coordinates
  const applyPreset = (preset: 'A' | 'B' | 'C' | 'D') => {
    setActivePreset(preset)
    setRainfallSource('preset')
    if (preset === 'A') {
      setFormData({
        city: 'Bengaluru',
        latitude: 12.9716,
        longitude: 77.5946,
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
        latitude: 18.9220,
        longitude: 72.8347,
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
        latitude: 22.5726,
        longitude: 88.3639,
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
        latitude: 26.9124,
        longitude: 75.7873,
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
    setValidationError(null)
  }

  const validateStep = (step: number): boolean => {
    setValidationError(null)
    if (step === 1) {
      if (!formData.city.trim()) {
        setValidationError('Location field: Please enter or choose a property location.')
        return false
      }
      if (formData.annual_rainfall_mm <= 0) {
        setValidationError('Rainfall field: Annual rainfall must be greater than 0 mm.')
        return false
      }
    } else if (step === 2) {
      if (formData.roof_area_sqm <= 0) {
        setValidationError('Catchment Roof Area field: Catchment roof area must be greater than 0 m².')
        return false
      }
    } else if (step === 3) {
      if (formData.occupants < 1) {
        setValidationError('Building Occupants field: Number of occupants must be at least 1 person.')
        return false
      }
      if (formData.daily_demand_litres <= 0) {
        setValidationError('Daily Water Requirement field: Daily water demand must be greater than 0 Litres.')
        return false
      }
    } else if (step === 4) {
      if (formData.open_area_sqm < 0) {
        setValidationError('Open Ground Area field: Available unpaved open space cannot be negative.')
        return false
      }
    } else if (step === 5) {
      if (formData.budget_inr !== undefined && formData.budget_inr !== null && formData.budget_inr < 0) {
        setValidationError('Capital Budget field: Maximum capital budget cannot be negative.')
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(WIZARD_STEPS.length, prev + 1))
      window.scrollTo({ top: 350, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    setValidationError(null)
    setCurrentStep((prev) => Math.max(1, prev - 1))
    window.scrollTo({ top: 350, behavior: 'smooth' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep(currentStep)) {
      onSubmit(formData)
    }
  }

  return (
    <div className="neu-card p-5 sm:p-8 space-y-8">
      {/* Wizard Header & Stepper */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DEDFD8] pb-4 shadow-[0_1px_0_rgba(108,126,114,0.12)]">
          <div>
            <span className="text-xs uppercase font-mono font-bold text-forest-700 tracking-wider">
              Step {currentStep} of {WIZARD_STEPS.length}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#252B26] mt-0.5">
              {WIZARD_STEPS[currentStep - 1]?.title}
            </h2>
            <p className="text-xs text-[#687068] mt-1">
              {currentStep === 1 && 'Select location to automatically retrieve IMD climatological rainfall records.'}
              {currentStep === 2 && 'Specify rooftop catchment dimensions and construction material for runoff estimation.'}
              {currentStep === 3 && 'Define building occupancy and daily water consumption without double counting.'}
              {currentStep === 4 && 'Determine sub-surface soil percolation rate and open space for aquifer recharge.'}
              {currentStep === 5 && 'Configure investment budget and review simulation inputs before launching.'}
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto neu-inset p-1.5 rounded-xl border border-[#DEDFD8]">
            <span className="text-[11px] font-bold text-[#687068] px-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-forest-600" /> Presets:
            </span>
            {(['A', 'B', 'C', 'D'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => applyPreset(p)}
                className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg transition-all ${
                  activePreset === p
                    ? 'bg-forest-600 text-white shadow-sm'
                    : 'neu-raised-sm text-[#252B26] hover:bg-white'
                }`}
                title={`Load benchmark test scenario ${p}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <StepIndicator
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          onStepClick={(id) => {
            if (validateStep(currentStep)) setCurrentStep(id)
          }}
        />
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="rounded-xl border border-rose-300 bg-rose-50/90 p-3.5 text-xs text-rose-900 flex items-center space-x-2 animate-in fade-in shadow-neu-sm">
          <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
          <span className="font-semibold">{validationError}</span>
        </div>
      )}

      {/* Step Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: LOCATION & CLIMATE */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Geolocation Error Alert if any */}
            {geolocationError && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 flex items-start space-x-2 animate-in fade-in">
                <AlertCircle className="h-4 w-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold">Geolocation Notice:</span>
                  <p>{geolocationError}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-[#252B26] uppercase tracking-wider block">
                Select City or Geographic Station
                <InfoTooltip content="Uses Open-Meteo ERA5 real-world telemetry with 30-year IMD climatological normal fallback." />
              </label>

              {/* Use My Location Browser Geolocation Button */}
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={geolocationLoading}
                className="neu-btn-secondary px-3 py-1.5 text-xs font-bold space-x-1.5 text-forest-700 disabled:opacity-60"
              >
                {geolocationLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-forest-600" />
                    <span>Acquiring GPS Position...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="h-3.5 w-3.5 text-forest-600" />
                    <span>Use My Location (GPS)</span>
                  </>
                )}
              </button>
            </div>

            {/* Popular Cities Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setActivePreset(null)
                    setRainfallSource('telemetry')
                    setFormData({
                      ...formData,
                      city: c.name,
                      latitude: c.lat,
                      longitude: c.lon,
                      annual_rainfall_mm: c.rain,
                    })
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between h-full min-w-0 ${
                    formData.city.toLowerCase() === c.name.toLowerCase()
                      ? 'border-forest-600 bg-[#EEEEEA] text-forest-700 font-bold shadow-neu-inset-sm'
                      : 'border-transparent neu-raised-sm hover:shadow-neu text-[#252B26]'
                  }`}
                >
                  <span className="block text-xs font-bold truncate">{c.name}</span>
                  <span className="block text-[11px] text-[#687068] font-mono mt-0.5 truncate">
                    {c.rain} mm/yr
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Location & Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-[#252B26] mb-1.5 flex items-center min-h-[1.25rem]">
                  Location / City Name
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-[#8C948C]" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => {
                      setActivePreset(null)
                      setFormData({ ...formData, city: e.target.value })
                    }}
                    placeholder="Enter city or district name"
                    className="neu-input pl-9 pr-3"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#252B26] mb-1.5 flex items-center min-h-[1.25rem]">
                  Latitude (°N) & Longitude (°E)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Lat"
                    value={formData.latitude !== undefined && formData.latitude !== null ? formData.latitude : ''}
                    onChange={(e) => {
                      setActivePreset(null)
                      setFormData({
                        ...formData,
                        latitude: parseFloat(e.target.value) || 0,
                      })
                    }}
                    className="neu-input px-3 font-mono"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Lon"
                    value={formData.longitude !== undefined && formData.longitude !== null ? formData.longitude : ''}
                    onChange={(e) => {
                      setActivePreset(null)
                      setFormData({
                        ...formData,
                        longitude: parseFloat(e.target.value) || 0,
                      })
                    }}
                    className="neu-input px-3 font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 min-h-[1.25rem]">
                  <label className="block text-xs font-bold text-[#252B26]">
                    Annual Rainfall (mm)
                  </label>
                  {weatherLoading && (
                    <span className="text-[11px] text-sky-700 font-mono flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Syncing...
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.annual_rainfall_mm}
                    onChange={(e) => {
                      setActivePreset(null)
                      setRainfallSource('manual')
                      setFormData({
                        ...formData,
                        annual_rainfall_mm: parseFloat(e.target.value) || 0,
                      })
                    }}
                    min="1"
                    step="1"
                    className="neu-input px-3 pr-10 font-mono"
                  />
                  <span className="absolute right-3 top-3 text-xs text-[#8C948C] font-mono">
                    mm
                  </span>
                </div>
              </div>
            </div>

            {/* Weather Telemetry Source Card */}
            {weatherInfo && (
              <div className="p-4 rounded-2xl neu-inset border border-[#DEDFD8] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    {rainfallSource === 'preset' ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-300">
                        BENCHMARK PRESET {activePreset ? `(${activePreset})` : ''}
                      </span>
                    ) : rainfallSource === 'manual' ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300">
                        USER MANUAL SPECIFICATION
                      </span>
                    ) : weatherInfo.is_fallback ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        IMD 30-YEAR NORMAL FALLBACK
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                        <Radio className="h-2.5 w-2.5 text-emerald-600 animate-pulse" />
                        <span>LIVE ERA5 TELEMETRY</span>
                      </span>
                    )}
                    <span className="text-xs font-bold text-[#252B26]">
                      {weatherInfo.city} Station Environmental Records
                    </span>
                  </div>
                  <span className="font-mono font-bold text-forest-700 bg-[#EEEEEA] px-2.5 py-1 rounded-lg border border-forest-600/30 text-xs self-start sm:self-auto shadow-neu-sm">
                    {formData.annual_rainfall_mm} mm/year applied
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#687068] font-mono">
                  <span>
                    Source:{' '}
                    {rainfallSource === 'preset'
                      ? `Benchmark Scenario ${activePreset} parameters`
                      : rainfallSource === 'manual'
                      ? 'Manual user input'
                      : weatherInfo.weather_source.split(' ')[0]}
                  </span>
                  <span>Climatological Period: {weatherInfo.data_period || '30-Year Normal'}</span>
                  {weatherInfo.wettest_month && (
                    <span>Peak Month: <strong>{weatherInfo.wettest_month}</strong></span>
                  )}
                  {weatherInfo.rainy_days_count && (
                    <span>Rainy Days: <strong>{weatherInfo.rainy_days_count} d/yr</strong></span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: CATCHMENT PROPERTY */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#252B26] mb-1.5 flex items-center min-h-[1.25rem]">
                  Catchment Roof Area (m²)
                  <InfoTooltip content="Total flat projected footprint of the rooftop generating stormwater runoff." />
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.roof_area_sqm}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        roof_area_sqm: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="1"
                    step="5"
                    className="neu-input px-3 pr-10 font-mono"
                  />
                  <span className="absolute right-3 top-3 text-xs text-[#8C948C] font-mono">
                    m²
                  </span>
                </div>
                <span className="text-[11px] text-[#8C948C] mt-1 block">
                  ≈ {(formData.roof_area_sqm * 10.764).toFixed(0)} sq ft
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-[#252B26] mb-1.5 flex items-center min-h-[1.25rem]">
                  Filter Conveyance Efficiency
                  <InfoTooltip content="Standard 90% conveyance accounts for gutter overflow and first flush loss." />
                </label>
                <select
                  value={formData.filter_efficiency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      filter_efficiency: parseFloat(e.target.value),
                    })
                  }
                  className="neu-input px-3"
                >
                  <option value={0.95}>95% (High efficiency automated screen)</option>
                  <option value={0.90}>90% (Standard SS mesh filter + diverter)</option>
                  <option value={0.80}>80% (Basic mesh filter / older gutters)</option>
                </select>
              </div>
            </div>

            {/* Roof Material Radio Cards */}
            <div>
              <label className="text-xs font-bold text-[#252B26] uppercase tracking-wider block mb-2">
                Roof Construction Material & Runoff Factor
                <InfoTooltip content="Runoff coefficient (C) reflects the percentage of rainfall that drains as usable runoff." />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ROOF_TYPES.map((roof) => {
                  const isSelected = formData.roof_type === roof.id
                  return (
                    <div
                      key={roof.id}
                      onClick={() => setFormData({ ...formData, roof_type: roof.id })}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between h-full min-w-0 ${
                        isSelected
                          ? 'border-forest-600 bg-[#EEEEEA] text-forest-700 font-bold shadow-neu-inset'
                          : 'border-transparent neu-raised-sm hover:shadow-neu text-[#252B26]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#252B26]">{roof.name}</span>
                        <span className="text-xs font-mono font-bold text-forest-700 bg-[#EEEEEA] border border-forest-600/20 px-1.5 py-0.5 rounded shadow-neu-sm">
                          C = {roof.coeff}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#687068] leading-relaxed mt-1">{roof.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: WATER DEMAND */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#252B26] mb-1.5 flex items-center min-h-[1.25rem]">
                  Building Occupants / Residents
                  <InfoTooltip content="Number of full-time residents utilizing water on site." />
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3.5 h-4 w-4 text-[#8C948C]" />
                  <input
                    type="number"
                    value={formData.occupants}
                    onChange={(e) => {
                      const occ = parseInt(e.target.value) || 1
                      setFormData({
                        ...formData,
                        occupants: occ,
                        daily_demand_litres: occ * 135, // Bureau of Indian Standards (BIS) 135 lpcd default
                      })
                    }}
                    min="1"
                    max="1000"
                    className="neu-input pl-9 pr-3 font-mono"
                  />
                </div>
                <span className="text-[11px] text-[#8C948C] mt-1 block">
                  BIS Standard: ~135 litres/person/day
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-[#252B26] mb-1.5 flex items-center min-h-[1.25rem]">
                  Total Daily Water Requirement (L/day)
                  <InfoTooltip content="Total consumption. You can override the calculated BIS average." />
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.daily_demand_litres}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        daily_demand_litres: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="1"
                    step="25"
                    className="neu-input px-3 pr-14 font-mono"
                  />
                  <span className="absolute right-3 top-3 text-xs text-[#8C948C] font-mono">
                    L/day
                  </span>
                </div>
                <span className="text-[11px] text-[#8C948C] mt-1 block font-mono">
                  Annual Demand: {(formData.daily_demand_litres * 365).toLocaleString()} Litres/year
                </span>
              </div>
            </div>

            {/* Instant Demand Comparison Banner */}
            <div className="p-4 rounded-2xl neu-inset border border-[#DEDFD8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-[#252B26] block">Instant Theoretical Harvest Potential</span>
                <span className="text-[#687068] text-[11px]">
                  {instantGrossHarvest.toLocaleString()} L/year theoretical harvest vs{' '}
                  {instantAnnualDemand.toLocaleString()} L/year demand.
                </span>
              </div>
              <div className="neu-raised-sm px-3 py-1.5 font-mono text-forest-800 font-bold text-xs whitespace-nowrap self-start sm:self-auto">
                ~{potentialDemandCovered}% Theoretical Coverage
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: SOIL & GROUND INFILTRATION */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Soil Type Cards */}
            <div>
              <label className="text-xs font-bold text-[#252B26] uppercase tracking-wider block mb-2">
                Sub-Surface Soil Characteristics
                <InfoTooltip content="Soil percolation governs whether groundwater recharge via pits or trenches is hydraulically feasible." />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SOIL_TYPES.map((soil) => {
                  const isSelected = formData.soil_type === soil.id
                  return (
                    <div
                      key={soil.id}
                      onClick={() => setFormData({ ...formData, soil_type: soil.id })}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between h-full min-w-0 ${
                        isSelected
                          ? 'border-forest-600 bg-[#EEEEEA] text-forest-700 font-bold shadow-neu-inset'
                          : 'border-transparent neu-raised-sm hover:shadow-neu text-[#252B26]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#252B26]">{soil.name}</span>
                        <span className="text-[10px] font-mono font-bold text-forest-700 bg-[#EEEEEA] border border-forest-600/20 px-1.5 py-0.5 rounded shadow-neu-sm">
                          {soil.rate}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#687068] leading-relaxed mt-1">{soil.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#252B26] mb-1.5 flex items-center min-h-[1.25rem]">
                  Available Unpaved Open Ground (m²)
                  <InfoTooltip content="Space for excavating recharge pits, trenches, or filter chambers." />
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.open_area_sqm}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        open_area_sqm: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="5"
                    className="neu-input px-3 pr-10 font-mono"
                  />
                  <span className="absolute right-3 top-3 text-xs text-[#8C948C] font-mono">
                    m²
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#252B26] mb-1.5 flex items-center min-h-[1.25rem]">
                  Existing On-Site Borewell
                  <InfoTooltip content="Direct recharge into or adjacent to an existing borewell saves deep drilling costs." />
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 h-auto sm:h-11 pt-1">
                  <label className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    formData.has_existing_borewell ? 'bg-[#EEEEEA] text-forest-700 font-bold border border-forest-600/40 shadow-neu-inset-sm' : 'neu-raised-sm text-[#252B26]'
                  }`}>
                    <input
                      type="radio"
                      name="borewell"
                      checked={formData.has_existing_borewell === true}
                      onChange={() => setFormData({ ...formData, has_existing_borewell: true })}
                      className="text-forest-600 focus:ring-forest-500"
                    />
                    <span>Yes, functional/dry borewell exists</span>
                  </label>
                  <label className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    !formData.has_existing_borewell ? 'bg-[#EEEEEA] text-forest-700 font-bold border border-forest-600/40 shadow-neu-inset-sm' : 'neu-raised-sm text-[#252B26]'
                  }`}>
                    <input
                      type="radio"
                      name="borewell"
                      checked={formData.has_existing_borewell === false}
                      onChange={() => setFormData({ ...formData, has_existing_borewell: false })}
                      className="text-forest-600 focus:ring-forest-500"
                    />
                    <span>No borewell on-site</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: BUDGET & REVIEW */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <label className="text-xs font-bold text-[#252B26] mb-1.5 flex items-center min-h-[1.25rem]">
                Maximum Capital Budget (₹ INR)
                <InfoTooltip content="Optimization engine penalizes candidate tanks exceeding your specified budget." />
              </label>
              <div className="relative max-w-md">
                <span className="absolute left-3 top-3 text-xs text-[#8C948C] font-mono font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  value={formData.budget_inr || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      budget_inr: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="e.g. 100000"
                  step="5000"
                  className="neu-input pl-8 pr-3 font-mono"
                />
              </div>
              <span className="text-[11px] text-[#8C948C] mt-1 block">
                Leave empty for unconstrained engineering optimum.
              </span>
            </div>

            {/* Assessment Review Summary Card */}
            <div className="rounded-2xl neu-inset p-4 sm:p-5 space-y-3 border border-[#DEDFD8]">
              <h3 className="text-xs font-bold text-[#252B26] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-forest-600" />
                <span>Verification Review Summary</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 neu-raised-sm flex flex-col justify-between h-full min-w-0">
                  <span className="text-[10px] text-[#8C948C] block truncate">Location</span>
                  <span className="font-bold text-[#252B26] truncate mt-1">{formData.city}</span>
                </div>
                <div className="p-3 neu-raised-sm flex flex-col justify-between h-full min-w-0">
                  <span className="text-[10px] text-[#8C948C] block truncate">Roof Area</span>
                  <span className="font-bold text-[#252B26] truncate mt-1">{formData.roof_area_sqm} m²</span>
                </div>
                <div className="p-3 neu-raised-sm flex flex-col justify-between h-full min-w-0">
                  <span className="text-[10px] text-[#8C948C] block truncate">Rainfall</span>
                  <span className="font-bold text-[#252B26] truncate mt-1">{formData.annual_rainfall_mm} mm</span>
                </div>
                <div className="p-3 neu-raised-sm flex flex-col justify-between h-full min-w-0">
                  <span className="text-[10px] text-[#8C948C] block truncate">Soil Type</span>
                  <span className="font-bold text-[#252B26] capitalize truncate mt-1">{formData.soil_type}</span>
                </div>
              </div>

              <div className="text-[11px] text-[#687068] pt-1">
                Clicking <strong className="text-forest-700">"Execute Hydrological Simulation"</strong>{' '}
                will simulate a 12-month iterative water balance across 10 candidate tank capacities and generate
                an explainable civil sizing recommendation.
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="flex items-center justify-between border-t border-[#DEDFD8] pt-5 shadow-[0_1px_0_rgba(108,126,114,0.08)]">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="neu-btn-secondary h-11 px-5 text-xs font-semibold inline-flex items-center space-x-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Previous Step</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < WIZARD_STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="neu-btn-primary h-11 px-6 text-xs font-bold inline-flex items-center space-x-1.5"
            >
              <span>Continue to Step {currentStep + 1}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="neu-btn-primary h-11 px-7 text-xs font-extrabold inline-flex items-center space-x-2 disabled:opacity-60"
            >
              <Calculator className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Simulating 12-Month Water Balance...' : 'Execute Hydrological Simulation'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
