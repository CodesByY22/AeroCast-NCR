import { useState, useEffect, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Map as MapIcon,
  MapPin,
  Wind,
  Flame,
  ShieldAlert,
  RefreshCw,
  Layers,
  Info,
  Clock,
  Navigation,
  CheckSquare,
  Square,
  Gauge
} from 'lucide-react'
import {
  fetchMapStations,
  fetchDiagnostics,
  fetchStubbleRisk,
  MapStationsData,
  DiagnosticData,
  StubbleRiskData
} from '../api/client'
import { getBadgeStyle } from '../utils/colors'

// Delhi NCR Center Coordinates
const NCR_CENTER: [number, number] = [28.6139, 77.2090]
const DEFAULT_ZOOM = 9.5

// Helper to fit map bounds or recenter
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom, { animate: true })
  }, [center, zoom, map])
  return null
}

// Canvas-Based Real Weather Streamline Particle Layer
interface CanvasWindProps {
  active: boolean
  windSpeed: number
  windDirDeg: number
  animSpeedFactor: number
  isSmokeTransportActive: boolean
}

function CanvasWindStreamlineLayer({
  active,
  windSpeed,
  windDirDeg,
  animSpeedFactor,
  isSmokeTransportActive
}: CanvasWindProps) {
  const map = useMap()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const container = map.getContainer()
    let canvas = canvasRef.current

    if (!active) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas)
        canvasRef.current = null
      }
      return
    }

    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.style.position = 'absolute'
      canvas.style.top = '0'
      canvas.style.left = '0'
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      canvas.style.pointerEvents = 'none'
      canvas.style.zIndex = '500'
      container.appendChild(canvas)
      canvasRef.current = canvas
    }

    const updateSize = () => {
      if (!canvas) return
      const size = map.getSize()
      canvas.width = size.x
      canvas.height = size.y
    }
    updateSize()

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Sparse, long-flowing meteorological streamline parameters
    const PARTICLE_COUNT = 75
    const MAX_TRAIL_LENGTH = 55
    const MIN_SPAWN_DIST = 45

    interface Particle {
      x: number
      y: number
      age: number
      maxAge: number
      speedMult: number
      isCorridor: boolean
      trail: { x: number; y: number }[]
    }

    // Direction calculation:
    // windDirDeg is direction wind comes FROM.
    // Particle movement direction is (windDirDeg + 180) degrees.
    const moveAngleRad = ((windDirDeg + 180) % 360) * (Math.PI / 180)
    const baseVx = Math.sin(moveAngleRad)
    const baseVy = -Math.cos(moveAngleRad)
    const baseSpeed = Math.max(0.6, windSpeed * 0.32 * animSpeedFactor)

    const existingParticles: Particle[] = []

    const resetParticle = (w: number, h: number, isInitial = false): Particle => {
      let x = 0
      let y = 0
      let attempts = 0
      let valid = false

      while (!valid && attempts < 25) {
        attempts++
        if (isInitial) {
          x = Math.random() * w
          y = Math.random() * h
        } else {
          // Upwind boundary spawning based on wind direction vector
          const spawnTopOrLeft = Math.random() < 0.65
          if (spawnTopOrLeft) {
            if (baseVy > 0) {
              x = Math.random() * w
              y = -20
            } else {
              x = Math.random() * w
              y = h + 20
            }
          } else {
            if (baseVx > 0) {
              x = -20
              y = Math.random() * h
            } else {
              x = w + 20
              y = Math.random() * h
            }
          }
        }

        // Distance check to maintain streamline separation
        valid = true
        for (const existing of existingParticles) {
          const dx = existing.x - x
          const dy = existing.y - y
          if (Math.sqrt(dx * dx + dy * dy) < MIN_SPAWN_DIST) {
            valid = false
            break
          }
        }
      }

      const isCorridor = isSmokeTransportActive && (x < w * 0.70 && y < h * 0.70)

      return {
        x,
        y,
        age: isInitial ? Math.floor(Math.random() * 120) : 0,
        maxAge: 220 + Math.floor(Math.random() * 140),
        speedMult: 0.82 + Math.random() * 0.36,
        isCorridor,
        trail: [{ x, y }]
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = resetParticle(canvas.width, canvas.height, true)
      existingParticles.push(p)
    }

    const getColor = (speed: number, isCorridor: boolean, alpha: number) => {
      if (isCorridor) return `rgba(56, 189, 248, ${alpha * 0.85})` // Sky Blue for NW Corridor
      if (speed < 2) return `rgba(56, 189, 248, ${alpha * 0.60})`   // Soft Sky Blue
      if (speed < 4) return `rgba(34, 211, 238, ${alpha * 0.70})`   // Soft Cyan
      if (speed < 6) return `rgba(52, 211, 153, ${alpha * 0.75})`   // Soft Emerald Green
      if (speed < 8) return `rgba(251, 191, 36, ${alpha * 0.80})`   // Soft Amber
      return `rgba(248, 113, 113, ${alpha * 0.85})`                 // Soft Coral Red
    }

    const render = () => {
      if (!ctx || !canvas) return

      // Smooth canvas fade for fluid, non-distracting motion blur
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.globalCompositeOperation = 'source-over'

      const cx = canvas.width * 0.5
      const cy = canvas.height * 0.5
      const ncrRadius = Math.min(canvas.width, canvas.height) * 0.28

      for (let i = 0; i < existingParticles.length; i++) {
        const p = existingParticles[i]

        // Smooth atmospheric sinusoidal curvature along momentum vector
        const curveOffset = Math.sin((p.age + i * 7) * 0.03) * 0.40
        const vx = baseVx + (-baseVy * curveOffset * 0.18)
        const vy = baseVy + (baseVx * curveOffset * 0.18)

        p.x += vx * baseSpeed * p.speedMult
        p.y += vy * baseSpeed * p.speedMult
        p.age++

        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > MAX_TRAIL_LENGTH) {
          p.trail.shift()
        }

        if (p.trail.length > 1) {
          // Calculate distance from NCR central station cluster to soften density in center
          const dxCenter = p.x - cx
          const dyCenter = p.y - cy
          const distCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter)
          const centerFactor = distCenter < ncrRadius ? 0.45 + (distCenter / ncrRadius) * 0.55 : 1.0

          // Render multi-segment fading trail
          ctx.lineWidth = p.isCorridor ? 1.4 : 1.1
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'

          for (let t = 1; t < p.trail.length; t++) {
            const progress = t / p.trail.length
            const alpha = Math.sin(progress * Math.PI) * centerFactor

            ctx.beginPath()
            ctx.moveTo(p.trail[t - 1].x, p.trail[t - 1].y)
            ctx.lineTo(p.trail[t].x, p.trail[t].y)
            ctx.strokeStyle = getColor(windSpeed, p.isCorridor, alpha)
            ctx.stroke()
          }

          // Subtle head tip highlight
          const head = p.trail[p.trail.length - 1]
          ctx.beginPath()
          ctx.arc(head.x, head.y, 0.9, 0, Math.PI * 2)
          ctx.fillStyle = p.isCorridor ? 'rgba(125, 211, 252, 0.85)' : `rgba(255, 255, 255, ${0.75 * centerFactor})`
          ctx.fill()
        }

        // Boundary respawn check
        if (p.age >= p.maxAge || p.x < -40 || p.x > canvas.width + 40 || p.y < -40 || p.y > canvas.height + 40) {
          existingParticles[i] = resetParticle(canvas.width, canvas.height, false)
        }
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    const handleMapResize = () => {
      updateSize()
    }

    map.on('move zoom resize', handleMapResize)
    animFrameRef.current = requestAnimationFrame(render)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      map.off('move zoom resize', handleMapResize)
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas)
        canvasRef.current = null
      }
    }
  }, [active, windSpeed, windDirDeg, animSpeedFactor, isSmokeTransportActive, map])

  return null
}

// Leaflet DivIcon Generators
const createStationIcon = (aqi: number, color: string, isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-station-marker',
    html: `
      <div style="
        background-color: #0f172a;
        border: 2px solid ${color};
        box-shadow: 0 0 ${isSelected ? '18px' : '8px'} ${color}bb;
        color: ${color};
        transform: scale(${isSelected ? '1.2' : '1.0'});
      " class="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono transition-all duration-200 cursor-pointer">
        <span style="background-color: ${color}" class="w-2.5 h-2.5 rounded-full animate-pulse shrink-0"></span>
        <span class="text-slate-100 font-extrabold text-[11px]">${aqi}</span>
      </div>
    `,
    iconSize: [52, 28],
    iconAnchor: [26, 14]
  })
}

const createFireIcon = (frp: number) => {
  const size = Math.min(36, Math.max(22, Math.round(18 + frp / 15)))
  return L.divIcon({
    className: 'custom-fire-marker',
    html: `
      <div style="width: ${size}px; height: ${size}px;" class="flex items-center justify-center rounded-full bg-rose-950/90 border-2 border-rose-500 text-rose-300 font-bold shadow-lg shadow-rose-950/80 cursor-pointer hover:scale-110 transition-transform">
        <span class="text-xs">🔥</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

export default function MapPage() {
  const [stationData, setStationData] = useState<MapStationsData | null>(null)
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null)
  const [stubbleData, setStubbleData] = useState<StubbleRiskData | null>(null)
  const [loading, setLoading] = useState(true)

  // Map Controls State
  const [selectedHorizon, setSelectedHorizon] = useState<string>('+0h')
  const [selectedFilter, setSelectedFilter] = useState<'aqi' | 'pm25' | 'pm10' | 'no2' | 'o3'>('aqi')
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>(NCR_CENTER)
  const [mapZoom, setMapZoom] = useState<number>(DEFAULT_ZOOM)
  const [animSpeedFactor, setAnimSpeedFactor] = useState<number>(1.0)

  // Layer Toggles
  const [layers, setLayers] = useState({
    airQuality: true,
    forecastMode: true,
    atmosphericFlow: true,
    fireActivity: false,
    smokeTransport: true
  })

  const loadAllData = useCallback(async (horizonStr: string) => {
    setLoading(true)
    try {
      const [stRes, diagRes, stubRes] = await Promise.all([
        fetchMapStations(horizonStr),
        fetchDiagnostics().catch(() => null),
        fetchStubbleRisk().catch(() => null)
      ])
      setStationData(stRes)
      if (diagRes) setDiagnosticData(diagRes)
      if (stubRes) setStubbleData(stubRes)

      if (stRes.stations.length > 0 && !selectedStationId) {
        setSelectedStationId(stRes.stations[0].id)
      }
    } catch (err) {
      console.error('Failed to load map data:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedStationId])

  useEffect(() => {
    loadAllData(selectedHorizon)
  }, [selectedHorizon, loadAllData])

  const stations = stationData?.stations || []
  const activeStation = stations.find(s => s.id === selectedStationId) || stations[0]

  const handleResetView = () => {
    setMapCenter(NCR_CENTER)
    setMapZoom(DEFAULT_ZOOM)
  }

  const toggleLayer = (layerKey: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }))
  }

  const windSpd = diagnosticData?.meteorological_drivers.wind_speed_10m.value ?? 6.0
  const windDir = diagnosticData?.meteorological_drivers.wind_direction_10m.value ?? 315

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
              <MapIcon className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-100 tracking-tight">
                DELHI NCR AIR QUALITY MAP
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real geographic environmental intelligence map across Delhi, Gurugram, Noida, Ghaziabad & Faridabad.
              </p>
            </div>
          </div>
        </div>

        {/* Controls Bar: Forecast Horizon Selector & Param Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Horizon Selector */}
          <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-bold px-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Horizon:
            </span>
            {(['+0h', '+6h', '+12h', '+24h', '+48h', '+72h'] as const).map(h => (
              <button
                key={h}
                onClick={() => setSelectedHorizon(h)}
                className={`px-2.5 py-1.5 rounded-lg font-bold uppercase transition ${
                  selectedHorizon === h
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {h === '+0h' ? 'CURRENT' : h.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Parameter Filters */}
          <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
            {(['aqi', 'pm25', 'pm10', 'no2', 'o3'] as const).map(param => (
              <button
                key={param}
                onClick={() => setSelectedFilter(param)}
                className={`px-2.5 py-1.5 rounded-lg font-bold uppercase transition ${
                  selectedFilter === param
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {param}
              </button>
            ))}
          </div>

          {/* Reset View Button */}
          <button
            onClick={handleResetView}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 shadow"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset NCR View</span>
          </button>
        </div>
      </div>

      {/* Scientific Integrity Banner */}
      <div className="p-4 bg-slate-950/90 border border-cyan-900/40 rounded-2xl text-xs text-slate-300 leading-relaxed flex items-start gap-3 shadow-inner">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-100 font-bold block text-sm mb-0.5">Scientific Integrity & Data Provenance Notice:</strong>
          <span>
            Observed/reanalysis locations show point data (CAMS Reanalysis extractions matched to CPCB station coordinates). Wind flow derived from 10m meteorological wind vectors. Streamlines visualize the available meteorological field; they are not direct observations at every displayed pixel. <strong>No artificial spatial interpolation, fake kriging, or synthetic heatmaps are applied.</strong>
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Map (65%) + Control & Detail Sidebars (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Real Geographic Map Canvas (8 Columns on Desktop) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-2xl overflow-hidden flex flex-col">
          {/* Map Header bar with Layer Status */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span>Interactive NCR Geographic View</span>
            </span>
            <span className="font-mono text-[11px] text-cyan-400 bg-cyan-950/60 border border-cyan-900/60 px-2.5 py-1 rounded-lg">
              {selectedHorizon === '+0h' ? 'LIVE OBSERVATIONS (+0h)' : `${selectedHorizon.toUpperCase()} FORECAST MODEL`}
            </span>
          </div>

          {/* Leaflet Real Geographic Map Container */}
          <div className="h-[560px] w-full rounded-xl relative overflow-hidden border border-slate-800 shadow-2xl">
            {loading && (
              <div className="absolute inset-0 bg-slate-950/80 z-50 flex items-center justify-center text-xs text-cyan-400 font-mono gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> Loading geospatial layers...
              </div>
            )}

            <MapContainer
              center={NCR_CENTER}
              zoom={DEFAULT_ZOOM}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%', backgroundColor: '#090d16' }}
              className="z-0"
            >
              <MapController center={mapCenter} zoom={mapZoom} />

              {/* Esri World Dark Gray Basemap Tiles */}
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
                maxZoom={16}
              />

              {/* Layer 1: Air Quality Reference Stations */}
              {layers.airQuality && stations.map(st => {
                const isSelected = st.id === selectedStationId
                const val = selectedFilter === 'aqi' ? st.aqi : st[selectedFilter]
                const icon = createStationIcon(val, st.color, isSelected)

                return (
                  <Marker
                    key={st.id}
                    position={[st.lat, st.lon]}
                    icon={icon}
                    eventHandlers={{
                      click: () => {
                        setSelectedStationId(st.id)
                        setMapCenter([st.lat, st.lon])
                      }
                    }}
                  >
                    <Popup className="custom-leaflet-popup" closeButton={false}>
                      <div className="p-3.5 space-y-2.5 font-sans min-w-[220px]">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="font-bold text-sm text-slate-100 tracking-tight">{st.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-800/80">
                            {st.city}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Reading ({selectedFilter})</span>
                          <span className="font-black text-xl font-mono" style={{ color: st.color }}>{val}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">CPCB Severity</span>
                          <span className="font-extrabold px-2.5 py-0.5 rounded-full text-[10px] shadow-md" style={getBadgeStyle(st.color)}>
                            {st.category}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-xs font-mono pt-2 border-t border-slate-800/80">
                          <div className="p-1.5 bg-slate-950/80 rounded-lg border border-slate-800/80 flex justify-between">
                            <span className="text-slate-400">PM2.5</span>
                            <span className="font-bold text-amber-400">{st.pm25}</span>
                          </div>
                          <div className="p-1.5 bg-slate-950/80 rounded-lg border border-slate-800/80 flex justify-between">
                            <span className="text-slate-400">PM10</span>
                            <span className="font-bold text-rose-400">{st.pm10}</span>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-400 pt-1 flex justify-between font-mono border-t border-slate-800/60">
                          <span>Horizon: {selectedHorizon}</span>
                          <span className="text-cyan-400 font-semibold">{st.type}</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}

              {/* Layer 2: Canvas-Based Real Weather Streamline Particle Layer */}
              <CanvasWindStreamlineLayer
                active={layers.atmosphericFlow}
                windSpeed={windSpd}
                windDirDeg={windDir}
                animSpeedFactor={animSpeedFactor}
                isSmokeTransportActive={layers.smokeTransport}
              />

              {/* Layer 3: Satellite Fire Hotspots (NASA FIRMS) */}
              {layers.fireActivity && stubbleData?.active_fire_hotspots.map((fire, idx) => (
                <Marker
                  key={`fire_${idx}`}
                  position={[fire.latitude, fire.longitude]}
                  icon={createFireIcon(fire.frp)}
                >
                  <Popup>
                    <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl space-y-1.5 text-xs font-sans min-w-[190px]">
                      <div className="font-bold text-sm text-rose-400 flex items-center gap-1.5 border-b border-slate-800 pb-1">
                        <Flame className="w-4 h-4" /> Satellite Fire Spot
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-400">Region:</span>
                        <span className="font-bold text-slate-100">{fire.cluster}</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-400">Fire Power (FRP):</span>
                        <span className="font-bold text-rose-400">{fire.frp} MW</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-400">Confidence:</span>
                        <span className="font-bold text-emerald-400">{fire.confidence}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800">
                        {fire.latitude.toFixed(4)}°N, {fire.longitude.toFixed(4)}°E
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Map Legends & Wind Speed Scale */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            {/* CPCB AQI Legend */}
            <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">CPCB Legend:</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#00E400]"></span> Good</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#9CFF00]"></span> Satisfactory</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#FFFF00]"></span> Moderate</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#FF7E00]"></span> Poor</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#FF0000]"></span> Very Poor</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#99004C]"></span> Severe</span>
            </div>

            {/* Wind Speed Gradient Scale */}
            {layers.atmosphericFlow && (
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="font-bold text-cyan-400 uppercase">WIND SPEED AT 10m:</span>
                <div className="flex items-center gap-1">
                  <span className="text-[#0284c7]">0</span>
                  <span className="w-8 h-1.5 rounded-full bg-gradient-to-r from-[#0284c7] via-[#06b6d4] via-[#10b981] via-[#f59e0b] to-[#ef4444]"></span>
                  <span className="text-[#ef4444]">10+ m/s</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Controls & Inspector (4 Columns on Desktop) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Layer Control Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Map Layer Control</span>
            </h3>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => toggleLayer('airQuality')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition ${
                  layers.airQuality ? 'bg-cyan-950/60 border-cyan-500/50 text-slate-100' : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <span className="flex items-center gap-2 font-semibold">
                  <MapPin className="w-4 h-4 text-cyan-400" /> Air Quality Reference Locations
                </span>
                {layers.airQuality ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4 text-slate-600" />}
              </button>

              <button
                onClick={() => toggleLayer('atmosphericFlow')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition ${
                  layers.atmosphericFlow ? 'bg-cyan-950/60 border-cyan-500/50 text-slate-100' : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <span className="flex items-center gap-2 font-semibold">
                  <Wind className="w-4 h-4 text-cyan-400" /> Wind Streamlines (Weather Field)
                </span>
                {layers.atmosphericFlow ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4 text-slate-600" />}
              </button>

              <button
                onClick={() => toggleLayer('fireActivity')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition ${
                  layers.fireActivity ? 'bg-rose-950/60 border-rose-500/50 text-slate-100' : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <span className="flex items-center gap-2 font-semibold">
                  <Flame className="w-4 h-4 text-rose-400" /> Satellite Fire Activity (NASA FIRMS)
                </span>
                {layers.fireActivity ? <CheckSquare className="w-4 h-4 text-rose-400" /> : <Square className="w-4 h-4 text-slate-600" />}
              </button>

              <button
                onClick={() => toggleLayer('smokeTransport')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition ${
                  layers.smokeTransport ? 'bg-amber-950/60 border-amber-500/50 text-slate-100' : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <span className="flex items-center gap-2 font-semibold">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> Smoke Transport Risk Proxy
                </span>
                {layers.smokeTransport ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4 text-slate-600" />}
              </button>
            </div>
          </div>

          {/* Current Wind Streamline Info & Speed Controls Card */}
          {layers.atmosphericFlow && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-cyan-400" /> Current Wind Streamline Field
                </h4>
                <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
                  <span className="text-slate-400 px-1 font-bold">Speed:</span>
                  {[0.5, 1.0, 2.0].map(s => (
                    <button
                      key={s}
                      onClick={() => setAnimSpeedFactor(s)}
                      className={`px-2 py-0.5 rounded font-bold transition ${
                        animSpeedFactor === s ? 'bg-cyan-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Wind Vector</span>
                  <span className="font-bold text-cyan-300 text-sm">{windDir}° (NW → SE)</span>
                </div>
                <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Surface Velocity</span>
                  <span className="font-bold text-amber-400 text-sm">{windSpd} m/s</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Ventilation ($V_c$):</span>
                <span className="font-bold text-emerald-400">
                  {diagnosticData?.diagnostics.ventilation.ventilation_index_proxy ?? 1800} m²/s
                </span>
              </div>
            </div>
          )}

          {/* Selected Station Inspector Card */}
          {activeStation && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">{activeStation.name}</h3>
                  <p className="text-xs text-slate-400">
                    {activeStation.city} NCR ({activeStation.lat.toFixed(3)}°N, {activeStation.lon.toFixed(3)}°E)
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded text-cyan-300 bg-cyan-500/20 border border-cyan-500/30 font-mono">
                  {activeStation.type}
                </span>
              </div>

              {/* AQI Score Display */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-2 shadow-inner">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Station AQI ({selectedHorizon})
                </span>
                <div className="text-5xl font-black font-mono tracking-tight" style={{ color: activeStation.color }}>
                  {activeStation.aqi}
                </div>
                <span className="inline-block px-3 py-1 rounded text-xs font-extrabold shadow-lg" style={getBadgeStyle(activeStation.color)}>
                  {activeStation.category}
                </span>
              </div>

              {/* Pollutant Breakdown Table */}
              <div className="space-y-2 text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Pollutant Breakdown</span>
                <div className="space-y-1.5 font-mono">
                  <div className="flex justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-slate-300 font-medium">PM2.5</span>
                    <span className="font-bold text-amber-400">{activeStation.pm25} µg/m³</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-slate-300 font-medium">PM10</span>
                    <span className="font-bold text-rose-400">{activeStation.pm10} µg/m³</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-slate-300 font-medium">NO2</span>
                    <span className="font-bold text-sky-400">{activeStation.no2} µg/m³</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-slate-300 font-medium">O3</span>
                    <span className="font-bold text-emerald-400">{activeStation.o3} µg/m³</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upwind Smoke Transport Risk Proxy Breakdown Panel */}
          {layers.smokeTransport && stubbleData?.ranked_regional_risk && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> Ranked Smoke Transport Risk
                </h4>
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                  {stubbleData.transport_risk.category}
                </span>
              </div>

              <div className="space-y-2">
                {stubbleData.ranked_regional_risk.map((r, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-200">
                      <span>{r.region}</span>
                      <span className="text-amber-400 font-mono">Risk: {r.risk_score}/100</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>Dist: {r.distance_km}km</span>
                      <span>FRP: {r.total_frp_mw} MW</span>
                      <span>Alignment: {r.wind_alignment}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-800/80">
                Physics-guided smoke transport risk proxy. Does not assert chemical source apportionment.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
