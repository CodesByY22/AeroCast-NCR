import { useState, useEffect } from 'react'
import { Map, MapPin, Filter, Info } from 'lucide-react'
import { fetchMapStations, MapStationsData } from '../api/client'

export default function MapPage() {
  const [data, setData] = useState<MapStationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<'aqi' | 'pm25' | 'pm10' | 'no2' | 'o3'>('aqi')
  const [selectedStation, setSelectedStation] = useState<string | null>(null)

  useEffect(() => {
    fetchMapStations()
      .then(res => {
        setData(res)
        setSelectedStation(res.stations[0]?.id || null)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading NCR geospatial stations...</div>
  }

  const stations = data?.stations || []
  const activeStation = stations.find(s => s.id === selectedStation) || stations[0]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Map className="w-6 h-6 text-cyan-400" />
            <span>NCR Air Quality Spatial Monitor</span>
          </h2>
          <p className="text-xs text-slate-400">Ground station monitoring coordinates across Delhi, Gurugram, Noida, Ghaziabad, and Faridabad.</p>
        </div>

        {/* Filter Controls */}
        <div className="flex space-x-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {(['aqi', 'pm25', 'pm10', 'no2', 'o3'] as const).map(param => (
            <button
              key={param}
              onClick={() => setSelectedFilter(param)}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold uppercase transition ${
                selectedFilter === param ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {param}
            </button>
          ))}
        </div>
      </div>

      {/* Scientific Labelling Alert Banner */}
      <div className="p-4 bg-slate-950/80 border border-cyan-900/40 rounded-xl text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-100 block">Scientific Integrity Notice:</strong>
          <span>Observed stations display ground sensor telemetry. Model grid cells display spatial predictions. AeroCast NCR does not fake spatial interpolation between unmeasured coordinates.</span>
        </div>
      </div>

      {/* 2-Column Split: Interactive Map Visualizer & Station Detail List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Map Canvas Card */}
        <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Spatial Coordinate Grid (Delhi NCR Bounding Box)</span>
            <span className="flex items-center gap-1"><Filter className="w-3.5 h-3.5 text-cyan-400" /> Active Layer: {selectedFilter.toUpperCase()}</span>
          </div>

          {/* Simulated High-Tech Map Grid Rendering */}
          <div className="h-96 w-full bg-[#050810] border border-slate-800 rounded-xl relative p-6 flex items-center justify-center overflow-hidden">
            {/* Map Grid Lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
            
            {/* Interactive Station Markers */}
            {stations.map(st => {
              const isSelected = st.id === selectedStation
              const val = selectedFilter === 'aqi' ? st.aqi : st[selectedFilter]
              const topPos = Math.max(12, Math.min(85, ((28.72 - st.lat) / 0.35) * 80 + 10))
              const leftPos = Math.max(10, Math.min(88, ((st.lon - 77.00) / 0.40) * 80 + 10))

              return (
                <button
                  key={st.id}
                  onClick={() => setSelectedStation(st.id)}
                  style={{
                    backgroundColor: '#0f172a',
                    borderColor: st.color,
                    top: `${topPos}%`,
                    left: `${leftPos}%`
                  }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center space-x-1.5 px-2.5 py-1 rounded-full border shadow-xl transition-all duration-200 ${
                    isSelected ? 'scale-110 ring-2 ring-cyan-400 z-30' : 'hover:scale-105 z-10'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" style={{ color: st.color }} />
                  <span className="text-[11px] font-bold font-mono" style={{ color: st.color }}>
                    {st.name}: {val}
                  </span>
                </button>
              )
            })}

            <div className="absolute bottom-3 left-3 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] text-slate-400 font-mono">
              Center: 28.6139°N, 77.2090°E · Scale: 1:40,000
            </div>
          </div>

          {/* Map Legend */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="font-semibold">CPCB Severity Legend:</span>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#00E400]"></span> Good</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#9CFF00]"></span> Satisfactory</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#FFFF00]"></span> Moderate</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#FF7E00]"></span> Poor</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#FF0000]"></span> Very Poor</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#99004C]"></span> Severe</span>
            </div>
          </div>
        </div>

        {/* Selected Station Details Card */}
        {activeStation && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-bold text-slate-100">{activeStation.name}</h3>
                <p className="text-xs text-slate-400">{activeStation.city} NCR ({activeStation.lat.toFixed(2)}°N, {activeStation.lon.toFixed(2)}°E)</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded text-cyan-300 bg-cyan-500/20 border border-cyan-500/30">
                {activeStation.type}
              </span>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-center">
              <span className="text-xs text-slate-400 font-medium">Station AQI Score</span>
              <div className="text-4xl font-extrabold" style={{ color: activeStation.color }}>{activeStation.aqi}</div>
              <span className="inline-block px-3 py-0.5 rounded text-xs font-bold text-white" style={{ backgroundColor: activeStation.color }}>
                {activeStation.category}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">Pollutant Breakdown</span>
              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                  <span className="text-slate-300">PM2.5</span>
                  <span className="font-bold text-amber-400">{activeStation.pm25} µg/m³</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                  <span className="text-slate-300">PM10</span>
                  <span className="font-bold text-rose-400">{activeStation.pm10} µg/m³</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                  <span className="text-slate-300">NO2</span>
                  <span className="font-bold text-sky-400">{activeStation.no2} µg/m³</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                  <span className="text-slate-300">O3</span>
                  <span className="font-bold text-emerald-400">{activeStation.o3} µg/m³</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
