import { AnimatePresence, motion } from 'framer-motion'
import { useId, useState, type ReactNode } from 'react'
import type { Estado } from '../data/types'
import { cx, fmt } from '../lib/format'
import { CountUp, Delta, InfoTip, estadoInfo } from './ui'

export const estadoColor: Record<Estado, string> = { ok: 'var(--color-leaf-500)', atencion: 'var(--color-warn-500)', riesgo: 'var(--color-risk-500)' }

// ---------------------------------------------------------------------------
// Tendencia semanal: línea mini (sparkline) con el valor al pasar el cursor
// ---------------------------------------------------------------------------
export function TendenciaSemanal({
  data, semanas, color = estadoColor.ok, formato, compact = false, delay = 0, ancho = false,
}: { data: number[]; semanas?: string[]; color?: string; formato: (v: number) => string; compact?: boolean; delay?: number; ancho?: boolean }) {
  const [hover, setHover] = useState<number | null>(null)
  const gid = useId().replace(/:/g, '')
  if (data.length < 2) return null
  const n = data.length
  const W = 100
  const H = compact ? 18 : ancho ? 24 : 28
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const xs = (i: number) => (i / (n - 1)) * W
  const ys = (v: number) => H - 3 - ((v - min) / span) * (H - 6)
  const path = data.map((v, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(2)},${ys(v).toFixed(2)}`).join(' ')
  const area = `${path} L${W},${H} L0,${H} Z`
  const etiqueta = (i: number) => (semanas?.[i] ? semanas[i].replace('S', 'Sem. ') : `Semana ${i + 1}`)
  const punto = hover ?? n - 1
  return (
    <div className={cx('relative shrink-0', ancho ? 'w-full' : compact ? 'w-[54px]' : 'w-[84px]')} style={{ height: H }} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {!compact && <motion.path d={area} fill={`url(#${gid})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.6, duration: 0.6 }} />}
        <motion.path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: 'easeOut', delay: delay + 0.15 }}
        />
      </svg>
      <motion.span
        className="pointer-events-none absolute h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: color, left: `${(xs(punto) / W) * 100}%`, top: ys(data[punto]) }}
        initial={{ scale: 0 }}
        animate={{ scale: hover !== null ? 1.5 : 1 }}
        transition={{ delay: hover !== null ? 0 : delay + 1.15 }}
      />
      {/* zonas de hover por semana */}
      <div className="absolute inset-0 flex">
        {data.map((_, i) => (
          <div key={i} className="h-full flex-1" onMouseEnter={() => setHover(i)} />
        ))}
      </div>
      <AnimatePresence>
        {hover !== null && (
          <motion.div
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute right-0 bottom-full z-20 mb-1.5 rounded-md bg-leaf-950 px-2 py-1 text-[10px] whitespace-nowrap text-white shadow-lift"
          >
            <span className="text-leaf-200">{hover === n - 1 ? 'Esta semana' : etiqueta(hover)}:</span> <b className="tabular">{formato(data[hover])}</b>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tarjeta KPI
// ---------------------------------------------------------------------------
export function KpiCard({
  label, tip, value, dec = 0, unit, delta, deltaDec = 1, deltaUnit = '', mejorSiSube = true, serie, semanas, estado = 'ok', sub, delay = 0, deltaSuffix = 'vs sem. ant.',
}: {
  label: string; tip: string; value: number; dec?: number; unit?: string; delta?: number; deltaDec?: number; deltaUnit?: string
  mejorSiSube?: boolean; serie?: number[]; semanas?: string[]; estado?: Estado; sub?: ReactNode; delay?: number; deltaSuffix?: string
}) {
  const fuera = estado !== 'ok'
  const formato = (v: number) => `${fmt(v, dec)}${unit ? (unit === '%' ? ' %' : ` ${unit}`) : ''}`
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className={cx(
        '@container relative flex min-w-0 flex-col justify-between rounded-2xl border bg-white p-4 shadow-card transition-shadow hover:shadow-lift',
        fuera ? (estado === 'riesgo' ? 'border-risk-100' : 'border-warn-100') : 'border-leaf-100',
      )}
    >
      {fuera && <span className="absolute inset-y-3 left-0 w-1 rounded-r" style={{ background: estadoColor[estado] }} />}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1 text-xs font-medium text-leaf-800/75">
          <span className="leading-tight">{label}</span>
          <InfoTip text={tip} />
        </div>
        {fuera && (
          <InfoTip text={estado === 'riesgo' ? 'Fuera del rango esperado' : 'Cerca del límite del rango esperado'}>
            <span className={cx('grid h-5 w-5 shrink-0 place-items-center rounded-full', estadoInfo[estado].bg, estadoInfo[estado].text)}>
              {(() => {
                const I = estadoInfo[estado].Icon
                return <I className="h-3 w-3" />
              })()}
            </span>
          </InfoTip>
        )}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="flex min-w-0 items-baseline gap-1">
            <CountUp value={value} dec={dec} className={cx('font-display text-[26px] leading-none font-semibold tracking-tight', fuera ? estadoInfo[estado].text : 'text-leaf-950')} />
            {unit && <span className="truncate text-xs font-medium text-leaf-700/75">{unit}</span>}
          </div>
          <div className="mt-1.5 min-h-[16px] whitespace-nowrap">
            {delta !== undefined && <Delta value={delta} dec={deltaDec} unit={deltaUnit} mejorSiSube={mejorSiSube} suffix={deltaSuffix} />}
          </div>
        </div>
        {serie && (
          <div className="hidden @[14rem]:block">
            <TendenciaSemanal data={serie.slice(-8)} semanas={semanas?.slice(-8)} color={estadoColor[estado]} formato={formato} delay={delay} />
          </div>
        )}
      </div>
      {serie && (
        <div className="mt-2 @[14rem]:hidden">
          <TendenciaSemanal ancho data={serie.slice(-8)} semanas={semanas?.slice(-8)} color={estadoColor[estado]} formato={formato} delay={delay} />
        </div>
      )}
      {sub && <div className="mt-1 text-[11px] text-leaf-700/80">{sub}</div>}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Barra de rango con referencias (proyección vs historial)
// ---------------------------------------------------------------------------
function ticksBonitos(min: number, max: number, n = 6) {
  const raw = (max - min) / n
  const pot = Math.pow(10, Math.floor(Math.log10(raw)))
  const paso = [1, 2, 2.5, 5, 10].map((m) => m * pot).find((s) => s >= raw) ?? raw
  const out: number[] = []
  for (let v = Math.ceil(min / paso) * paso; v <= max + 1e-9; v += paso) out.push(Number(v.toFixed(6)))
  return out
}

const TrianguloAbajo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 10 7" className={className} aria-hidden>
    <path d="M0 0h10L5 7z" fill="currentColor" />
  </svg>
)
const TrianguloArriba = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 10 7" className={className} aria-hidden>
    <path d="M1 6.2h8L5 0.8z" fill="white" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
)

/** Leyenda de la barra de rango; con `valores` muestra también las cifras. */
export function RangoLeyenda({ valores, dec = 1, estado = 'ok' }: { valores?: { p10: number; p50: number; p90: number; mejor?: number; promedio?: number }; dec?: number; estado?: Estado }) {
  const color = estadoColor[estado]
  const v = valores
  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] text-leaf-800/80">
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full border-2 border-white shadow ring-1 ring-black/5" style={{ background: color }} />
        Probable{v && <b className="tabular text-leaf-950">{fmt(v.p50, dec)}</b>}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-4 rounded-full" style={{ background: color, opacity: 0.3 }} />
        Rango{v && <b className="tabular text-leaf-950">{fmt(v.p10, dec)}–{fmt(v.p90, dec)}</b>}
      </span>
      <span className="flex items-center gap-1.5">
        <TrianguloAbajo className="h-2 w-2.5 text-leaf-950" />
        Mejor temporada{v?.mejor !== undefined && <b className="tabular text-leaf-950">{fmt(v.mejor, dec)}</b>}
      </span>
      <span className="flex items-center gap-1.5">
        <TrianguloArriba className="h-2 w-2.5 text-leaf-700" />
        Promedio{v?.promedio !== undefined && <b className="tabular text-leaf-950">{fmt(v.promedio, dec)}</b>}
      </span>
    </div>
  )
}

/** Eje con marcas para una escala compartida. */
export function EjeRango({ min, max, unit }: { min: number; max: number; unit?: string }) {
  const ticks = ticksBonitos(min, max)
  const pos = (v: number) => `${((v - min) / (max - min)) * 100}%`
  return (
    <div className="relative h-3.5 text-[10px] text-leaf-700/75 tabular">
      {ticks.map((t, i) => (
        <span key={t} className="absolute top-0 -translate-x-1/2 whitespace-nowrap" style={{ left: pos(t) }}>
          {fmt(t)}
          {unit && i === ticks.length - 1 ? ` ${unit}` : ''}
        </span>
      ))}
    </div>
  )
}

export function RangeBar({
  p10, p50, p90, promedio, mejor, min, max, unit = 't/ha', dec = 1, estado = 'ok', variant = 'full', delay = 0, grid = false,
}: {
  p10: number; p50: number; p90: number; promedio?: number; mejor?: number; min: number; max: number; unit?: string; dec?: number
  estado?: Estado; variant?: 'full' | 'compact'; delay?: number; grid?: boolean
}) {
  const [hover, setHover] = useState(false)
  const pos = (v: number) => `${Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100))}%`
  const color = estadoColor[estado]
  const full = variant === 'full'
  const h = full ? 10 : 8
  const ticks = full || grid ? ticksBonitos(min, max) : []

  return (
    <div className="relative" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {full && (
        <div className="mb-3">
          <RangoLeyenda valores={{ p10, p50, p90, mejor, promedio }} dec={dec} estado={estado} />
        </div>
      )}
      <div className="relative py-2.5">
        {/* líneas de la escala */}
        {ticks.map((t) => (
          <div key={t} className="absolute inset-y-0 w-px bg-leaf-100" style={{ left: pos(t) }} />
        ))}
        <div className="relative rounded-full bg-leaf-50 ring-1 ring-leaf-100/70" style={{ height: h }}>
          <motion.div
            className="absolute inset-y-0 rounded-full"
            style={{ background: color, opacity: 0.3 }}
            initial={{ left: pos(p50), right: `calc(100% - ${pos(p50)})` }}
            animate={{ left: pos(p10), right: `calc(100% - ${pos(p90)})` }}
            transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
          />
          {promedio !== undefined && (
            <div className="absolute inset-y-0" style={{ left: pos(promedio) }}>
              <div className="absolute inset-y-0 w-px -translate-x-1/2 bg-leaf-700/60" />
              <TrianguloArriba className="absolute top-full mt-0.5 h-[7px] w-2.5 -translate-x-1/2 text-leaf-700" />
            </div>
          )}
          {mejor !== undefined && (
            <div className="absolute inset-y-0" style={{ left: pos(mejor) }}>
              <div className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-leaf-950" />
              <TrianguloAbajo className="absolute bottom-full mb-0.5 h-[7px] w-2.5 -translate-x-1/2 text-leaf-950" />
            </div>
          )}
          <motion.div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
            style={{ background: color, width: h + 6, height: h + 6 }}
            initial={{ left: pos(min), opacity: 0 }}
            animate={{ left: pos(p50), opacity: 1 }}
            transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
      {full && <EjeRango min={min} max={max} unit={unit} />}

      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: 4, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, x: '-50%' }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute bottom-full z-30 mb-1 rounded-lg bg-leaf-950 px-2.5 py-1.5 text-[11px] whitespace-nowrap text-white shadow-lift"
            style={{ left: pos(p50) }}
          >
            <div>
              Probable <b className="tabular">{fmt(p50, dec)} {unit}</b>
            </div>
            <div className="text-leaf-200 tabular">
              Rango {fmt(p10, dec)}–{fmt(p90, dec)}
              {mejor !== undefined && ` · Mejor ${fmt(mejor, dec)}`}
              {promedio !== undefined && ` · Prom. ${fmt(promedio, dec)}`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
