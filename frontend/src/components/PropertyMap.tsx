import React, { useEffect, useMemo, useRef, useState } from 'react'
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
  const circleRef = useRef<L.Circle | null>(null)

  const cityKey = city.toLowerCase().trim()
  const defaultCoords: [number, number] = useMemo(() => {
    if (latitude !== undefined && latitude !== null && longitude !== undefined && longitude !== null) {
      return [latitude, longitude]
    }
    return CITY_COORDINATES[cityKey] || [20.5937, 78.9629]
  }, [cityKey, latitude, longitude])

  const [pinnedCoords, setPinnedCoords] = useState<[number, number] | null>(null)
  const [prevCityKey, setPrevCityKey] = useState(cityKey)

  // Reset pinned coords if city changed externally
  if (cityKey !== prevCityKey) {
    setPrevCityKey(cityKey)
    setPinnedCoords(null)
  }

  const currentCoords = pinnedCoords || defaultCoords

  // Mount map once on container mount
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const zoomLevel = 12
    const map = L.map(mapContainerRef.current, {
      center: defaultCoords,
      zoom: zoomLevel,
      scrollWheelZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    const marker = L.marker(defaultCoords, {
      draggable: isInteractive,
      title: 'Drag marker to pinpoint your property catchment',
    }).addTo(map)

    const circle = L.circle(defaultCoords, {
      color: '#168447',
      fillColor: '#168447',
      fillOpacity: 0.12,
      radius: 3500,
    }).addTo(map)

    if (isInteractive) {
      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        setPinnedCoords([pos.lat, pos.lng])
        circle.setLatLng(pos)
        if (onCoordinatesChange) {
          onCoordinatesChange(pos.lat, pos.lng)
        }
      })

      map.on('click', (e: L.LeafletMouseEvent) => {
        const pos = e.latlng
        marker.setLatLng(pos)
        circle.setLatLng(pos)
        setPinnedCoords([pos.lat, pos.lng])
        if (onCoordinatesChange) {
          onCoordinatesChange(pos.lat, pos.lng)
        }
      })
    }

    markerRef.current = marker
    circleRef.current = circle
    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [defaultCoords, isInteractive, onCoordinatesChange])

  // Update position and popup whenever coords, city, or hydrological attributes update
  useEffect(() => {
    if (markerRef.current && circleRef.current && mapInstanceRef.current) {
      const latlng: L.LatLngExpression = [currentCoords[0], currentCoords[1]]
      markerRef.current.setLatLng(latlng)
      circleRef.current.setLatLng(latlng)
      mapInstanceRef.current.panTo(latlng)

      markerRef.current.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; color: #252B26;">
          <strong style="color: #106638; font-size: 13px;">${city}${state ? `, ${state}` : ''}</strong><br/>
          <span style="color: #0369a1;">🌧 Annual Rainfall: ${annualRainfallMm} mm</span><br/>
          <span style="color: #168447;">🏠 Catchment: ${roofAreaSqm} m²</span><br/>
          <span style="color: #106638; font-weight: 700;">⚙ ${recommendedSystem}</span><br/>
          <span style="color: #687068; font-size: 10px;">${currentCoords[0].toFixed(4)}°N, ${currentCoords[1].toFixed(4)}°E</span>
        </div>
      `).openPopup()
    }
  }, [currentCoords, city, state, annualRainfallMm, roofAreaSqm, recommendedSystem])

  return (
    <div className="neu-card p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEDFD8] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-lg bg-surface border border-white/80 shadow-neu-sm flex items-center justify-center text-forest-700">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-forest-700 font-bold block">
              Geospatial Intelligence
            </span>
            <h3 className="text-sm font-bold text-ink">
              Property & Rooftop Geographic Catchment Pin
            </h3>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-ink-muted">
          <span className="bg-surface border border-white/80 shadow-neu-sm px-2.5 py-1 rounded-lg text-ink font-bold">
            {currentCoords[0].toFixed(4)}°N, {currentCoords[1].toFixed(4)}°E
          </span>
          <span className="hidden sm:inline">OpenStreetMap · Draggable Marker</span>
        </div>
      </div>

      <div
        ref={mapContainerRef}
        className="w-full h-64 sm:h-72 rounded-2xl border border-white/80 shadow-neu-inset overflow-hidden z-0"
      />

      {isInteractive && (
        <div className="flex items-center space-x-2.5 text-xs text-ink-secondary neu-inset p-3 rounded-xl">
          <Info className="h-4 w-4 text-forest-700 flex-shrink-0" />
          <span>
            <strong className="text-ink">Interactive Verification:</strong> Drag the marker or click anywhere on the map to pinpoint your exact building location and trigger localized precipitation extraction.
          </span>
        </div>
      )}
    </div>
  )
}

export default PropertyMap
