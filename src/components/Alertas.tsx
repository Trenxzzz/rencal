import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronDown, Clock, Droplets, Eye, FlaskConical, Lightbulb, Microscope, Scissors, ShieldCheck, Target, Tractor } from 'lucide-react'
import { useState } from 'react'
import type { CuartelCalc } from '../data/model'
import { diasEntre } from '../data/model'
import type { Alerta, Recomendacion, TipoAccion } from '../data/types'
import { cx, fechaCorta, fmt, interpolar, pct } from '../lib/format'
import { SevBadge, SevDot, sevInfo } from './ui'

export const tipoAccion: Record<TipoAccion, { label: string; Icon: typeof Droplets; color: string }> = {
  raleo: { label: 'Raleo', Icon: Scissors, color: 'bg-leaf-100 text-leaf-800' },
  riego: { label: 'Riego', Icon: Droplets, color: 'bg-leaf-100 text-leaf-800' },
  nutricion: { label: 'Nutrición', Icon: FlaskConical, color: 'bg-leaf-100 text-leaf-800' },
  cosecha: { label: 'Cosecha', Icon: Tractor, color: 'bg-leaf-100 text-leaf-800' },
  monitoreo: { label: 'Monitoreo', Icon: Eye, color: 'bg-leaf-50 text-leaf-700' },
  proteccion: { label: 'Protección', Icon: ShieldCheck, color: 'bg-leaf-100 text-leaf-800' },
}

export function estadoVentana(r: Recomendacion, hoy: string) {
  const total = Math.max(1, diasEntre(r.ventanaInicio, r.ventanaFin))
  if (hoy < r.ventanaInicio) {
    const d = diasEntre(hoy, r.ventanaInicio)
    return { texto: `Empieza en ${d} ${d === 1 ? 'día' : 'días'}`, abierta: false, urgente: false, progreso: 0 }
  }
  if (hoy > r.ventanaFin) return { texto: 'Ventana cerrada', abierta: false, urgente: false, progreso: 100 }
  const quedan = diasEntre(hoy, r.ventanaFin)
  return {
    texto: quedan === 0 ? 'Cierra hoy' : `Abierta · cierra en ${quedan} ${quedan === 1 ? 'día' : 'días'}`,
    abierta: true,
    urgente: quedan <= 16,
    progreso: (diasEntre(r.ventanaInicio, hoy) / total) * 100,
  }
}

export function VentanaChip({ r, hoy, size = 'md' }: { r: Recomendacion; hoy: string; size?: 'sm' | 'md' }) {
  const v = estadoVentana(r, hoy)
  return (
    <span
      className={cx(
        'inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-lg font-semibold ring-1',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        v.abierta ? 'bg-leaf-900 text-white ring-leaf-900' : 'bg-white text-leaf-800 ring-leaf-200',
      )}
    >
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <Clock className="h-3.5 w-3.5" />
        {fechaCorta(r.ventanaInicio)} – {fechaCorta(r.ventanaFin)}
      </span>
      <span className={cx('font-medium whitespace-nowrap', v.abierta ? 'text-leaf-200' : 'text-leaf-700/70')}>· {v.texto}</span>
    </span>
  )
}

export function RecoItem({ r, c, hoy, destacada = false, delay = 0 }: { r: Recomendacion; c: CuartelCalc; hoy: string; destacada?: boolean; delay?: number }) {
  const t = tipoAccion[r.tipo]
  const v = estadoVentana(r, hoy)
  const obj = r.cargaObjetivo ? c.equilibrio.curva.reduce((a, b) => (Math.abs(b.carga - c.equilibrio.optima) < Math.abs(a.carga - c.equilibrio.optima) ? b : a)) : null
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cx('rounded-xl border p-3.5', destacada ? 'border-leaf-200 bg-leaf-50/60' : 'border-leaf-100 bg-white')}
    >
      <div className="flex items-start gap-3">
        <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-lg', t.color)}>
          <t.Icon className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[10px] font-bold tracking-wider text-leaf-600 uppercase">{t.label}</span>
            {r.prioridad === 'alta' && <span className="rounded-full bg-leaf-900 px-1.5 py-px text-[10px] font-semibold text-white">Prioritaria</span>}
          </div>
          <div className="mt-0.5 text-sm leading-snug font-semibold text-leaf-950">{r.accion}</div>
          <div className="mt-2">
            <VentanaChip r={r} hoy={hoy} />
          </div>
          {v.abierta && (
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-leaf-100">
              <motion.div className="h-full rounded-full bg-leaf-600" initial={{ width: 0 }} animate={{ width: `${v.progreso}%` }} transition={{ duration: 0.8, delay: delay + 0.2 }} />
            </div>
          )}
          <p className="mt-2 text-xs leading-relaxed text-leaf-800/80">{r.detalle}</p>
          {obj && (
            <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(118px,1fr))] gap-1.5 rounded-lg bg-white p-2 text-[11px] ring-1 ring-leaf-100">
              <div>
                <div className="text-leaf-700/80">Carga objetivo</div>
                <div className="tabular font-semibold text-leaf-900">≈ {fmt(c.equilibrio.optima)} frutos/árbol</div>
              </div>
              <div>
                <div className="text-leaf-700/80">Calibre comercial</div>
                <div className="tabular font-semibold text-leaf-900">
                  {pct(c.comercial)} → {pct(obj.comercial)}
                </div>
              </div>
              <div>
                <div className="text-leaf-700/80">Rendimiento</div>
                <div className="tabular font-semibold text-leaf-900">
                  {fmt(c.rend.p50, 1)} → {fmt(obj.rend, 1)} t/ha
                </div>
              </div>
            </div>
          )}
          <div className="mt-2 flex items-start gap-1.5 text-xs text-leaf-800">
            <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf-600" />
            <span>{r.impacto}</span>
          </div>
          {r.nota && (
            <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-leaf-700/70">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{r.nota}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/** Tarjeta compacta de alerta para listas. */
export function AlertaCompacta({ a, c, hoy, onAbrir, delay = 0 }: { a: Alerta; c: CuartelCalc; hoy: string; onAbrir: () => void; delay?: number }) {
  const reco = c.recomendaciones.find((r) => r.id === a.recomendacionIds[0])
  const s = sevInfo[a.severidad]
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ x: 2 }}
      onClick={onAbrir}
      className={cx('group w-full rounded-xl border border-l-4 border-leaf-100 bg-white p-3 text-left shadow-card transition-shadow hover:shadow-lift', s.border)}
    >
      <div className="flex items-center gap-2">
        <SevDot sev={a.severidad} />
        <span className={cx('text-[11px] font-bold', s.text)}>{s.label}</span>
        <span className="truncate text-[11px] font-semibold text-leaf-900">· {c.nombre}</span>
        <span className="ml-auto shrink-0 text-[10px] text-leaf-700/70">{fechaCorta(a.fecha)}</span>
      </div>
      <div className="mt-1.5 text-[13px] leading-snug font-semibold text-leaf-950">{interpolar(a.titulo, c)}</div>
      {reco && (
        <div className="mt-2 flex items-center gap-2">
          <span className="min-w-0 flex-1 line-clamp-2 text-[11px] text-leaf-800/80">
            <span className="font-semibold text-leaf-800">Acción:</span> {reco.accion}
          </span>
        </div>
      )}
      {reco && (
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <VentanaChip r={reco} hoy={hoy} size="sm" />
          <ArrowRight className="h-4 w-4 shrink-0 text-leaf-400 transition-transform group-hover:translate-x-0.5 group-hover:text-leaf-700" />
        </div>
      )}
    </motion.button>
  )
}

const confianzaTxt = { alta: 'Evidencia fuerte', media: 'Evidencia moderada', baja: 'Evidencia débil' }

/** Tarjeta completa de alerta para el centro de alertas. */
export function AlertaCompleta({ a, c, hoy, onVerCuartel, inicialAbierta = false, delay = 0 }: { a: Alerta; c: CuartelCalc; hoy: string; onVerCuartel: () => void; inicialAbierta?: boolean; delay?: number }) {
  const [abierta, setAbierta] = useState(inicialAbierta)
  const recos = a.recomendacionIds.map((id) => c.recomendaciones.find((r) => r.id === id)).filter(Boolean) as Recomendacion[]
  const s = sevInfo[a.severidad]
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, delay }}
      className={cx('overflow-hidden rounded-2xl border border-l-4 border-leaf-100 bg-white shadow-card', s.border)}
    >
      <button onClick={() => setAbierta((x) => !x)} className="flex w-full items-start gap-3 p-4 text-left" aria-expanded={abierta}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SevBadge sev={a.severidad} />
            <span className="text-xs font-semibold text-leaf-900">{c.nombre}</span>
            <span className="text-[11px] text-leaf-700/75">· {fechaCorta(a.fecha)}</span>
          </div>
          <h3 className="mt-2 text-[15px] leading-snug font-semibold text-leaf-950">{interpolar(a.titulo, c)}</h3>
          {recos[0] && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-leaf-800/80">
              <span>
                <span className="font-semibold text-leaf-800">Acción recomendada:</span> {recos[0].accion}
              </span>
              <VentanaChip r={recos[0]} hoy={hoy} size="sm" />
            </div>
          )}
        </div>
        <ChevronDown className={cx('mt-1 h-5 w-5 shrink-0 text-leaf-500 transition-transform', abierta && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {abierta && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <div className="grid gap-4 border-t border-leaf-100 p-4 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <div className="text-[11px] font-bold tracking-wider text-leaf-600 uppercase">Qué está pasando</div>
                  <p className="mt-1 text-sm leading-relaxed text-leaf-900">{interpolar(a.queOcurre, c)}</p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-leaf-700/80">
                    <Microscope className="h-3.5 w-3.5" /> Señal detectada con: {a.metodo}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold tracking-wider text-leaf-600 uppercase">Posibles factores (hipótesis por evaluar)</div>
                  <ul className="mt-2 space-y-2">
                    {a.factores.map((f, i) => (
                      <li key={i} className="rounded-xl bg-leaf-25 p-3 ring-1 ring-leaf-100">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[13px] font-semibold text-leaf-900">{f.hipotesis}</span>
                          <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-leaf-700 ring-1 ring-leaf-100">{confianzaTxt[f.confianza]}</span>
                        </div>
                        <p className="mt-1 text-xs text-leaf-800/80">{f.evidencia}</p>
                        <p className="mt-1 text-xs text-leaf-800">
                          <span className="font-semibold">Cómo evaluarla:</span> {f.comoEvaluar}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold tracking-wider text-leaf-600 uppercase">Qué hacer</div>
                <div className="mt-2 space-y-2">
                  {recos.map((r, i) => (
                    <RecoItem key={r.id} r={r} c={c} hoy={hoy} destacada={i === 0} delay={i * 0.06} />
                  ))}
                </div>
                <button onClick={onVerCuartel} className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-leaf-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-leaf-800">
                  Ver detalle del cuartel <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}
