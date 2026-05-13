'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { api, Registry, Species, User } from '@/lib/api'

declare global {
  interface Window {
    L: LeafletStatic
  }
}

interface LeafletStatic {
  map: (el: HTMLElement, options?: Record<string, unknown>) => LeafletMap
  tileLayer: (url: string, options?: Record<string, unknown>) => LeafletTileLayer
  circleMarker: (latlng: [number, number], options?: Record<string, unknown>) => LeafletMarker
}

interface LeafletMap {
  setView: (center: [number, number], zoom: number) => LeafletMap
  addLayer: (layer: LeafletTileLayer | LeafletMarker) => LeafletMap
  remove: () => void
  invalidateSize: () => void
}

interface LeafletTileLayer {
  addTo: (map: LeafletMap) => LeafletTileLayer
}

interface LeafletMarker {
  addTo: (map: LeafletMap) => LeafletMarker
  bindPopup: (content: string) => LeafletMarker
}

interface RegistryWithCoords {
  id: string
  latitude: number
  longitude: number
  scientificName: string
  collector: string
  dateCollected: string
}

function getScientificName(registry: Registry): string {
  if (typeof registry.species === 'object' && registry.species !== null) {
    return (registry.species as Species).scientificName
  }
  return String(registry.species ?? 'Unknown')
}

function getCollectorName(registry: Registry): string {
  if (typeof registry.collector === 'object' && registry.collector !== null) {
    return (registry.collector as User).name
  }
  return registry.contributorName ?? 'Unknown'
}

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const [specimens, setSpecimens] = useState<RegistryWithCoords[]>([])
  const [loading, setLoading] = useState(true)
  const [leafletReady, setLeafletReady] = useState(false)

  // Load Leaflet from CDN
  useEffect(() => {
    if (typeof window === 'undefined') return

    const existingLink = document.querySelector('link[href*="leaflet"]')
    const existingScript = document.querySelector('script[src*="leaflet"]')

    if (window.L) {
      setLeafletReady(true)
      return
    }

    if (!existingLink) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      link.crossOrigin = ''
      document.head.appendChild(link)
    }

    if (!existingScript) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
      script.crossOrigin = ''
      script.onload = () => setLeafletReady(true)
      document.head.appendChild(script)
    } else {
      existingScript.addEventListener('load', () => setLeafletReady(true))
    }
  }, [])

  // Fetch registries with coordinates
  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      try {
        const response = await api.registry.list({ limit: 100 })
        if (cancelled) return

        const withCoords = response.data
          .filter((r): r is Registry & { latitude: number; longitude: number } =>
            r.latitude != null && r.longitude != null &&
            !isNaN(r.latitude) && !isNaN(r.longitude)
          )
          .map(r => ({
            id: r.id,
            latitude: r.latitude,
            longitude: r.longitude,
            scientificName: getScientificName(r),
            collector: getCollectorName(r),
            dateCollected: r.dateCollected ?? '',
          }))

        setSpecimens(withCoords)
      } catch (err) {
        console.error('Failed to fetch registries for map:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [])

  // Initialize map
  const initMap = useCallback(() => {
    if (!leafletReady || !mapContainerRef.current || mapInstanceRef.current) return

    const L = window.L
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([-14.235, -51.925], 4)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    // Add markers
    specimens.forEach(specimen => {
      const popupContent = `
        <div style="min-width:180px;font-family:system-ui,sans-serif;">
          <p style="margin:0 0 4px;font-weight:600;font-style:italic;color:#2D5F3F;">
            ${specimen.scientificName}
          </p>
          <p style="margin:0 0 2px;font-size:12px;color:#555;">
            Collector: ${specimen.collector}
          </p>
          ${specimen.dateCollected ? `<p style="margin:0 0 6px;font-size:12px;color:#555;">Date: ${new Date(specimen.dateCollected).toLocaleDateString()}</p>` : ''}
          <a href="/registry/${specimen.id}" style="font-size:12px;color:#3D7A52;text-decoration:underline;">
            View details
          </a>
        </div>
      `

      L.circleMarker([specimen.latitude, specimen.longitude] as [number, number], {
        radius: 7,
        fillColor: '#3D7A52',
        color: '#2D5F3F',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(map).bindPopup(popupContent)
    })
  }, [leafletReady, specimens])

  useEffect(() => {
    initMap()
  }, [initMap])

  // Handle resize
  useEffect(() => {
    function handleResize() {
      mapInstanceRef.current?.invalidateSize()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] -m-6 md:-m-8 lg:-m-10">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#EEEEEE]">
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#3D7A52]">
            <path d="M3 7L7.5 5L12.5 7L17 5V15L12.5 17L7.5 15L3 17V7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M7.5 5V15M12.5 7V17" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <h1 className="text-lg font-semibold text-[#1C1B1F]">Map</h1>
        </div>
        <span className="text-sm text-[#6D6D6D]">
          {loading ? 'Loading...' : `${specimens.length} specimen${specimens.length !== 1 ? 's' : ''} with coordinates`}
        </span>
      </div>

      <div className="flex-1 relative">
        {(!leafletReady || loading) && (
          <div className="absolute inset-0 z-10 bg-[#F5F5F5] animate-pulse flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-[#3D7A52] border-t-transparent animate-spin" />
              <p className="text-sm text-[#6D6D6D]">Loading map...</p>
            </div>
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>
    </div>
  )
}
