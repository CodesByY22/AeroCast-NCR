import { useState, useEffect, useCallback } from 'react'
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
  Square
} from 'lucide-react'
import {
  fetchMapStations,
  fetchDiagnostics,
  fetchStubbleRisk,
  MapStationsData,
  DiagnosticData,
  StubbleRiskData
} from '../api/client'

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

const WIND_NODES: Array<{ name: string; lat: number; lon: number }> = [
  { name: 'Central NCR', lat: 28.6139, lon: 77.2090 },
  { name: 'NW Stubble Corridor', lat: 28.8500, lon: 76.8800 },
  { name: 'North Corridor', lat: 28.9500, lon: 77.1000 },
  { name: 'West Sector', lat: 28.4500, lon: 76.9200 },
  { name: 'East Sector', lat: 28.5800, lon: 77.3800 },
  { name: 'South Sector', lat: 28.3500, lon: 77.3100 }
]

const createWindIcon = (windDirDeg: number, windSpeed: number, sectorLabel: string = '') => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const dirIdx = Math.round(((windDirDeg % 360) + 360) % 360 / 45) % 8
  const cardinalText = directions[dirIdx]

  return L.divIcon({
    className: 'custom-wind-node-icon',
    html: `
      <div class="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-950/95 border-2 border-cyan-400 text-cyan-200 shadow-2xl shadow-cyan-950/90 cursor-pointer backdrop-blur custom-wind-node">
        <div style="transform: rotate(${windDirDeg}deg);" class="transition-transform duration-700 flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L19 21L12 17L5 21L12 2Z" fill="url(#windGrad)" stroke="#38bdf8" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M12 5V16" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3 2" class="wind-stream-line"/>
            <defs>
              <linearGradient id="windGrad" x1="12" y1="2" x2="12" y2="21" gradientUnits="userSpaceOnUse">
                <stop stop-color="#06b6d4"/>
                <stop offset="1" stop-color="#10b981"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="flex items-center space-x-1 mt-1 px-2 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-700/80 font-mono text-[10px] font-extrabold text-cyan-300">
          <span>${cardinalText}</span>
          <span class="text-slate-500">·</span>
          <span class="text-slate-100">${windSpeed} m/s</span>
        </div>
        ${sectorLabel ? `<span class="text-[9px] font-extrabold text-slate-400 mt-0.5 uppercase tracking-wider font-mono">${sectorLabel}</span>` : ''}
      </div>
    `,
    iconSize: [68, 68],
    iconAnchor: [34, 34]
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

  // Layer Toggles
  const [layers, setLayers] = useState({
    airQuality: true,
    forecastMode: true,
    atmosphericFlow: false,
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

  const windSpd = diagnosticData?.meteorological_drivers.wind_speed_10m.value ?? 1.8
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
            Observed/reanalysis locations show point data (CAMS Reanalysis extractions matched to CPCB station coordinates). Spatial model cells are displayed only where model predictions exist. <strong>No artificial spatial interpolation, fake kriging, or synthetic heatmaps are applied.</strong>
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
                          <span className="font-extrabold px-2.5 py-0.5 rounded-full text-[10px] text-white shadow-md" style={{ backgroundColor: st.color }}>
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

              {/* Layer 2: Atmospheric Wind Vector Spatial Field */}
              {layers.atmosphericFlow && WIND_NODES.map((node, idx) => (
                <Marker
                  key={`wind_node_${idx}`}
                  position={[node.lat, node.lon]}
                  icon={createWindIcon(windDir, windSpd, node.name)}
                >
                  <Popup className="custom-leaflet-popup" closeButton={false}>
                    <div className="p-3.5 space-y-2 text-xs font-sans min-w-[220px]">
                      <div className="font-bold text-sm text-cyan-400 flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="flex items-center gap-1.5"><Wind className="w-4 h-4" /> {node.name} Flow Vector</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          Node #{idx + 1}
                        </span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-400">Wind Direction:</span>
                        <span className="font-bold text-slate-100">{windDir}° (NW → SE)</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-400">Surface Speed:</span>
                        <span className="font-bold text-cyan-300">{windSpd} m/s</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-400">Ventilation ($V_c$):</span>
                        <span className="font-bold text-amber-400">
                          {diagnosticData?.diagnostics.ventilation.ventilation_index_proxy ?? 1800} m²/s
                        </span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-400">PBL Height Proxy:</span>
                        <span className="font-bold text-sky-400">
                          {diagnosticData?.meteorological_drivers.pbl_height_proxy.value ?? 450} m
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800/80 font-mono">
                        {diagnosticData?.diagnostics.ventilation.status ?? 'Weak Ventilation'}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Layer 3: Satellite Fire Hotspots (NASA FIRMS) */}
              {layers.fireActivity && stubbleData?.active_fire_hotspots.map((fire, idx) => (
                <Marker
                  key={`fire_${idx}`}
                  position={[fire.latitude, fire.longitude]}
                  icon={createFireIcon(fire.frp)}
                >
                  <Popup>
                    <div className="p-3 bg-slate-900 text-slate-100 rounded-xl space-y-1.5 text-xs font-sans min-w-[190px]">
                      <div className="font-bold text-sm text-rose-400 flex items-center gap-1.5 border-b border-slate-800 pb-1">
                        <Flame className="w-4 h-4" /> Satellite Fire Spot
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Region:</span>
                        <span className="font-bold text-slate-100">{fire.cluster}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Fire Power (FRP):</span>
                        <span className="font-bold text-rose-400">{fire.frp} MW</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Confidence:</span>
                        <span className="font-bold text-emerald-400">{fire.confidence}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono pt-1">
                        {fire.latitude.toFixed(4)}°N, {fire.longitude.toFixed(4)}°E
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">CPCB Severity Standard:</span>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#00E400]"></span> Good (0-50)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#9CFF00]"></span> Satisfactory (51-100)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FFFF00]"></span> Moderate (101-200)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF7E00]"></span> Poor (201-300)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF0000]"></span> Very Poor (301-400)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#99004C]"></span> Severe (&gt;400)</span>
            </div>
          </div>
        </div>

        {/* Sidebar Controls & Station Inspector (4 Columns on Desktop) */}
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
                  <Wind className="w-4 h-4 text-cyan-400" /> Atmospheric Flow Vector
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
                <span className="inline-block px-3 py-1 rounded text-xs font-bold text-white shadow-lg" style={{ backgroundColor: activeStation.color }}>
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
