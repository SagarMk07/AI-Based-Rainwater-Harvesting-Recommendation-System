import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin } from 'lucide-react'

// Fix default leaflet marker icon assets in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface PropertyMapProps {
  city: string
  state?: string
  annualRainfallMm: number
  roofAreaSqm: number
  recommendedSystem: string
}

const CITY_COORDINATES: Record<string, [number, number]> = {
  bengaluru: [12.9716, 77.5946],
  mumbai: [18.9220, 72.8347],
  delhi: [28.6139, 77.2090],
  chennai: [13.0827, 80.2707],
  hyderabad: [17.3850, 78.4867],
  pune: [18.5204, 73.8567],
  jaipur: [26.9124, 75.7873],
  kolkata: [22.5726, 88.3639],
  kochi: [9.9312, 76.2673],
  ahmedabad: [23.0225, 72.5714],
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  city,
  state,
  annualRainfallMm,
  roofAreaSqm,
  recommendedSystem,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  const cityKey = city.toLowerCase().trim()
  const coords: [number, number] = CITY_COORDINATES[cityKey] || [20.5937, 78.9629] // India centroid fallback
  const zoomLevel = CITY_COORDINATES[cityKey] ? 12 : 5

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Clean up prior map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const map = L.map(mapContainerRef.current, {
      center: coords,
      zoom: zoomLevel,
      scrollWheelZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    const marker = L.marker(coords).addTo(map)
    marker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
        <strong style="color: #0f172a; font-size: 13px;">${city}${state ? `, ${state}` : ''}</strong><br/>
        <span style="color: #0284c7;">🌧 Annual Rainfall: ${annualRainfallMm} mm</span><br/>
        <span style="color: #16a34a;">🏠 Catchment: ${roofAreaSqm} m²</span><br/>
        <span style="color: #4f46e5; font-weight: 600;">⚙ ${recommendedSystem}</span>
      </div>
    `).openPopup()

    // Add rainfall zone circle
    L.circle(coords, {
      color: '#0284c7',
      fillColor: '#38bdf8',
      fillOpacity: 0.15,
      radius: 4000,
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [coords[0], coords[1], city, state, annualRainfallMm, roofAreaSqm, recommendedSystem])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Property & Rainfall Catchment Geographic Verification
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          OpenStreetMap · {coords[0].toFixed(2)}°N, {coords[1].toFixed(2)}°E
        </span>
      </div>
      <div
        ref={mapContainerRef}
        className="w-full h-64 sm:h-72 rounded-lg border border-slate-200 overflow-hidden z-0"
      />
    </div>
  )
}
