import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Info } from 'lucide-react'

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
  latitude?: number | null
  longitude?: number | null
  annualRainfallMm: number
  roofAreaSqm: number
  recommendedSystem: string
  onCoordinatesChange?: (lat: number, lon: number) => void
  isInteractive?: boolean
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
  latitude,
  longitude,
  annualRainfallMm,
  roofAreaSqm,
  recommendedSystem,
  onCoordinatesChange,
  isInteractive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  const cityKey = city.toLowerCase().trim()
  const defaultCoords: [number, number] =
    latitude !== undefined && latitude !== null && longitude !== undefined && longitude !== null
      ? [latitude, longitude]
      : CITY_COORDINATES[cityKey] || [20.5937, 78.9629] // India centroid fallback

  const [currentCoords, setCurrentCoords] = useState<[number, number]>(defaultCoords)

  // Sync internal coords if props change externally
  useEffect(() => {
    if (latitude && longitude) {
      setCurrentCoords([latitude, longitude])
    } else if (CITY_COORDINATES[cityKey]) {
      setCurrentCoords(CITY_COORDINATES[cityKey])
    }
  }, [cityKey, latitude, longitude])

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Clean up prior map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const zoomLevel = 12
    const map = L.map(mapContainerRef.current, {
      center: currentCoords,
      zoom: zoomLevel,
      scrollWheelZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    const marker = L.marker(currentCoords, {
      draggable: isInteractive,
      title: 'Drag marker to pinpoint your property catchment',
    }).addTo(map)

    marker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
        <strong style="color: #0f172a; font-size: 13px;">${city}${state ? `, ${state}` : ''}</strong><br/>
        <span style="color: #0284c7;">🌧 Annual Rainfall: ${annualRainfallMm} mm</span><br/>
        <span style="color: #16a34a;">🏠 Catchment: ${roofAreaSqm} m²</span><br/>
        <span style="color: #4f46e5; font-weight: 600;">⚙ ${recommendedSystem}</span><br/>
        <span style="color: #64748b; font-size: 10px;">${currentCoords[0].toFixed(4)}°N, ${currentCoords[1].toFixed(4)}°E</span>
      </div>
    `).openPopup()

    // Add rainfall zone circle
    const circle = L.circle(currentCoords, {
      color: '#0284c7',
      fillColor: '#38bdf8',
      fillOpacity: 0.12,
      radius: 3500,
    }).addTo(map)

    // Handle marker drag end event
    if (isInteractive) {
      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        const newCoords: [number, number] = [pos.lat, pos.lng]
        setCurrentCoords(newCoords)
        circle.setLatLng(pos)
        if (onCoordinatesChange) {
          onCoordinatesChange(pos.lat, pos.lng)
        }
      })

      // Click on map to reposition marker
      map.on('click', (e: L.LeafletMouseEvent) => {
        const newCoords: [number, number] = [e.latlng.lat, e.latlng.lng]
        marker.setLatLng(e.latlng)
        circle.setLatLng(e.latlng)
        setCurrentCoords(newCoords)
        if (onCoordinatesChange) {
          onCoordinatesChange(e.latlng.lat, e.latlng.lng)
        }
      })
    }

    markerRef.current = marker
    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [currentCoords[0], currentCoords[1], city, state, annualRainfallMm, roofAreaSqm, recommendedSystem, isInteractive])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Property & Rooftop Geographic Catchment Pin
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500">
          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
            {currentCoords[0].toFixed(4)}°N, {currentCoords[1].toFixed(4)}°E
          </span>
          <span className="hidden sm:inline">OpenStreetMap · Draggable Marker</span>
        </div>
      </div>

      <div
        ref={mapContainerRef}
        className="w-full h-64 sm:h-72 rounded-xl border border-slate-200 overflow-hidden z-0"
      />

      {isInteractive && (
        <div className="flex items-center space-x-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <Info className="h-3.5 w-3.5 text-forest-600 flex-shrink-0" />
          <span>
            <strong>Interactive Verification:</strong> Drag the marker or click anywhere on the map to pinpoint your exact building location and trigger localized precipitation extraction.
          </span>
        </div>
      )}
    </div>
  )
}
