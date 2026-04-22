import { useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { EbirdObservation } from '../types'
import { eocToCount } from '../lib/ebird'

interface MapProps {
  observations: EbirdObservation[]
  loading: boolean
}

type LocEntry = { lat: number; lng: number; count: number; locName: string }

// Aggregate observations by location, summing counts
function aggregateByLocation(obs: EbirdObservation[]): LocEntry[] {
  const acc: Record<string, LocEntry> = {}
  for (const o of obs) {
    if (acc[o.locId]) {
      acc[o.locId].count += eocToCount(o)
    } else {
      acc[o.locId] = { lat: o.lat, lng: o.lng, count: eocToCount(o), locName: o.locName }
    }
  }
  return Object.values(acc)
}

function countToRadius(count: number): number {
  // Log scale: 1 bird → 5px, 100 birds → 15px, 1000 birds → 22px
  return Math.max(5, Math.min(22, 5 + Math.log10(count + 1) * 8.5))
}

export default function Map({ observations, loading }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const popupRef = useRef<maplibregl.Popup | null>(null)

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-98.5, 39.5],
      zoom: 4,
    })
    mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right')
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    popupRef.current?.remove()
  }, [])

  // Update markers when observations change
  useEffect(() => {
    clearMarkers()
    if (!mapRef.current || observations.length === 0) return

    const locs = aggregateByLocation(observations)

    locs.forEach(({ lat, lng, count, locName }) => {
      const radius = countToRadius(count)
      const el = document.createElement('div')
      el.style.cssText = `
        width: ${radius * 2}px;
        height: ${radius * 2}px;
        border-radius: 50%;
        background: rgba(251, 191, 36, 0.85);
        border: 1.5px solid rgba(255, 255, 255, 0.5);
        cursor: pointer;
        box-shadow: 0 0 ${radius}px rgba(251, 191, 36, 0.4);
        transition: transform 0.15s;
      `
      el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.3)' })
      el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)' })

      const popup = new maplibregl.Popup({ offset: radius + 4, closeButton: false })
        .setHTML(`
          <div style="font-size:13px;line-height:1.5">
            <div style="font-weight:600">${locName}</div>
            <div>${count} bird${count !== 1 ? 's' : ''} observed</div>
          </div>
        `)

      el.addEventListener('click', () => {
        popupRef.current?.remove()
        popup.setLngLat([lng, lat]).addTo(mapRef.current!)
        popupRef.current = popup
      })

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(mapRef.current!)

      markersRef.current.push(marker)
    })
  }, [observations, clearMarkers])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {loading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full pointer-events-none">
          Loading observations…
        </div>
      )}
    </div>
  )
}
