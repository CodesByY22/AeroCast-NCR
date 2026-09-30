import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapIcon,
  MapPinIcon,
  ClockIcon,
  ArrowPathIcon as RefreshCwIcon,
  InformationCircleIcon as InfoIcon,
  FireIcon as FlameIcon,
  CheckIcon as CheckSquareIcon
} from '@heroicons/react/24/outline'

import {
  fetchMapStations,
  fetchDiagnostics,
  fetchStubbleRisk,
  MapStationsData,
  DiagnosticData,
  StubbleRiskData,
  FALLBACK_MAP_STATIONS
} from '../api/client'
import { getBadgeStyle } from '../utils/colors'

// Delhi NCR Center Coordinates
const NCR_CENTER: [number, number] = [28.6139, 77.2090]
const DEFAULT_ZOOM = 9.5

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom, { animate: true })
  }, [center, zoom, map])
  return null
}

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
  animSpeedFactor
}: CanvasWindProps) {
  const map = useMap()

  useEffect(() => {
    if (!active) return

    const canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '400'

    const container = map.getPanes().overlayPane
    container.appendChild(canvas)

    let animationFrameId: number

    const resizeCanvas = () => {
      const size = map.getSize()
      canvas.width = size.x
      canvas.height = size.y
    }
    resizeCanvas()

    const rad = (windDirDeg * Math.PI) / 180
    const vx = Math.sin(rad) * windSpeed * 0.8 * animSpeedFactor
    const vy = -Math.cos(rad) * windSpeed * 0.8 * animSpeedFactor

    const particlesCount = 120
    const particles = Array.from({ length: particlesCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      length: Math.random() * 25 + 15,
      life: Math.random() * 100
    }))

    const render = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const mapPos = L.DomUtil.getPosition(map.getPanes().mapPane)
      canvas.style.transform = `translate3d(${-mapPos.x}px, ${-mapPos.y}px, 0px)`

      ctx.lineWidth = 1.5
      ctx.strokeStyle = 'rgba(43, 108, 176, 0.45)'

      particles.forEach(p => {
        p.x += vx
        p.y += vy
        p.life += 1

        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height || p.life > 120) {
          p.x = Math.random() * canvas.width
          p.y = Math.random() * canvas.height
          p.life = 0
        }

        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x - vx * (p.length / 10), p.y - vy * (p.length / 10))
        ctx.stroke()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    map.on('move', resizeCanvas)
    map.on('zoom', resizeCanvas)

    return () => {
      cancelAnimationFrame(animationFrameId)
      map.off('move', resizeCanvas)
      map.off('zoom', resizeCanvas)
      if (container.contains(canvas)) {
        container.removeChild(canvas)
      }
    }
  }, [map, active, windSpeed, windDirDeg, animSpeedFactor])

  return null
}

function createStationIcon(value: number, color: string, isSelected: boolean) {
  const size = isSelected ? 36 : 30
  const borderStyle = isSelected ? '2px solid #1a1a1a' : '2px solid #ffffff'
  const html = `
    <div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: ${borderStyle};
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 500;
      font-size: 11px;
      font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
    ">
      ${value}
    </div>
  `
  return L.divIcon({ html, className: 'custom-station-marker', iconSize: [size, size], iconAnchor: [size / 2, size / 2] })
}

function createFireIcon(frp: number) {
  const size = Math.min(Math.max(Math.round(frp / 2), 12), 24)
  const html = `
    <div style="
      background-color: #ef4444;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 4px; height: 4px; background: #ffffff; border-radius: 50%;"></div>
    </div>
  `
  return L.divIcon({ html, className: 'custom-fire-marker', iconSize: [size, size], iconAnchor: [size / 2, size / 2] })
}

export default function MapPage() {
  const [stationData, setStationData] = useState<MapStationsData | null>(null)
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null)
  const [stubbleData, setStubbleData] = useState<StubbleRiskData | null>(null)
  const [loading, setLoading] = useState(true)

  const [selectedHorizon, setSelectedHorizon] = useState<'+0h' | '+6h' | '+12h' | '+24h' | '+48h' | '+72h'>('+0h')
  const [selectedFilter, setSelectedFilter] = useState<'aqi' | 'pm25' | 'pm10' | 'no2' | 'o3'>('aqi')
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)

  const [mapCenter, setMapCenter] = useState<[number, number]>(NCR_CENTER)
  const [mapZoom, setMapZoom] = useState<number>(DEFAULT_ZOOM)

  const [layers, setLayers] = useState({
    airQuality: true,
    atmosphericFlow: true,
    fireActivity: true,
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

  const stations = (stationData?.stations && stationData.stations.length > 0) ? stationData.stations : FALLBACK_MAP_STATIONS.stations
  const activeStation = stations.find(s => s.id === selectedStationId) || stations[0]

  const windSpd = diagnosticData?.meteorological_drivers.wind_speed_10m.value ?? 6.0
  const windDir = diagnosticData?.meteorological_drivers.wind_direction_10m.value ?? 315

  const toggleLayer = (layerKey: keyof typeof layers) => setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }))

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-12 pb-24">
      {/* Title */}
      <div>
        <h1 className="text-[28px] font-light tracking-tight text-textMain">Air Quality & Weather Map</h1>
        <p className="text-[13px] text-textMuted mt-1">Geographic atmospheric mapping across Delhi NCR.</p>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase">Horizon</span>
          <div className="flex gap-2">
            {(['+0h', '+6h', '+12h', '+24h', '+48h', '+72h'] as const).map(h => (
              <button key={h} onClick={() => setSelectedHorizon(h)}
                className={\`px-3 py-1 rounded text-[11px] transition-colors \${selectedHorizon === h ? 'bg-textMain text-surface font-medium' : 'text-textMuted hover:text-textMain'}\`}>
                {h === '+0h' ? 'LIVE' : h}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase">Filter</span>
          <div className="flex gap-2">
            {(['aqi', 'pm25', 'pm10', 'no2', 'o3'] as const).map(p => (
              <button key={p} onClick={() => setSelectedFilter(p)}
                className={\`px-3 py-1 rounded text-[11px] uppercase transition-colors \${selectedFilter === p ? 'bg-textMain text-surface font-medium' : 'text-textMuted hover:text-textMain'}\`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <hr className="border-borderSubtle" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Map Canvas */}
        <div className="lg:col-span-8 space-y-6">
          <div className="h-[500px] w-full rounded border border-borderSubtle relative overflow-hidden">
            <MapContainer center={NCR_CENTER} zoom={DEFAULT_ZOOM} scrollWheelZoom={true} style={{ height: '100%', width: '100%', backgroundColor: '#f4f4f6' }}>
              <MapController center={mapCenter} zoom={mapZoom} />
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}" maxZoom={16} />
              
              {layers.airQuality && stations.map(st => {
                const val = selectedFilter === 'aqi' ? st.aqi : st[selectedFilter]
                return (
                  <Marker key={st.id} position={[st.lat, st.lon]} icon={createStationIcon(val, st.color, st.id === selectedStationId)}
                    eventHandlers={{ click: () => { setSelectedStationId(st.id); setMapCenter([st.lat, st.lon]) } }} />
                )
              })}
              <CanvasWindStreamlineLayer active={layers.atmosphericFlow} windSpeed={windSpd} windDirDeg={windDir} animSpeedFactor={1.0} isSmokeTransportActive={layers.smokeTransport} />
              {layers.fireActivity && stubbleData?.active_fire_hotspots.map((fire, idx) => (
                <Marker key={idx} position={[fire.latitude, fire.longitude]} icon={createFireIcon(fire.frp)} />
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-12 pl-4 lg:border-l lg:border-borderSubtle lg:pl-12">
          
          <div className="space-y-4">
            <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase block">Map Layers</span>
            <div className="space-y-3 text-[12px] text-textMain">
              <button onClick={() => toggleLayer('airQuality')} className="flex items-center gap-3 w-full group">
                <div className={\`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors \${layers.airQuality ? 'bg-textMain border-textMain' : 'border-borderSubtle'}\`}>
                  {layers.airQuality && <CheckSquareIcon className="w-3 h-3 text-surface" strokeWidth={2} />}
                </div>
                <span className="group-hover:text-textMuted transition-colors">Monitoring Stations</span>
              </button>
              <button onClick={() => toggleLayer('atmosphericFlow')} className="flex items-center gap-3 w-full group">
                <div className={\`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors \${layers.atmosphericFlow ? 'bg-textMain border-textMain' : 'border-borderSubtle'}\`}>
                  {layers.atmosphericFlow && <CheckSquareIcon className="w-3 h-3 text-surface" strokeWidth={2} />}
                </div>
                <span className="group-hover:text-textMuted transition-colors">10m Wind Streamlines</span>
              </button>
              <button onClick={() => toggleLayer('fireActivity')} className="flex items-center gap-3 w-full group">
                <div className={\`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors \${layers.fireActivity ? 'bg-textMain border-textMain' : 'border-borderSubtle'}\`}>
                  {layers.fireActivity && <CheckSquareIcon className="w-3 h-3 text-surface" strokeWidth={2} />}
                </div>
                <span className="group-hover:text-textMuted transition-colors">Satellite Fire Spots</span>
              </button>
            </div>
          </div>

          {activeStation && (
            <div className="space-y-4">
              <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase block">Selected Station</span>
              <div>
                <h3 className="text-[14px] text-textMain">{activeStation.name}</h3>
                <p className="text-[11px] text-textMuted">{activeStation.city}</p>
              </div>
              <div className="pt-2">
                <div className="text-[48px] font-light tracking-tighter leading-none" style={{ color: activeStation.color }}>{activeStation.aqi}</div>
                <div className="text-[11px] mt-2 font-medium px-2 py-0.5 rounded inline-block" style={getBadgeStyle(activeStation.color)}>{activeStation.category}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 text-[11px]">
                <div><span className="text-textMuted block mb-0.5">PM2.5</span><span className="text-[14px]">{activeStation.pm25} µg/m³</span></div>
                <div><span className="text-textMuted block mb-0.5">PM10</span><span className="text-[14px]">{activeStation.pm10} µg/m³</span></div>
                <div><span className="text-textMuted block mb-0.5">O3</span><span className="text-[14px]">{activeStation.o3} µg/m³</span></div>
                <div><span className="text-textMuted block mb-0.5">NO2</span><span className="text-[14px]">{activeStation.no2} µg/m³</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
