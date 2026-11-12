import { AnimatePresence, motion } from 'framer-motion'
import { Apple, Avocado, Bell, CalendarDays, Check, Cherry, ChevronDown, FlaskConical, LayoutDashboard, MapPin } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { prediosCalc, type PredioCalc } from '../data'
import { numeroSemana } from '../data/model'
import type { EspecieId } from '../data/types'
import { cx, fechaLarga } from '../lib/format'
import { estadoInfo } from './ui'

export const especieIcon: Record<EspecieId, typeof Apple> = { manzano: Apple, cerezo: Cherry, palto: Avocado }

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-leaf-900 shadow-card">
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden>
          <path d="M16 25c-5-2-8-6-8-11 4 0 7 2 8 5 1-3 4-5 8-5 0 5-3 9-8 11z" fill="#8fd19e" />
          <path d="M16 19V8" stroke="#c5e0cc" strokeWidth="2" strokeLinecap="round" />
          <circle cx="16" cy="7" r="2" fill="#c5e0cc" />
        </svg>
      </div>
      {!compact && (
        <div className="leading-none">
          <div className="font-display text-xl font-bold tracking-tight text-leaf-900">Rencal</div>
          <div className="mt-1 text-[10px] font-medium tracking-wide text-leaf-600/80 uppercase">Rendimiento y calibre</div>
        </div>
      )}
    </div>
  )
}

export type Vista = { tipo: 'panel' } | { tipo: 'cuartel'; id: string } | { tipo: 'alertas'; cuartel?: string }

export function Sidebar({ predio, vista, onNavegar }: { predio: PredioCalc; vista: Vista; onNavegar: (v: Vista) => void }) {
  const activas = predio.alertas.filter((a) => a.severidad !== 'baja').length
  const items = [
    { id: 'panel', label: 'Panel del huerto', Icon: LayoutDashboard, onClick: () => onNavegar({ tipo: 'panel' }), activo: vista.tipo === 'panel' },
    { id: 'alertas', label: 'Centro de alertas', Icon: Bell, onClick: () => onNavegar({ tipo: 'alertas' }), activo: vista.tipo === 'alertas', badge: activas },
  ]
  return (
    <aside className="sticky top-0 hidden h-screen w-[76px] shrink-0 flex-col border-r border-leaf-100 bg-white/80 backdrop-blur md:flex xl:w-[252px]">
      <div className="flex h-16 items-center px-5">
        <div className="xl:hidden">
          <Logo compact />
        </div>
        <div className="hidden xl:block">
          <Logo />
        </div>
      </div>
      <nav className="mt-3 flex flex-col gap-1 px-3">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={it.onClick}
            title={it.label}
            className={cx(
              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              it.activo ? 'text-leaf-900' : 'text-leaf-800/70 hover:bg-leaf-50 hover:text-leaf-900',
            )}
          >
            {it.activo && <motion.span layoutId="nav-activo" className="absolute inset-0 rounded-xl bg-leaf-100" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
            <it.Icon className="relative h-5 w-5 shrink-0" />
            <span className="relative hidden xl:inline">{it.label}</span>
            {!!it.badge && (
              <span className="relative ml-auto hidden rounded-full bg-risk-500 px-1.5 py-0.5 text-[10px] leading-none font-bold text-white xl:inline">{it.badge}</span>
            )}
            {!!it.badge && <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-risk-500 xl:hidden" />}
          </button>
        ))}
      </nav>

      <div className="mt-6 px-6 text-[10px] font-semibold tracking-wider text-leaf-700/70 uppercase">
        <span className="hidden xl:inline">Cuarteles · {predio.huerto}</span>
        <span className="xl:hidden">Cuart.</span>
      </div>
      <div className="scroll-soft mt-2 flex-1 overflow-y-auto px-3 pb-4">
        {predio.cuartelesCalc.map((c) => {
          const activo = vista.tipo === 'cuartel' && vista.id === c.id
          return (
            <button
              key={c.id}
              onClick={() => onNavegar({ tipo: 'cuartel', id: c.id })}
              title={c.nombre}
              className={cx(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-colors',
                activo ? 'bg-leaf-50 font-semibold text-leaf-900' : 'text-leaf-800/75 hover:bg-leaf-50/70 hover:text-leaf-900',
              )}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-[4px]" style={{ background: estadoInfo[c.estado].color }} />
              <span className="hidden truncate xl:inline">{c.nombre}</span>
              <span className="tabular text-xs xl:hidden">{c.numero}</span>
            </button>
          )
        })}
      </div>
      <div className="m-3 hidden rounded-xl bg-leaf-50 p-3 text-[11px] leading-snug text-leaf-800/80 xl:block">
        <div className="flex items-center gap-1.5 font-semibold text-leaf-800">
          <FlaskConical className="h-3.5 w-3.5" /> Prototipo
        </div>
        Datos simulados con fines de prueba. No reflejan predios reales.
      </div>
    </aside>
  )
}

export function TopBar({ predio, onPredio, onNavegar, vista }: { predio: PredioCalc; onPredio: (id: string) => void; onNavegar: (v: Vista) => void; vista: Vista }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const Icon = especieIcon[predio.especie]
  return (
    <header className="sticky top-0 z-[1100] border-b border-leaf-100 bg-[#f5f9f6]/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="md:hidden">
          <Logo compact />
        </div>
        <div ref={ref} className="relative min-w-0">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex min-w-0 items-center gap-3 rounded-xl border border-leaf-100 bg-white py-1.5 pr-3 pl-1.5 text-left shadow-card transition hover:border-leaf-200"
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-leaf-100 text-leaf-700">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-leaf-900">{predio.nombre}</span>
              <span className="block truncate text-[11px] text-leaf-700/70">
                {predio.esp.nombre} · {predio.region}, {predio.pais}
              </span>
            </span>
            <ChevronDown className={cx('h-4 w-4 shrink-0 text-leaf-600 transition-transform', open && 'rotate-180')} />
          </button>
          <AnimatePresence>
            {open && (
              <motion.ul
                role="listbox"
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.16 }}
                className="absolute top-full left-0 mt-2 w-[min(460px,calc(100vw-2rem))] origin-top-left rounded-2xl border border-leaf-100 bg-white p-1.5 shadow-lift"
              >
                <li className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-leaf-700/70 uppercase">Predio y cultivo</li>
                {prediosCalc.map((p) => {
                  const I = especieIcon[p.especie]
                  const riesgo = p.cuartelesCalc.filter((c) => c.estado === 'riesgo').length
                  return (
                    <li key={p.id}>
                      <button
                        role="option"
                        aria-selected={p.id === predio.id}
                        onClick={() => {
                          onPredio(p.id)
                          setOpen(false)
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-leaf-50"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-leaf-50 text-leaf-700">
                          <I className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-leaf-900">{p.nombre}</span>
                          <span className="flex items-center gap-1 truncate text-[11px] text-leaf-700/70">
                            <MapPin className="h-3 w-3" /> {p.region}, {p.pais} · {p.esp.nombre}
                          </span>
                        </span>
                        {riesgo > 0 && <span className="rounded-full bg-risk-50 px-2 py-0.5 text-[10px] font-semibold text-risk-700">{riesgo} en riesgo</span>}
                        {p.id === predio.id && <Check className="h-4 w-4 text-leaf-600" />}
                      </button>
                    </li>
                  )
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl px-3 py-2 text-xs text-leaf-800/80 lg:flex">
            <CalendarDays className="h-4 w-4 text-leaf-600" />
            <span>
              {fechaLarga(predio.fechaHoy)} · <span className="font-semibold">Semana {numeroSemana(predio.fechaHoy)}</span>
            </span>
          </div>
          <span className="hidden rounded-full bg-leaf-100 px-2.5 py-1 text-[11px] font-semibold text-leaf-700 sm:inline">Datos simulados</span>
          <button
            onClick={() => onNavegar({ tipo: 'alertas' })}
            className={cx('relative grid h-10 w-10 place-items-center rounded-xl border border-leaf-100 bg-white shadow-card transition hover:border-leaf-200 md:hidden', vista.tipo === 'alertas' && 'bg-leaf-100')}
            aria-label="Centro de alertas"
          >
            <Bell className="h-5 w-5 text-leaf-700" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-risk-500" />
          </button>
        </div>
      </div>
    </header>
  )
}
