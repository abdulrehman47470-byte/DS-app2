import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { useApp } from '@/lib/store'

export interface MapPoint {
  id: string
  lat: number
  lng: number
  label: string
  /** 'pin' = gold lounge pin, 'person' = approximate member area circle. */
  kind?: 'pin' | 'person'
  tone?: number
}

// OpenStreetMap tiles, themed with CSS filters. Fine for development and demos only:
// the OSM tile policy forbids heavy production use, so Phase 7 swaps in Mapbox (VITE_MAPBOX_TOKEN).
const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

const pinIcon = (selected: boolean) =>
  L.divIcon({
    className: '',
    html: `<div class="ds-pin ${selected ? 'is-selected' : ''}"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9h18l-2 11H5z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></svg></div>`,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
  })

const personIcon = (label: string) =>
  L.divIcon({
    className: '',
    html: `<div class="ds-person">${label}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })

export function LoungeMap({
  points,
  selectedId,
  onSelect,
  userPos,
  onSearchArea,
  className,
  cluster = true,
  interactive = true,
}: {
  points: MapPoint[]
  selectedId?: string
  onSelect?: (id: string) => void
  userPos?: [number, number] | null
  onSearchArea?: (bounds: L.LatLngBounds) => void
  className?: string
  cluster?: boolean
  interactive?: boolean
}) {
  const { resolvedTheme } = useApp()
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const tiles = useRef<L.TileLayer | null>(null)
  const layer = useRef<L.LayerGroup | null>(null)
  const userLayer = useRef<L.CircleMarker | null>(null)
  const markers = useRef<Map<string, L.Marker>>(new Map())
  const [moved, setMoved] = useState(false)
  const fitted = useRef(false)
  const fitTo = useRef<L.LatLngBounds | null>(null)
  const touched = useRef(false)

  // create map once
  useEffect(() => {
    if (!el.current || map.current) return
    const m = L.map(el.current, {
      zoomControl: false,
      attributionControl: true,
      dragging: interactive,
      scrollWheelZoom: interactive,
      touchZoom: interactive,
      doubleClickZoom: interactive,
    }).setView([39.5, -96], 4)
    if (interactive) L.control.zoom({ position: 'bottomright' }).addTo(m)
    m.on('dragstart', () => (touched.current = true))
    m.on('dragend', () => setMoved(true))
    m.on('zoomend', () => touched.current && setMoved(true))
    map.current = m
    // The container can have no size on first paint (sheets, transitions): refit once it does.
    const ro = new ResizeObserver(() => {
      m.invalidateSize()
      if (!touched.current && fitTo.current) m.fitBounds(fitTo.current, { maxZoom: 12, animate: false })
    })
    ro.observe(el.current)
    return () => {
      ro.disconnect()
      m.remove()
      map.current = null
    }
  }, [interactive])

  // theme tiles
  useEffect(() => {
    const m = map.current
    if (!m) return
    tiles.current?.remove()
    tiles.current = L.tileLayer(TILES, { attribution: ATTRIBUTION, maxZoom: 19, className: `ds-tiles-${resolvedTheme}` }).addTo(m)
  }, [resolvedTheme])

  // markers
  useEffect(() => {
    const m = map.current
    if (!m) return
    layer.current?.remove()
    markers.current.clear()
    const group: L.LayerGroup = cluster
      ? L.markerClusterGroup({
          showCoverageOnHover: false,
          maxClusterRadius: 44,
          iconCreateFunction: (c) =>
            L.divIcon({ className: '', html: `<div class="ds-cluster">${c.getChildCount()}</div>`, iconSize: [40, 40] }),
        })
      : L.layerGroup()
    points.forEach((p) => {
      const mk = L.marker([p.lat, p.lng], {
        icon: p.kind === 'person' ? personIcon(p.label.slice(0, 2)) : pinIcon(p.id === selectedId),
        title: p.label,
        keyboard: true,
      })
      mk.on('click', () => onSelect?.(p.id))
      markers.current.set(p.id, mk)
      group.addLayer(mk)
    })
    group.addTo(m)
    layer.current = group
    if (!fitted.current && points.length) {
      const b = L.latLngBounds(points.map((p) => [p.lat, p.lng]))
      if (userPos) b.extend(userPos)
      fitTo.current = b.pad(0.2)
      m.invalidateSize()
      m.fitBounds(fitTo.current, { maxZoom: 12, animate: false })
      fitted.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, cluster])

  // selection: fly to and highlight
  useEffect(() => {
    const m = map.current
    if (!m) return
    markers.current.forEach((mk, id) => {
      const p = points.find((x) => x.id === id)
      if (p?.kind !== 'person') mk.setIcon(pinIcon(id === selectedId))
    })
    const p = points.find((x) => x.id === selectedId)
    if (p) touched.current = true
    if (p) m.flyTo([p.lat, p.lng], Math.max(m.getZoom(), 14), { duration: 0.8 })
  }, [selectedId, points])

  // user location
  useEffect(() => {
    const m = map.current
    if (!m) return
    userLayer.current?.remove()
    if (userPos) {
      touched.current = true
      userLayer.current = L.circleMarker(userPos, { radius: 8, color: '#fff', weight: 3, fillColor: '#5B7FB0', fillOpacity: 1 }).addTo(m)
      m.flyTo(userPos, 11, { duration: 0.8 })
    }
  }, [userPos])

  return (
    <div className={cn('relative isolate overflow-hidden rounded-[20px] border border-line', className)}>
      <div ref={el} className="size-full" aria-label="Map" role="application" />
      {onSearchArea && moved && (
        <button
          onClick={() => {
            if (map.current) onSearchArea(map.current.getBounds())
            setMoved(false)
          }}
          className="absolute left-1/2 top-3 z-[500] inline-flex min-h-10 -translate-x-1/2 items-center gap-1.5 rounded-full border border-line bg-bg-elevated px-4 text-[13px] font-semibold text-ink shadow-deep"
        >
          <Search size={14} /> Search this area
        </button>
      )}
    </div>
  )
}

/** Miles between two coordinates. */
export function milesBetween(a: [number, number], b: [number, number]) {
  const R = 3958.8
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
