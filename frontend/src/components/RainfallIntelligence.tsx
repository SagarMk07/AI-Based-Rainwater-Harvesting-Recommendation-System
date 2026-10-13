import React from 'react'
import {
  CloudRain,
  Calendar,
  AlertTriangle,
  Radio,
  TrendingUp,
  Droplets,
  Sun,
} from 'lucide-react'
import type { CityRainfallProfile, WaterBalanceResult } from '../types/analysis'

interface Props {
  weather: CityRainfallProfile
  waterBalance?: WaterBalanceResult
}

export const RainfallIntelligence: React.FC<Props> = ({ weather, waterBalance }) => {
  const isFallback = weather.is_fallback
  const wetSeasonVol = waterBalance?.wet_season_harvest_litres ?? weather.wet_season_rainfall_mm ?? 0
  const drySeasonVol = waterBalance?.dry_season_harvest_litres ?? weather.dry_season_rainfall_mm ?? 0
  const totalVol = (waterBalance?.total_inflow_litres) || (weather.annual_rainfall_mm || 1)
  const wetPct = Math.min(100, Math.max(0, Math.round(((wetSeasonVol as number) / totalVol) * 100)))
  const dryPct = 100 - wetPct

  return (
    <div className="space-y-5 neu-card p-5 sm:p-7">
      {/* 1. SECTION TITLE & DATA TRANSPARENCY HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DEDFD8] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase font-mono neu-inset text-forest-800">
              <CloudRain className="h-3 w-3 text-forest-600" />
              <span>Location Intelligence & Meteorology</span>
            </span>
            {isFallback ? (
              <span className="inline-flex items-center space-x-1 text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300">
                <AlertTriangle className="h-3 w-3 text-amber-600" />
                <span>OFFLINE FALLBACK MODE</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-[#EEEEEA] text-forest-800 border border-forest-600/30 shadow-neu-sm">
                <Radio className="h-3 w-3 text-forest-600 animate-pulse" />
                <span>LIVE TELEMETRY ACTIVE</span>
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#252B26] tracking-tight mt-1.5">
            Rainfall Dynamics & Seasonal Harvest Potential
          </h2>
        </div>

        {/* Data Source Transparency Pill */}
        <div className="flex flex-col sm:items-end text-[11px] font-mono text-[#687068] space-y-0.5">
          <span className="font-semibold text-[#252B26]">
            Source: {weather.weather_source.split(' ')[0]} Telemetry
          </span>
          <span>Period: {weather.data_period || '30-Yr Climatological Normal'}</span>
          {weather.latitude && weather.longitude && (
            <span className="text-[#8C948C]">
              Station: {weather.latitude.toFixed(2)}°N, {weather.longitude.toFixed(2)}°E
            </span>
          )}
        </div>
      </div>

      {/* Warning Notice if Offline Fallback */}
      {weather.warning_notice && (
        <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/90 text-xs text-amber-900 flex items-start space-x-2.5 shadow-neu-sm">
          <AlertTriangle className="h-4 w-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Transparent Data Source Notice:</span>
            <p className="text-[11px] leading-relaxed text-amber-800">{weather.warning_notice}</p>
          </div>
        </div>
      )}

      {/* 2. FOUR KEY METEOROLOGICAL METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 neu-raised-sm space-y-1 border border-[#DEDFD8]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#687068] block">
            Annual Precipitation
          </span>
          <div className="text-2xl font-black text-[#252B26] font-mono">
            {weather.annual_rainfall_mm}{' '}
            <span className="text-xs font-normal text-[#687068]">mm</span>
          </div>
          <span className="text-[10px] text-[#8C948C] block">Historical multi-year average</span>
        </div>

        <div className="p-4 neu-raised-sm space-y-1 border border-[#DEDFD8]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#687068] block">
            Rainy Days / Year
          </span>
          <div className="text-2xl font-black text-forest-800 font-mono">
            {weather.rainy_days_count ?? 55}{' '}
            <span className="text-xs font-normal text-[#687068]">days</span>
          </div>
          <span className="text-[10px] text-[#8C948C] block">Days with ≥ 2.5 mm rainfall</span>
        </div>

        <div className="p-4 neu-raised-sm space-y-1 border border-[#DEDFD8]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#687068] block">
            Wettest vs Driest
          </span>
          <div className="text-sm font-black text-[#252B26] font-mono mt-1">
            {weather.wettest_month || 'Monsoon'} <span className="text-xs font-normal text-[#8C948C]">vs</span> {weather.driest_month || 'Winter'}
          </div>
          <span className="text-[10px] text-[#8C948C] block mt-1">Peak monsoon concentration</span>
        </div>

        <div className="p-4 neu-raised-sm space-y-1 border border-[#DEDFD8]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#687068] block">
            Rainfall Variability (CV)
          </span>
          <div className="text-2xl font-black text-[#252B26] font-mono">
            {weather.variability_cv ?? 0.85}{' '}
            <span className="text-xs font-normal text-[#687068]">index</span>
          </div>
          <span className="text-[10px] text-[#8C948C] block">
            {Number(weather.variability_cv ?? 0) > 0.9 ? 'High seasonal skew' : 'Moderate spread'}
          </span>
        </div>
      </div>

      {/* 3. SEASONAL HARVEST POTENTIAL BANNER ("When Can You Harvest the Most?") */}
      <div className="p-5 rounded-2xl bg-[#132018] text-white border border-white/10 shadow-[6px_6px_16px_rgba(108,126,114,0.18),-6px_-6px_16px_rgba(255,255,255,0.7)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-forest-800/50 border border-forest-600/40 text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold block">
                Seasonal Yield Intelligence
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                When Can You Harvest the Most?
              </h3>
            </div>
          </div>
          <div className="text-xs text-emerald-300 font-mono bg-[#1C2C22] border border-white/10 px-3 py-1 rounded-full self-start sm:self-auto">
            {waterBalance?.seasonal_harvest_window || `Peak harvest concentrated during ${weather.wettest_month || 'Monsoon'} months.`}
          </div>
        </div>

        {/* Visual Harvest Share Split */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-sky-300">
              <Droplets className="h-3.5 w-3.5" />
              <span>Wet Season: <strong>{wetPct}%</strong> ({Math.round(Number(wetSeasonVol)).toLocaleString()} L)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-amber-300">
              <Sun className="h-3.5 w-3.5" />
              <span>Dry Season: <strong>{dryPct}%</strong> ({Math.round(Number(drySeasonVol)).toLocaleString()} L)</span>
            </span>
          </div>

          {/* Dual-tone Progress Bar */}
          <div className="h-3 w-full rounded-full bg-[#1C2C22] overflow-hidden flex border border-white/10">
            <div
              style={{ width: `${wetPct}%` }}
              className="bg-emerald-500 h-full transition-all duration-500"
              title={`Wet Season: ${wetPct}%`}
            />
            <div
              style={{ width: `${dryPct}%` }}
              className="bg-amber-500/80 h-full transition-all duration-500"
              title={`Dry Season: ${dryPct}%`}
            />
          </div>
        </div>

        <p className="text-xs text-[#C2D1C7] leading-relaxed">
          In {weather.city}, rainfall is intensely seasonal. Over <strong>{wetPct}%</strong> of total collectable stormwater arrives during the prime wet window. Storing this surplus bridges residential demand deep into dry periods, while directing the remainder into shallow aquifer recharge prevents neighborhood waterlogging.
        </p>
      </div>

      {/* 4. OPTIONAL 7-DAY LIVE FORECAST STRIP */}
      {weather.forecast_next_7_days && weather.forecast_next_7_days.length > 0 && (
        <div className="space-y-2 border-t border-[#DEDFD8] pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#252B26] uppercase tracking-wider flex items-center space-x-1.5">
              <Calendar className="h-3.5 w-3.5 text-forest-600" />
              <span>Real-Time 7-Day Rainfall Forecast (ECMWF / Open-Meteo)</span>
            </span>
            <span className="text-[11px] font-mono text-[#8C948C]">High-Resolution Model</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {weather.forecast_next_7_days.map((day, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl neu-raised-sm text-center space-y-1 border border-[#DEDFD8]"
              >
                <span className="block text-[10px] font-mono font-bold text-[#687068]">
                  {day.date.slice(5)}
                </span>
                <span className={`block text-xs font-mono font-black ${
                  day.rainfall_mm > 0 ? 'text-forest-700' : 'text-[#8C948C]'
                }`}>
                  {day.rainfall_mm.toFixed(1)} mm
                </span>
                {day.temp_max_c !== null && day.temp_max_c !== undefined && (
                  <span className="block text-[10px] text-[#8C948C] font-mono">
                    {Math.round(day.temp_max_c)}° / {Math.round(day.temp_min_c || 20)}°
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RainfallIntelligence
