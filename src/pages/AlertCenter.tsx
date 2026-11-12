import { AnimatePresence, motion } from 'framer-motion'
import { BellOff, Filter, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { alertasOrdenadas, prediosCalc, type PredioCalc } from '../data'
import type { Severidad } from '../data/types'
import { AlertaCompleta } from '../components/Alertas'
import { SevDot, sevInfo } from '../components/ui'
import { cx } from '../lib/format'

export function AlertCenter({
  predio, cuartelInicial, onVerCuartel,
}: { predio: PredioCalc; cuartelInicial?: string; onVerCuartel: (predioId: string, cuartelId: string) => void }) {
  const [sev, setSev] = useState<Severidad | 'todas'>('todas')
  const [cuartel, setCuartel] = useState<string>(cuartelInicial ?? 'todos')
  const [alcance, setAlcance] = useState<'predio' | 'todos'>('predio')

  const fuente = alcance === 'predio' ? [predio] : prediosCalc
  const todas = useMemo(() => fuente.flatMap((p) => p.alertas.map((a) => ({ a, p, c: p.cuartelesCalc.find((c) => c.id === a.cuartelId)! }))), [fuente])
  const filtradas = alertasOrdenadas(todas.map((x) => x.a))
    .map((a) => todas.find((x) => x.a.id === a.id)!)
    .filter((x) => (sev === 'todas' || x.a.severidad === sev) && (cuartel === 'todos' || x.a.cuartelId === cuartel))
  const conteo = (s: Severidad) => todas.filter((x) => x.a.severidad === s && (cuartel === 'todos' || x.a.cuartelId === cuartel)).length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-display text-[28px] leading-tight font-semibold tracking-tight text-leaf-950">
            Centro de alertas
          </motion.h1>
          <p className="mt-1 text-[13px] text-leaf-800/70">
            Qué está pasando en cada cuartel, sus posibles factores y la acción recomendada con su ventana de tiempo.
          </p>
        </div>
        <div className="flex gap-2">
          {(['alta', 'media', 'baja'] as const).map((s, i) => (
            <motion.div key={s} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }} className={cx('flex items-center gap-2 rounded-xl px-3 py-2 ring-1', sevInfo[s].bg, sevInfo[s].ring)}>
              <SevDot sev={s} />
              <span className="font-display text-xl font-semibold text-leaf-950 tabular">{conteo(s)}</span>
              <span className={cx('text-[11px] font-semibold', sevInfo[s].text)}>{sevInfo[s].label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="sticky top-16 z-[900] -mx-1 flex flex-wrap items-center gap-2 rounded-2xl border border-leaf-100 bg-white/90 p-2 shadow-card backdrop-blur">
        <Filter className="ml-2 h-4 w-4 text-leaf-600" />
        <div className="inline-flex rounded-xl bg-leaf-50 p-1 text-xs font-semibold" role="tablist" aria-label="Severidad">
          {(['todas', 'alta', 'media', 'baja'] as const).map((s) => (
            <button key={s} role="tab" aria-selected={sev === s} onClick={() => setSev(s)} className={cx('relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors', sev === s ? 'text-leaf-900' : 'text-leaf-700/75 hover:text-leaf-800')}>
              {sev === s && <motion.span layoutId="sev-tab" className="absolute inset-0 rounded-lg bg-white shadow-card" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              {s !== 'todas' && <span className={cx('relative h-2 w-2 rounded-full', sevInfo[s].dot)} />}
              <span className="relative">{s === 'todas' ? 'Todas' : sevInfo[s].label}</span>
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-leaf-800/80">
          <span className="sr-only">Cuartel</span>
          <select
            value={cuartel}
            onChange={(e) => setCuartel(e.target.value)}
            disabled={alcance === 'todos'}
            className="rounded-xl border border-leaf-100 bg-white px-3 py-2 text-xs font-semibold text-leaf-900 outline-none focus:border-leaf-300 disabled:opacity-50"
          >
            <option value="todos">Todos los cuarteles</option>
            {predio.cuartelesCalc.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
        <div className="ml-auto inline-flex rounded-xl bg-leaf-50 p-1 text-xs font-semibold">
          {(['predio', 'todos'] as const).map((a) => (
            <button
              key={a}
              onClick={() => {
                setAlcance(a)
                if (a === 'todos') setCuartel('todos')
              }}
              className={cx('rounded-lg px-3 py-1.5 transition-colors', alcance === a ? 'bg-white text-leaf-900 shadow-card' : 'text-leaf-700/75 hover:text-leaf-800')}
            >
              {a === 'predio' ? predio.huerto : 'Todos los predios'}
            </button>
          ))}
        </div>
        {(sev !== 'todas' || cuartel !== 'todos') && (
          <button onClick={() => { setSev('todas'); setCuartel('todos') }} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-leaf-700 hover:bg-leaf-50">
            <X className="h-3.5 w-3.5" /> Limpiar
          </button>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtradas.map(({ a, p, c }, i) => (
            <div key={a.id}>
              <AlertaCompleta
                a={a}
                c={c}
                hoy={p.fechaHoy}
                inicialAbierta={i === 0}
                delay={i * 0.05}
                onVerCuartel={() => onVerCuartel(p.id, c.id)}
              />
              {alcance === 'todos' && <div className="mt-1 pl-2 text-[10px] text-leaf-700/70">{p.huerto} · {p.esp.nombre} · {p.pais}</div>}
            </div>
          ))}
        </AnimatePresence>
        {filtradas.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-leaf-200 bg-white p-10 text-center text-sm text-leaf-700/70">
            <BellOff className="h-6 w-6 text-leaf-400" />
            No hay alertas con estos filtros.
          </div>
        )}
      </div>
    </div>
  )
}
