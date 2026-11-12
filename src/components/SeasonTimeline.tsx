import { motion } from 'framer-motion'
import { Flower2, Grape, Sprout, Tractor } from 'lucide-react'
import { diasEntre } from '../data/model'
import type { Especie } from '../data/types'
import { cx, fechaCorta } from '../lib/format'

const iconos = { flor: Flower2, cuaja: Sprout, crec: Grape, cosecha: Tractor } as const

export function etapaActual(esp: Especie, hoy: string) {
  return esp.etapas.find((e) => hoy >= e.inicio && hoy <= e.fin) ?? esp.etapas[esp.etapas.length - 1]
}

export function SeasonTimeline({ esp, hoy, compact = false }: { esp: Especie; hoy: string; compact?: boolean }) {
  const inicio = esp.etapas[0].inicio
  const fin = esp.etapas[esp.etapas.length - 1].fin
  const total = diasEntre(inicio, fin)
  const hoyPct = Math.min(100, Math.max(0, (diasEntre(inicio, hoy) / total) * 100))
  const actual = etapaActual(esp, hoy)
  const diasRestantes = diasEntre(hoy, actual.fin)

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="text-xs text-leaf-700/70">
          Etapa actual · <span className="font-semibold text-leaf-900">{actual.nombre}</span>
          <span className="text-leaf-700/75"> · quedan {diasRestantes} días</span>
        </div>
        {!compact && <div className="text-[11px] text-leaf-700/75">{actual.descripcion}</div>}
      </div>
      <div className="relative mt-7">
        <div className="flex h-9 gap-1">
          {esp.etapas.map((e, i) => {
            const w = (diasEntre(e.inicio, e.fin) / total) * 100
            const pasada = e.fin < hoy
            const esActual = e.id === actual.id
            const Icon = iconos[e.id as keyof typeof iconos] ?? Sprout
            const progreso = esActual ? Math.min(100, (diasEntre(e.inicio, hoy) / diasEntre(e.inicio, e.fin)) * 100) : pasada ? 100 : 0
            return (
              <div key={e.id} className="relative min-w-0" style={{ width: `${w}%` }}>
                <div
                  className={cx(
                    'relative flex h-full items-center gap-1.5 overflow-hidden rounded-lg px-2 text-[11px] font-semibold',
                    esActual ? 'bg-leaf-100 text-leaf-900 ring-1 ring-leaf-300' : pasada ? 'bg-leaf-50 text-leaf-700/70' : 'bg-leaf-25 text-leaf-700/70 ring-1 ring-leaf-100',
                  )}
                  title={`${e.nombre}: ${fechaCorta(e.inicio)} – ${fechaCorta(e.fin)}`}
                >
                  <motion.div
                    className={cx('absolute inset-y-0 left-0', esActual ? 'bg-leaf-300/60' : 'bg-leaf-100/60')}
                    initial={{ width: 0 }}
                    animate={{ width: `${progreso}%` }}
                    transition={{ duration: 1, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <Icon className="relative h-3.5 w-3.5 shrink-0" />
                  <span className="relative truncate">{e.nombre}</span>
                </div>
              </div>
            )
          })}
        </div>
        <motion.div
          className="pointer-events-none absolute -top-[26px] z-10 flex -translate-x-1/2 flex-col items-center"
          initial={{ left: '0%', opacity: 0 }}
          animate={{ left: `${hoyPct}%`, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="rounded-md bg-leaf-900 px-1.5 py-0.5 text-[10px] font-bold whitespace-nowrap text-white shadow">Hoy · {fechaCorta(hoy)}</span>
          <svg viewBox="0 0 10 6" className="-mt-px h-1.5 w-2.5 text-leaf-900" aria-hidden>
            <path d="M0 0h10L5 6z" fill="currentColor" />
          </svg>
        </motion.div>
      </div>
      {!compact && (
        <div className="mt-1.5 flex gap-1 text-[10px] text-leaf-700/70">
          {esp.etapas.map((e) => (
            <div key={e.id} className="truncate" style={{ width: `${(diasEntre(e.inicio, e.fin) / total) * 100}%` }}>
              {fechaCorta(e.inicio)} – {fechaCorta(e.fin)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
