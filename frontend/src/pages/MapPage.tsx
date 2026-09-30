import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Map as MapIcon,
  MapPin,
  Wind,
  Flame,
  RefreshCw,
  Layers,
  Info,
  Clock,
  Navigation,
  CheckSquare,
  Square
} from 'lucide-react'
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
      ctx.strokeStyle = 'rgba(0, 102, 204, 0.45)'

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
  const borderStyle = isSelected ? '3px solid #1d1d1f' : '2px solid #ffffff'
  const shadow = isSelected ? '0 4px 14px rgba(0,0,0,0.25)' : '0 2px 6px rgba(0,0,0,0.15)'
  const size = isSelected ? 36 : 30

  const html = `
    <div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: ${borderStyle};
      box-shadow: ${shadow};
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 700;
      font-size: 11px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: all 0.2s ease;
    ">
      ${value}
    </div>
  `

  return L.divIcon({
    html,
    className: 'custom-station-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

function createFireIcon(frp: number) {
  const size = Math.min(Math.max(Math.round(frp / 2), 12), 24)
  const html = `
    <div style="
      background-color: #dc2626;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 8px rgba(220, 38, 38, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 4px; height: 4px; background: #ffffff; border-radius: 50%;"></div>
    </div>
  `
  return L.divIcon({
    html,
    className: 'custom-fire-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
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
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-[#d2d2d7] rounded-xl p-6 ">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[#0066cc]">
              <MapIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">
                Delhi NCR Air Quality & Weather Map
              </h1>
              <p className="text-xs text-[#6e6e73] mt-0.5">
                Real geographic atmospheric spatial mapping across Delhi, Gurugram, Noida, Ghaziabad & Faridabad.
              </p>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#f5f5f7] p-1 rounded-xl border border-[#d2d2d7] text-xs">
            <span className="text-[#6e6e73] font-semibold px-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#0066cc]" /> Horizon:
            </span>
            {(['+0h', '+6h', '+12h', '+24h', '+48h', '+72h'] as const).map(h => (
              <button
                key={h}
                onClick={() => setSelectedHorizon(h)}
                className={`px-2.5 py-1 rounded-lg font-medium uppercase transition ${
                  selectedHorizon === h
                    ? 'bg-white text-[#0066cc] font-semibold border border-[#d2d2d7] shadow-sm'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                {h === '+0h' ? 'CURRENT' : h.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-[#f5f5f7] p-1 rounded-xl border border-[#d2d2d7] text-xs">
            {(['aqi', 'pm25', 'pm10', 'no2', 'o3'] as const).map(param => (
              <button
                key={param}
                onClick={() => setSelectedFilter(param)}
                className={`px-2.5 py-1 rounded-lg font-medium uppercase transition ${
                  selectedFilter === param
                    ? 'bg-white text-[#0066cc] font-semibold border border-[#d2d2d7] shadow-sm'
                    : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                {param}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#f5f5f7] text-[#1d1d1f] text-xs font-medium transition border border-[#d2d2d7] shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0066cc]" />
            <span>Reset NCR View</span>
          </button>
        </div>
      </div>

      {/* Scientific Integrity Banner */}
      <div className="p-4 bg-white border border-[#d2d2d7] rounded-xl text-xs text-[#424245] leading-relaxed flex items-start gap-3 ">
        <Info className="w-4 h-4 text-[#0066cc] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#1d1d1f] font-semibold block text-xs mb-0.5">Scientific Provenance Notice:</strong>
          <span>
            Point stations represent observed CPCB locations and CAMS grid matchings. Wind streamlines visualize the 10m meteorological vector field. No artificial kriging or synthetic heatmaps are applied.
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Real Geographic Map Canvas */}
        <div className="lg:col-span-8 bg-white border border-[#d2d2d7] rounded-xl p-4 space-y-4  overflow-hidden flex flex-col">
          <div className="flex items-center justify-between text-xs text-[#6e6e73] px-2">
            <span className="font-semibold text-[#1d1d1f] uppercase tracking-wider flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#0066cc]" />
              <span>Geographic Spatial Canvas</span>
            </span>
            <span className="font-mono text-[11px] text-[#0066cc] bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg font-semibold">
              {selectedHorizon === '+0h' ? 'LIVE OBSERVATIONS (+0h)' : `${selectedHorizon.toUpperCase()} FORECAST MODEL`}
            </span>
          </div>

          <div className="h-[560px] w-full rounded-xl relative overflow-hidden border border-[#d2d2d7] shadow-inner">
            {loading && (
              <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center text-xs text-[#0066cc] font-mono gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> Loading geospatial layers...
              </div>
            )}

            <MapContainer
              center={NCR_CENTER}
              zoom={DEFAULT_ZOOM}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%', backgroundColor: '#f4f4f6' }}
              className="z-0"
            >
              <MapController center={mapCenter} zoom={mapZoom} />

              {/* Esri Light Gray Canvas Basemap */}
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
                maxZoom={16}
              />

              {/* Air Quality Stations */}
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
                        <div className="flex items-center justify-between border-b border-[#d2d2d7] pb-2">
                          <span className="font-semibold text-sm text-[#1d1d1f] tracking-tight">{st.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-[#0066cc] border border-blue-200">
                            {st.city}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#6e6e73] font-medium uppercase tracking-wider">Reading ({selectedFilter})</span>
                          <span className="font-bold text-xl font-mono" style={{ color: st.color }}>{val}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#6e6e73] font-medium">CPCB Severity</span>
                          <span className="font-semibold px-2.5 py-0.5 rounded-full text-[10px] shadow-sm" style={getBadgeStyle(st.color)}>
                            {st.category}
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}

              {/* Streamlines */}
              <CanvasWindStreamlineLayer
                active={layers.atmosphericFlow}
                windSpeed={windSpd}
                windDirDeg={windDir}
                animSpeedFactor={1.0}
                isSmokeTransportActive={layers.smokeTransport}
              />

              {/* Satellite Fires */}
              {layers.fireActivity && stubbleData?.active_fire_hotspots.map((fire, idx) => (
                <Marker
                  key={`fire_${idx}`}
                  position={[fire.latitude, fire.longitude]}
                  icon={createFireIcon(fire.frp)}
                >
                  <Popup>
                    <div className="p-3.5 bg-white text-[#1d1d1f] rounded-xl space-y-1.5 text-xs font-sans min-w-[190px]">
                      <div className="font-semibold text-sm text-[#dc2626] flex items-center gap-1.5 border-b border-[#d2d2d7] pb-1">
                        <Flame className="w-4 h-4" /> NASA FIRMS Fire Spot
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-[#6e6e73]">Region:</span>
                        <span className="font-bold text-[#1d1d1f]">{fire.cluster}</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-[#6e6e73]">Fire Power:</span>
                        <span className="font-bold text-[#dc2626]">{fire.frp} MW</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Map Legends */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-[#6e6e73] pt-2 border-t border-[#d2d2d7]">
            <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono">
              <span className="font-semibold text-[#1d1d1f] uppercase text-[10px]">CPCB Legend:</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#00E400]"></span> Good</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#9CFF00]"></span> Satisfactory</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#FFFF00]"></span> Moderate</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#FF7E00]"></span> Poor</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#FF0000]"></span> Very Poor</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#99004C]"></span> Severe</span>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#d2d2d7] rounded-xl p-5 space-y-4 ">
            <h2 className="text-sm font-semibold text-[#1d1d1f] uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0066cc]" />
              <span>Map Layer Control</span>
            </h2>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => toggleLayer('airQuality')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition ${
                  layers.airQuality ? 'bg-blue-50 border-blue-200 text-[#0066cc] font-semibold' : 'bg-[#f5f5f7] border-[#d2d2d7] text-[#6e6e73]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Monitoring Station Locations
                </span>
                {layers.airQuality ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              </button>

              <button
                onClick={() => toggleLayer('atmosphericFlow')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition ${
                  layers.atmosphericFlow ? 'bg-blue-50 border-blue-200 text-[#0066cc] font-semibold' : 'bg-[#f5f5f7] border-[#d2d2d7] text-[#6e6e73]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Wind className="w-4 h-4" /> 10m Wind Streamline Field
                </span>
                {layers.atmosphericFlow ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              </button>

              <button
                onClick={() => toggleLayer('fireActivity')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition ${
                  layers.fireActivity ? 'bg-rose-50 border-rose-200 text-[#dc2626] font-semibold' : 'bg-[#f5f5f7] border-[#d2d2d7] text-[#6e6e73]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Flame className="w-4 h-4" /> NASA FIRMS Satellite Fire Spots
                </span>
                {layers.fireActivity ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Selected Station Inspector */}
          {activeStation && (
            <div className="bg-white border border-[#d2d2d7] rounded-xl p-6 space-y-4 ">
              <div className="flex items-center justify-between border-b border-[#d2d2d7] pb-3">
                <div>
                  <h3 className="text-base font-semibold text-[#1d1d1f]">{activeStation.name}</h3>
                  <p className="text-xs text-[#6e6e73]">
                    {activeStation.city} NCR ({activeStation.lat.toFixed(3)}°N, {activeStation.lon.toFixed(3)}°E)
                  </p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded text-[#0066cc] bg-blue-50 border border-blue-200 font-mono">
                  {activeStation.type}
                </span>
              </div>

              <div className="p-4 bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl text-center space-y-2">
                <span className="text-xs text-[#6e6e73] font-medium uppercase tracking-wider">
                  Station AQI ({selectedHorizon})
                </span>
                <div className="text-4xl font-semibold tracking-tight" style={{ color: activeStation.color }}>
                  {activeStation.aqi}
                </div>
                <span className="inline-block px-3 py-0.5 rounded text-xs font-semibold shadow-2xs" style={getBadgeStyle(activeStation.color)}>
                  {activeStation.category}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <span className="text-[#6e6e73] font-semibold uppercase tracking-wider text-[11px]">Pollutant Breakdown</span>
                <div className="space-y-1.5 font-mono">
                  <div className="flex justify-between p-2.5 bg-[#f5f5f7] rounded-xl border border-[#d2d2d7]">
                    <span className="text-[#424245]">PM2.5</span>
                    <span className="font-semibold text-[#1d1d1f]">{activeStation.pm25} µg/m³</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-[#f5f5f7] rounded-xl border border-[#d2d2d7]">
                    <span className="text-[#424245]">PM10</span>
                    <span className="font-semibold text-[#1d1d1f]">{activeStation.pm10} µg/m³</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-[#f5f5f7] rounded-xl border border-[#d2d2d7]">
                    <span className="text-[#424245]">NO2</span>
                    <span className="font-semibold text-[#1d1d1f]">{activeStation.no2} µg/m³</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-[#f5f5f7] rounded-xl border border-[#d2d2d7]">
                    <span className="text-[#424245]">O3</span>
                    <span className="font-semibold text-[#1d1d1f]">{activeStation.o3} µg/m³</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
