import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { PredioCalc } from '../data'
import type { CuartelCalc } from '../data/model'
import { cx, fmt, pct, signo } from '../lib/format'
import { EjeRango, RangeBar, RangoLeyenda } from './Kpi'
import { EstadoBadge, InfoTip, estadoInfo } from './ui'

const ordenEstado = { riesgo: 0, atencion: 1, ok: 2 }

function ComercialBar({ c }: { c: CuartelCalc }) {
  const meta = c.esp.metaComercial
  const color = estadoInfo[c.estado].color
  return (
    <div className="relative py-1.5">
      <div className="relative h-2.5 rounded-full bg-leaf-50">
        <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${c.comercial}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
        <div className="absolute -inset-y-1 w-0.5 rounded bg-leaf-950" style={{ left: `${meta}%` }} />
      </div>
    </div>
  )
}

export function Comparativa({ predio, onSelect }: { predio: PredioCalc; onSelect: (id: string) => void }) {
  const cs = [...predio.cuartelesCalc].sort((a, b) => ordenEstado[a.estado] - ordenEstado[b.estado] || a.comercial - b.comercial)
  const all = cs.flatMap((c) => [c.rend.p10, c.rend.p90, c.mejor.rendimiento, c.promedio])
  const min = Math.floor(Math.min(...all) * 0.95)
  const max = Math.ceil(Math.max(...all) * 1.03)
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-leaf-25 px-3 py-2 ring-1 ring-leaf-100">
        <span className="text-[11px] font-semibold text-leaf-800">Cómo leerlo:</span>
        <RangoLeyenda />
        <span className="flex items-center gap-1.5 text-[11px] text-leaf-800/80">
          <span className="h-2 w-5 rounded-full bg-leaf-500" />
          % de fruta que cumple al comprador
          <span className="ml-1.5 h-3 w-0.5 rounded bg-leaf-950" />
          meta
        </span>
      </div>
      <div className="hidden grid-cols-[minmax(150px,1.3fr)_minmax(180px,2fr)_minmax(150px,1.4fr)_96px_16px] items-end gap-4 border-b border-leaf-100 px-3 pb-2 text-[11px] font-semibold text-leaf-700/80 lg:grid">
        <span>Cuartel</span>
        <span className="block">
          <span className="flex items-center gap-1">
            Rendimiento vs su historial (t/ha)
            <InfoTip text="Barra clara: rango probable del rendimiento (80 % de probabilidad). Punto: valor más probable. Triángulo negro ▼: mejor temporada del cuartel. Triángulo blanco ▲: promedio histórico. Todos los cuarteles usan la misma escala." />
          </span>
          <span className="mt-1.5 block font-normal">
            <EjeRango min={min} max={max} />
          </span>
        </span>
        <span className="flex items-center gap-1">
          Calibre comercial vs meta
          <InfoTip text={`Porcentaje de fruta que alcanzaría la exigencia del comprador (≥ ${fmt(predio.esp.exigenciaComprador)} ${predio.esp.unidadCalibre}). La línea negra marca la meta de ${predio.esp.metaComercial} %.`} />
        </span>
        <span>Estado</span>
        <span />
      </div>
      <ul className="divide-y divide-leaf-50">
        {cs.map((c, i) => (
          <motion.li key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
            <button
              onClick={() => onSelect(c.id)}
              className={cx(
                'group grid w-full grid-cols-1 items-center gap-x-4 gap-y-2 rounded-xl px-3 py-3 text-left transition-colors hover:bg-leaf-25 sm:grid-cols-2 lg:grid-cols-[minmax(150px,1.3fr)_minmax(180px,2fr)_minmax(150px,1.4fr)_96px_16px]',
                c.estado === 'riesgo' && 'bg-risk-50/40 hover:bg-risk-50/70',
              )}
            >
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold text-leaf-950">{c.nombre}</div>
                <div className="text-[11px] text-leaf-700/80">
                  {fmt(c.ha, 1)} ha · {fmt(c.carga)} frutos/árbol
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline justify-between text-[11px]">
                  <span className="tabular font-semibold text-leaf-900">
                    {fmt(c.rend.p50, 1)} <span className="font-normal text-leaf-700/80">t/ha</span>
                  </span>
                  <span className={cx('tabular', c.brecha < -12 ? 'font-semibold text-warn-700' : 'text-leaf-700/80')}>{signo(c.brecha)} % vs mejor</span>
                </div>
                <RangeBar p10={c.rend.p10} p50={c.rend.p50} p90={c.rend.p90} promedio={c.promedio} mejor={c.mejor.rendimiento} min={min} max={max} variant="compact" grid estado={c.estado} delay={0.05 * i} />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline justify-between text-[11px]">
                  <span className={cx('tabular font-semibold', c.estado === 'ok' ? 'text-leaf-900' : estadoInfo[c.estado].text)}>{pct(c.comercial)}</span>
                  <span className="tabular text-leaf-700/80">meta {pct(c.esp.metaComercial)}</span>
                </div>
                <ComercialBar c={c} />
              </div>
              <div>
                <EstadoBadge estado={c.estado} />
              </div>
              <ChevronRight className="hidden h-4 w-4 text-leaf-300 transition-transform group-hover:translate-x-0.5 group-hover:text-leaf-700 lg:block" />
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
