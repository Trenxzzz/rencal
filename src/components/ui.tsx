import { animate, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, OctagonAlert } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { Estado, Severidad } from '../data/types'
import { cx, fmt } from '../lib/format'

// ---------- Tarjeta ----------
export function Card({ children, className, delay = 0, as = 'section' }: { children: ReactNode; className?: string; delay?: number; as?: 'section' | 'div' }) {
  const Comp = as === 'section' ? motion.section : motion.div
  return (
    <Comp
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cx('rounded-2xl border border-leaf-100 bg-white shadow-card', className)}
    >
      {children}
    </Comp>
  )
}

export function CardTitle({ children, sub, tip, right, icon }: { children: ReactNode; sub?: ReactNode; tip?: string; right?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="flex items-center gap-1.5 font-display text-[15px] font-semibold tracking-tight text-leaf-900">
          {icon}
          {children}
          {tip && <InfoTip text={tip} />}
        </h3>
        {sub && <p className="mt-0.5 text-xs text-leaf-700/70">{sub}</p>}
      </div>
      {right}
    </div>
  )
}

// ---------- Tooltip (portal, no se recorta) ----------
export function InfoTip({ text, children, className }: { text: ReactNode; children?: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number; below: boolean } | null>(null)
  const id = useId()

  useLayoutEffect(() => {
    if (!open || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const below = r.top < 140
    const x = Math.min(Math.max(r.left + r.width / 2, 150), window.innerWidth - 150)
    setPos({ x, y: below ? r.bottom + 8 : r.top - 8, below })
  }, [open])

  return (
    <span
      ref={ref}
      className={cx('inline-flex cursor-help items-center', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      aria-describedby={open ? id : undefined}
    >
      {children ?? <Info className="h-3.5 w-3.5 text-leaf-400 transition-colors hover:text-leaf-600" aria-label="Más información" />}
      {open &&
        pos &&
        createPortal(
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: pos.below ? -4 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            style={{ left: pos.x, top: pos.y, transform: `translate(-50%, ${pos.below ? '0' : '-100%'})` }}
            className="pointer-events-none fixed z-[2000] block w-max max-w-[280px] rounded-xl bg-leaf-950 px-3 py-2 text-left text-xs leading-relaxed font-normal text-leaf-50 shadow-lift"
          >
            {text}
          </motion.span>,
          document.body,
        )}
    </span>
  )
}

// ---------- Número que sube ----------
export function CountUp({ value, dec = 0, duration = 1.1, className }: { value: number; dec?: number; duration?: number; className?: string }) {
  const [v, setV] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const ctrl = animate(prev.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (x) => setV(x),
    })
    prev.current = value
    return () => ctrl.stop()
  }, [value, duration])
  return <span className={cx('tabular', className)}>{fmt(v, dec)}</span>
}

// ---------- Sparkline ----------
export function Sparkline({ data, color = 'var(--color-leaf-500)', width = 84, height = 28, fill = true, className }: { data: number[]; color?: string; width?: number; height?: number; fill?: boolean; className?: string }) {
  const gid = useId().replace(/:/g, '')
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const pts = data.map((d, i) => [(i / (data.length - 1)) * (width - 4) + 2, height - 3 - ((d - min) / span) * (height - 6)])
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${path} L${pts[pts.length - 1][0]},${height} L${pts[0][0]},${height} Z`
  const last = pts[pts.length - 1]
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {fill && <motion.path d={area} fill={`url(#${gid})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }} />}
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
      />
      <motion.circle cx={last[0]} cy={last[1]} r={2.5} fill={color} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.15 }} />
    </svg>
  )
}

// ---------- Estados ----------
export const estadoInfo: Record<Estado, { label: string; color: string; bg: string; text: string; ring: string; Icon: typeof CheckCircle2 }> = {
  ok: { label: 'En línea', color: '#3f9a5c', bg: 'bg-leaf-50', text: 'text-leaf-700', ring: 'ring-leaf-200', Icon: CheckCircle2 },
  atencion: { label: 'Atención', color: '#e0a106', bg: 'bg-warn-50', text: 'text-warn-700', ring: 'ring-warn-100', Icon: AlertTriangle },
  riesgo: { label: 'Riesgo', color: '#d64545', bg: 'bg-risk-50', text: 'text-risk-700', ring: 'ring-risk-100', Icon: OctagonAlert },
}

export const sevInfo: Record<Severidad, { label: string; dot: string; bg: string; text: string; ring: string; border: string }> = {
  alta: { label: 'Alta', dot: 'bg-risk-500', bg: 'bg-risk-50', text: 'text-risk-700', ring: 'ring-risk-100', border: 'border-l-risk-500' },
  media: { label: 'Media', dot: 'bg-warn-500', bg: 'bg-warn-50', text: 'text-warn-700', ring: 'ring-warn-100', border: 'border-l-warn-500' },
  baja: { label: 'Baja', dot: 'bg-leaf-400', bg: 'bg-leaf-50', text: 'text-leaf-700', ring: 'ring-leaf-100', border: 'border-l-leaf-300' },
}

export function EstadoBadge({ estado, size = 'sm' }: { estado: Estado; size?: 'sm' | 'md' }) {
  const e = estadoInfo[estado]
  return (
    <span className={cx('inline-flex shrink-0 items-center gap-1 rounded-full font-semibold ring-1', e.bg, e.text, e.ring, size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs')}>
      <e.Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {e.label}
    </span>
  )
}

export function SevDot({ sev, pulse = true }: { sev: Severidad; pulse?: boolean }) {
  const s = sevInfo[sev]
  return (
    <span className="relative inline-flex h-2.5 w-2.5 shrink-0">
      {pulse && sev !== 'baja' && <span className={cx('pulse-ring absolute inset-0 rounded-full', s.dot)} />}
      <span className={cx('relative inline-flex h-2.5 w-2.5 rounded-full', s.dot)} />
    </span>
  )
}

export function SevBadge({ sev }: { sev: Severidad }) {
  const s = sevInfo[sev]
  return (
    <span className={cx('inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1', s.bg, s.text, s.ring)}>
      <SevDot sev={sev} />
      Severidad {s.label.toLowerCase()}
    </span>
  )
}

export function Delta({ value, dec = 1, unit = '%', mejorSiSube = true, suffix }: { value: number; dec?: number; unit?: string; mejorSiSube?: boolean; suffix?: string }) {
  const neutral = Math.abs(value) < Math.pow(10, -dec) / 2
  const bueno = neutral ? null : value > 0 === mejorSiSube
  return (
    <span className={cx('tabular inline-flex items-center gap-0.5 text-[11px] font-semibold', bueno === null ? 'text-leaf-700/75' : bueno ? 'text-leaf-600' : 'text-leaf-900/60')}>
      {neutral ? '±' : value > 0 ? '▲' : '▼'} {fmt(Math.abs(value), dec)}
      {unit && <span className="font-medium">{unit}</span>}
      {suffix && <span className="ml-0.5 font-normal text-leaf-700/70">{suffix}</span>}
    </span>
  )
}
