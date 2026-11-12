import { motion } from 'framer-motion'
import { CloudSun, Droplets, Layers3, Leaf } from 'lucide-react'
import { gruposApoyo, kpiApoyo } from '../data/kpis'
import type { CuartelCalc } from '../data/model'
import { cx, fmt } from '../lib/format'
import { InfoTip } from './ui'
import { TendenciaSemanal } from './Kpi'

const iconos = { suelo: Layers3, veg: Leaf, clima: CloudSun, agua: Droplets } as const

export function Condiciones({ c }: { c: CuartelCalc }) {
  const semanas = c.evolucion.slice(-8).map((e) => e.semana)
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {gruposApoyo.map((g, gi) => {
        const Icon = iconos[g.id as keyof typeof iconos]
        const kpis = g.kpis.filter((k) => !(k === 'frio' && c.esp.id === 'palto'))
        return (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * gi }}
            className="rounded-xl bg-leaf-25 p-3 ring-1 ring-leaf-100"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-leaf-700 uppercase">
              <Icon className="h-3.5 w-3.5" /> {g.nombre}
            </div>
            <ul className="mt-2 divide-y divide-leaf-100">
              {kpis.map((id) => {
                const v = c.apoyo.find((a) => a.id === id)!
                const def = kpiApoyo[id]
                const fuera = v.fuera
                const grave = fuera && (id === 'deficit' || id === 'humedadSuelo' || id === 'ndmi' || id === 'ndre')
                const delta = v.valor - v.previo
                return (
                  <li key={id} className="flex items-center gap-2 py-1.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-[11px] text-leaf-800/75">
                        <span className="truncate">{def.label}</span>
                        <InfoTip text={<>{def.tip}{v.rango && <span className="mt-1 block text-leaf-300">Rango esperado: {fmt(v.rango.min, def.dec)} – {fmt(v.rango.max, def.dec)} {def.unidad}</span>}</>} />
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className={cx('tabular text-[13px] font-semibold', fuera ? (grave ? 'text-risk-700' : 'text-warn-700') : 'text-leaf-950')}>{fmt(v.valor, def.dec)}</span>
                        <span className="text-[10px] text-leaf-700/75">{def.unidad}</span>
                        {fuera ? (
                          <span className={cx('ml-1 rounded px-1 text-[9px] font-bold uppercase', grave ? 'bg-risk-50 text-risk-700' : 'bg-warn-50 text-warn-700')}>
                            {fuera === 'bajo' ? 'Bajo rango' : 'Sobre rango'}
                          </span>
                        ) : (
                          <span className="tabular ml-1 text-[10px] text-leaf-700/70">
                            {delta >= 0 ? '▲' : '▼'} {fmt(Math.abs(delta), def.dec)}
                          </span>
                        )}
                      </div>
                    </div>
                    <TendenciaSemanal
                      compact
                      data={v.serie}
                      semanas={semanas}
                      formato={(x) => `${fmt(x, def.dec)}${def.unidad ? ' ' + def.unidad : ''}`}
                      color={fuera ? (grave ? 'var(--color-risk-500)' : 'var(--color-warn-500)') : 'var(--color-leaf-400)'}
                    />
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )
      })}
    </div>
  )
}
