import { AnimatePresence, motion } from 'framer-motion'
import L from 'leaflet'
import { MousePointerClick } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polygon, TileLayer, ZoomControl, useMap } from 'react-leaflet'
import type { PredioCalc } from '../data'
import type { CuartelCalc } from '../data/model'
import { rng } from '../data/model'
import { fmt, pct } from '../lib/format'
import { EstadoBadge, estadoInfo } from './ui'

type LatLng = [number, number]

/** Genera polígonos de cuarteles alrededor del centro del predio (geometría simulada). */
export function poligonos(p: PredioCalc): Record<string, LatLng[]> {
  const out: Record<string, LatLng[]> = {}
  const filas = [...new Set(p.cuarteles.map((c) => c.fila))].sort()
  const gap = 12
  const calle = 22
  const alto = p.filaAlto
  const totalAlto = filas.length * alto + (filas.length - 1) * calle
  const ang = (p.rotacion * Math.PI) / 180
  const [lat0, lng0] = p.centro
  const mLat = 1 / 111320
  const mLng = 1 / (111320 * Math.cos((lat0 * Math.PI) / 180))
  const toLL = (x: number, y: number): LatLng => {
    const xr = x * Math.cos(ang) - y * Math.sin(ang)
    const yr = x * Math.sin(ang) + y * Math.cos(ang)
    return [lat0 + yr * mLat, lng0 + xr * mLng]
  }
  filas.forEach((f, fi) => {
    const cs = p.cuarteles.filter((c) => c.fila === f)
    const anchos = cs.map((c) => (c.ha * 10000) / alto)
    const total = anchos.reduce((a, b) => a + b, 0) + gap * (cs.length - 1)
    let x = -total / 2
    const yTop = totalAlto / 2 - fi * (alto + calle)
    cs.forEach((c, i) => {
      const r = rng(c.id)
      const j = () => (r() - 0.5) * 8
      const w = anchos[i]
      out[c.id] = [toLL(x + j(), yTop + j()), toLL(x + w + j(), yTop + j()), toLL(x + w + j(), yTop - alto + j()), toLL(x + j(), yTop - alto + j())]
      x += w + gap
    })
  })
  return out
}

const centroide = (pts: LatLng[]): LatLng => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length]

function AutoResize() {
  const map = useMap()
  useEffect(() => {
    const el = map.getContainer()
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(el)
    return () => ro.disconnect()
  }, [map])
  return null
}

export function OrchardMap({ predio, onSelect, selected, height = 420 }: { predio: PredioCalc; onSelect: (id: string) => void; selected?: string; height?: number }) {
  const polys = useMemo(() => poligonos(predio), [predio])
  const [hover, setHover] = useState<string | null>(null)
  const bounds = useMemo(() => L.latLngBounds(Object.values(polys).flat()), [polys])
  const hoverC: CuartelCalc | undefined = predio.cuartelesCalc.find((c) => c.id === hover)

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ height }}>
      <MapContainer
        key={predio.id}
        bounds={bounds}
        boundsOptions={{ paddingTopLeft: [36, 52], paddingBottomRight: [36, 64] }}
        scrollWheelZoom={false}
        zoomSnap={0.25}
        className="h-full w-full"
        attributionControl
        zoomControl={false}
      >
        <ZoomControl position="topleft" zoomInTitle="Acercar" zoomOutTitle="Alejar" />
        <AutoResize />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Imágenes &copy; Esri — Esri, Maxar, Earthstar Geographics y la comunidad de usuarios GIS"
          maxNativeZoom={18}
          maxZoom={19}
        />
        {predio.cuartelesCalc.map((c) => {
          const e = estadoInfo[c.estado]
          const activo = hover === c.id || selected === c.id
          return (
            <Polygon
              key={c.id}
              positions={polys[c.id]}
              pathOptions={{
                color: activo ? '#ffffff' : e.color,
                weight: activo ? 3.5 : 2,
                fillColor: e.color,
                fillOpacity: activo ? 0.55 : c.estado === 'ok' ? 0.28 : 0.4,
                className: `cuartel-poly${c.estado === 'riesgo' ? ' cuartel-riesgo' : ''}`,
              }}
              eventHandlers={{
                mouseover: () => setHover(c.id),
                mouseout: () => setHover((h) => (h === c.id ? null : h)),
                click: () => onSelect(c.id),
              }}
            />
          )
        })}
        {predio.cuartelesCalc.map((c) => (
          <Marker
            key={c.id + '-lbl'}
            position={centroide(polys[c.id])}
            interactive={false}
            icon={L.divIcon({
              className: 'cuartel-label',
              html: `<div style="transform:translate(-50%,-50%);display:inline-flex;align-items:center;gap:4px;white-space:nowrap;background:rgba(255,255,255,.92);color:#0d2217;border-radius:999px;padding:3px 8px 3px 6px;font:600 11px 'Plus Jakarta Sans',sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.25)"><span style="width:8px;height:8px;border-radius:3px;background:${estadoInfo[c.estado].color}"></span>C${c.numero}</div>`,
              iconSize: [0, 0],
            })}
          />
        ))}
      </MapContainer>

      {/* Leyenda */}
      <div className="pointer-events-none absolute bottom-7 left-3 z-[500] flex items-center gap-3 rounded-full bg-white/92 px-3 py-1.5 text-[11px] text-leaf-800/85 shadow-lift backdrop-blur">
        {(['ok', 'atencion', 'riesgo'] as const).map((k) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: estadoInfo[k].color }} />
            {k === 'ok' ? 'En línea' : k === 'atencion' ? 'Atención' : 'Riesgo'}
          </span>
        ))}
      </div>

      {!hoverC && (
        <div className="pointer-events-none absolute top-3 left-1/2 z-[500] flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-leaf-950/75 px-3 py-1.5 text-[11px] font-medium whitespace-nowrap text-white backdrop-blur">
          <MousePointerClick className="h-3.5 w-3.5" /> Haz clic en un cuartel para ver su detalle
        </div>
      )}

      {/* Ficha al pasar el cursor */}
      <AnimatePresence>
        {hoverC && (
          <motion.div
            key={hoverC.id}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-none absolute right-3 bottom-7 z-[500] w-[250px] rounded-2xl border border-leaf-100 bg-white/95 p-3.5 shadow-lift backdrop-blur"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-leaf-900">{hoverC.nombre}</div>
                <div className="text-[11px] text-leaf-700/70">
                  {fmt(hoverC.ha, 1)} ha · {fmt(hoverC.arboles)} árboles
                </div>
              </div>
              <EstadoBadge estado={hoverC.estado} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg bg-leaf-50 p-2">
                <div className="text-leaf-700/70">Rendimiento</div>
                <div className="tabular text-sm font-semibold text-leaf-900">
                  {fmt(hoverC.rend.p50, 1)} <span className="text-[10px] font-medium">t/ha</span>
                </div>
              </div>
              <div className={`rounded-lg p-2 ${estadoInfo[hoverC.estado].bg}`}>
                <div className="text-leaf-700/70">Calibre comercial</div>
                <div className={`tabular text-sm font-semibold ${hoverC.estado === 'ok' ? 'text-leaf-900' : estadoInfo[hoverC.estado].text}`}>
                  {pct(hoverC.comercial)} <span className="text-[10px] font-medium text-leaf-700/70">meta {pct(hoverC.esp.metaComercial)}</span>
                </div>
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-snug text-leaf-800/80">{hoverC.resumen}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
