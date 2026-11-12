import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import type { CuartelCalc } from '../data/model'
import { cx, fechaCorta, fmt, pct } from '../lib/format'

const C = {
  ink: '#0d2217',
  muted: 'rgba(31,74,48,0.55)',
  grid: '#e6efe8',
  deep: '#2f7448',
  mid: '#69ac7f',
  light: '#c5e0cc',
  gray: '#cfd8d2',
  hist: '#e2efe5',
  risk: '#d64545',
  warn: '#d99a06',
}
const axis = { fontSize: 11, fill: C.muted }

function TipBox({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-leaf-100 bg-white/95 px-3 py-2 text-xs shadow-lift backdrop-blur">{children}</div>
}

// ---------------------------------------------------------------------------
// Distribución de calibres proyectada vs exigencia de mercado
// ---------------------------------------------------------------------------
export function CalibreChart({ c }: { c: CuartelCalc }) {
  const esp = c.esp
  const data = esp.categorias.map((cat, i) => ({
    cat: cat.etiqueta,
    nombre: cat.nombre,
    proyectado: c.dist[i],
    historico: c.distHistorica[i],
    zona: cat.desde >= esp.exigenciaComprador ? 'comprador' : cat.desde >= esp.minimoUNECE ? 'unece' : 'bajo',
    precio: cat.precio,
  }))
  const iUnece = esp.categorias.findIndex((k) => k.desde >= esp.minimoUNECE)
  const iComp = esp.categorias.findIndex((k) => k.desde >= esp.exigenciaComprador)
  const color = (z: string) => (z === 'comprador' ? C.deep : z === 'unece' ? C.mid : C.gray)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-leaf-800/80">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: C.deep }} />Proyectado · cumple comprador</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: C.mid }} />Proyectado · solo mínimo UNECE</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: C.gray }} />Bajo el mínimo</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-leaf-300" style={{ background: C.hist }} />Promedio histórico</span>
      </div>
      <div className="mt-2 h-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 26, right: 8, left: -14, bottom: 0 }} barGap={2} barCategoryGap="22%">
            <CartesianGrid vertical={false} stroke={C.grid} />
            <XAxis dataKey="cat" tick={axis} tickLine={false} axisLine={{ stroke: C.grid }} interval={0} />
            <YAxis tick={axis} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={44} domain={[0, (m: number) => Math.ceil(m / 10) * 10]} tickCount={5} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: 'rgba(197,224,204,0.25)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload as (typeof data)[number]
                return (
                  <TipBox>
                    <div className="font-semibold text-leaf-900">
                      {d.cat} {esp.unidadCalibre === 'mm' && !d.cat.includes('mm') ? 'mm' : ''} {esp.unidadCalibre === 'g' ? 'g' : ''} · {d.nombre}
                    </div>
                    <div className="mt-1 tabular">Proyectado: <b>{pct(d.proyectado, 1)}</b></div>
                    <div className="tabular text-leaf-700/70">Promedio histórico: {pct(d.historico, 1)}</div>
                    <div className="tabular text-leaf-700/70">Precio de ejemplo: {fmt(d.precio, 2)} USD/kg</div>
                  </TipBox>
                )
              }}
            />
            {iUnece > 0 && (
              <ReferenceLine x={data[iUnece].cat} position="start" stroke={C.mid} strokeDasharray="4 3" strokeWidth={1.5}
                label={{ value: 'Mín. UNECE', position: 'top', fill: C.deep, fontSize: 10, fontWeight: 600, offset: 8 }} />
            )}
            {iComp > 0 && (
              <ReferenceLine x={data[iComp].cat} position="start" stroke={C.ink} strokeWidth={2}
                label={{ value: `Comprador ≥ ${fmt(esp.exigenciaComprador)} ${esp.unidadCalibre}`, position: 'top', fill: C.ink, fontSize: 10, fontWeight: 700, offset: 8 }} />
            )}
            <Bar dataKey="historico" fill={C.hist} stroke="#9bc9a8" strokeWidth={1} radius={[4, 4, 0, 0]} animationDuration={700} />
            <Bar dataKey="proyectado" radius={[4, 4, 0, 0]} animationDuration={1000} animationBegin={150}>
              {data.map((d) => (
                <Cell key={d.cat} fill={color(d.zona)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/** Barra apilada: cuánta fruta cumple el comprador, solo el mínimo UNECE o ninguno, vs meta. */
export function CumplimientoBar({ c }: { c: CuartelCalc }) {
  const comp = c.comercial
  const unece = c.sobreUNECE - c.comercial
  const bajo = 100 - c.sobreUNECE
  const meta = c.esp.metaComercial
  const falta = meta - comp
  const segs = [
    { w: comp, color: C.deep, label: 'Cumple comprador' },
    { w: unece, color: C.mid, label: 'Solo mínimo UNECE' },
    { w: bajo, color: C.gray, label: 'Bajo mínimo' },
  ]
  return (
    <div>
      <div className="relative pt-6">
        <div className="flex h-4 gap-0.5 overflow-hidden rounded-full">
          {segs.map((s, i) => (
            <motion.div
              key={s.label}
              title={`${s.label}: ${pct(s.w, 1)}`}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ background: s.color }}
              initial={{ width: 0 }}
              animate={{ width: `${s.w}%` }}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
        </div>
        <div className="absolute top-0 bottom-[-4px] w-0.5 rounded bg-leaf-950" style={{ left: `${meta}%` }}>
          <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 -translate-y-full text-[10px] font-bold whitespace-nowrap text-leaf-950">Meta {pct(meta)}</span>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-leaf-800/80">
        <span>
          <b className="tabular text-leaf-900">{pct(comp)}</b> cumple comprador · <span className="tabular">{pct(unece)}</span> solo mínimo · <span className="tabular">{pct(bajo)}</span> bajo mínimo
        </span>
        <span className={cx('font-semibold', falta > 12 ? 'text-risk-700' : falta > 3 ? 'text-warn-700' : 'text-leaf-700')}>
          {falta > 0 ? `Faltan ${fmt(falta)} pp para la meta` : `Supera la meta en ${fmt(-falta)} pp`}
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Evolución de la proyección semana a semana
// ---------------------------------------------------------------------------
export function EvolucionChart({ c }: { c: CuartelCalc }) {
  const [modo, setModo] = useState<'rend' | 'comercial'>('rend')
  const data = c.evolucion.map((e) => ({ ...e, label: fechaCorta(e.fecha) }))
  const isRend = modo === 'rend'
  const ys = isRend ? data.flatMap((d) => [d.p10, d.p90]).concat([c.mejor.rendimiento, c.promedio]) : data.map((d) => d.comercial).concat([c.esp.metaComercial])
  const lo = Math.floor(Math.min(...ys) * 0.92)
  const hi = Math.ceil(Math.max(...ys) * 1.05)
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-xl bg-leaf-50 p-1 text-xs font-semibold" role="tablist">
          {(['rend', 'comercial'] as const).map((m) => (
            <button key={m} role="tab" aria-selected={modo === m} onClick={() => setModo(m)} className={cx('relative rounded-lg px-3 py-1.5 transition-colors', modo === m ? 'text-leaf-900' : 'text-leaf-700/75 hover:text-leaf-800')}>
              {modo === m && <motion.span layoutId={`evo-tab-${c.id}`} className="absolute inset-0 rounded-lg bg-white shadow-card" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span className="relative">{m === 'rend' ? 'Rendimiento (t/ha)' : 'Calibre comercial (%)'}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-leaf-800/75">
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded" style={{ background: C.deep }} />Proyección</span>
          {isRend && <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm" style={{ background: C.light }} />Rango probable</span>}
          {isRend ? (
            <>
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-leaf-950" />Mejor temporada</span>
              <span className="flex items-center gap-1.5"><span className="w-4 border-t border-dashed border-leaf-900/50" />Promedio</span>
            </>
          ) : (
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-leaf-950" />Meta del mercado</span>
          )}
        </div>
      </div>
      <div className="mt-3 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart key={modo} data={data} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={C.grid} />
            <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={{ stroke: C.grid }} interval="preserveStartEnd" minTickGap={18} />
            <YAxis tick={axis} tickLine={false} axisLine={false} domain={[lo, hi]} width={44} tickFormatter={(v) => (isRend ? fmt(v) : `${v}%`)} />
            <Tooltip
              cursor={{ stroke: C.mid, strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload as (typeof data)[number]
                return (
                  <TipBox>
                    <div className="font-semibold text-leaf-900">Semana del {d.label} ({d.semana})</div>
                    {isRend ? (
                      <>
                        <div className="mt-1 tabular">Probable: <b>{fmt(d.p50, 1)} t/ha</b></div>
                        <div className="tabular text-leaf-700/70">Rango: {fmt(d.p10, 1)} – {fmt(d.p90, 1)} t/ha</div>
                      </>
                    ) : (
                      <div className="mt-1 tabular">Calibre comercial: <b>{pct(d.comercial)}</b></div>
                    )}
                  </TipBox>
                )
              }}
            />
            {isRend && <Area dataKey="rango" stroke="none" fill={C.light} fillOpacity={0.7} animationDuration={900} type="monotone" />}
            {isRend ? (
              <>
                <ReferenceLine y={c.mejor.rendimiento} stroke={C.ink} strokeWidth={1.5} label={{ value: `Mejor ${c.mejor.temporada}`, position: 'insideTopRight', fontSize: 10, fill: C.ink, fontWeight: 600 }} />
                <ReferenceLine y={c.promedio} stroke={C.ink} strokeOpacity={0.5} strokeDasharray="5 4" label={{ value: 'Promedio', position: 'insideBottomLeft', fontSize: 10, fill: C.muted }} />
              </>
            ) : (
              <ReferenceLine y={c.esp.metaComercial} stroke={C.ink} strokeWidth={1.5} label={{ value: `Meta ${c.esp.metaComercial}%`, position: 'insideTopRight', fontSize: 10, fill: C.ink, fontWeight: 600 }} />
            )}
            <Line
              dataKey={isRend ? 'p50' : 'comercial'}
              stroke={C.deep}
              strokeWidth={2}
              type="monotone"
              dot={false}
              activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1100}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Equilibrio carga ↔ valor de la cosecha
// ---------------------------------------------------------------------------
export function BalanceMeter({ c }: { c: CuartelCalc }) {
  const pos = c.equilibrio.posicion // -1..1
  const left = 50 + pos * 42
  const txt = pos > 0.6 ? 'Exceso de carga: se ganan kilos, pero se pierde calibre' : pos < -0.6 ? 'Carga baja: buen calibre, pero se pierden kilos' : 'Carga en equilibrio entre kilos y calibre'
  return (
    <div>
      <div className="relative h-3 rounded-full" style={{ background: 'linear-gradient(90deg, #c5e0cc 0%, #43905d 35%, #43905d 65%, #c5e0cc 100%)' }}>
        <div className="absolute inset-y-0 left-[35%] w-[30%] rounded-full ring-2 ring-white/70" />
        <motion.div
          className={cx('absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-lift', Math.abs(pos) > 0.6 ? 'bg-leaf-950' : 'bg-leaf-900')}
          initial={{ left: '50%' }}
          animate={{ left: `${left}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 14, delay: 0.3 }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-leaf-700/80">
        <span>← Más calibre</span>
        <span>Equilibrio</span>
        <span>Más kilos →</span>
      </div>
      <div className="mt-1 text-xs font-semibold text-leaf-900">{txt}</div>
    </div>
  )
}

export function EquilibrioChart({ c }: { c: CuartelCalc }) {
  const data = c.equilibrio.curva.map((p) => ({ ...p, valorK: p.valor / 1000 }))
  const [a, b] = c.equilibrio.rangoOptimo
  const actual = c.equilibrio.curva.reduce((x, y) => (Math.abs(y.carga - c.carga) < Math.abs(x.carga - c.carga) ? y : x))
  return (
    <div className="h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 18, right: 12, left: -14, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={C.grid} />
          <XAxis dataKey="carga" type="number" domain={['dataMin', 'dataMax']} tick={axis} tickLine={false} axisLine={{ stroke: C.grid }} tickFormatter={(v) => fmt(v)} tickCount={6} />
          <YAxis tick={axis} tickLine={false} axisLine={false} width={44} tickFormatter={(v) => fmt(v)} domain={['auto', 'auto']} />
          <Tooltip
            cursor={{ stroke: C.mid }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload as (typeof data)[number]
              return (
                <TipBox>
                  <div className="font-semibold text-leaf-900">{fmt(d.carga)} frutos/árbol</div>
                  <div className="mt-1 tabular">Margen estimado: <b>{fmt(d.valorK, 1)} mil USD/ha</b></div>
                  <div className="tabular text-leaf-700/70">{fmt(d.rend, 1)} t/ha · {pct(d.comercial)} calibre comercial</div>
                </TipBox>
              )
            }}
          />
          <ReferenceArea x1={a} x2={b} fill={C.light} fillOpacity={0.45} label={{ value: 'Zona de equilibrio', position: 'insideTop', fontSize: 10, fill: C.deep, fontWeight: 600 }} />
          <Line dataKey="valorK" stroke={C.deep} strokeWidth={2} dot={false} type="monotone" animationDuration={1000} activeDot={{ r: 4 }} />
          <ReferenceLine x={actual.carga} stroke={C.ink} strokeWidth={1.5} strokeDasharray="3 3" label={{ value: 'Hoy', position: 'top', fontSize: 10, fill: C.ink, fontWeight: 700 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Historial de temporadas vs proyección actual
// ---------------------------------------------------------------------------
export function HistorialChart({ c, temporada }: { c: CuartelCalc; temporada: string }) {
  const data = [
    ...c.historial.map((h) => ({ t: h.temporada, v: h.rendimiento, com: h.comercial, tipo: h.temporada === c.mejor.temporada ? 'mejor' : 'pasada' })),
    { t: `${temporada} (proy.)`, v: c.rend.p50, com: c.comercial, tipo: 'actual' },
  ]
  const fill = (t: string) => (t === 'actual' ? (c.estado === 'riesgo' ? C.risk : c.estado === 'atencion' ? C.warn : C.deep) : t === 'mejor' ? C.mid : C.light)
  return (
    <div className="h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 18, right: 8, left: -14, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke={C.grid} />
          <XAxis dataKey="t" tick={{ ...axis, fontSize: 10 }} tickLine={false} axisLine={{ stroke: C.grid }} interval={0} tickFormatter={(v: string) => v.replace(' (proy.)', '*')} />
          <YAxis tick={axis} tickLine={false} axisLine={false} width={44} />
          <Tooltip
            cursor={{ fill: 'rgba(197,224,204,0.25)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload as (typeof data)[number]
              return (
                <TipBox>
                  <div className="font-semibold text-leaf-900">{d.t}{d.tipo === 'mejor' ? ' · mejor temporada' : ''}</div>
                  <div className="mt-1 tabular">Rendimiento: <b>{fmt(d.v, 1)} t/ha</b></div>
                  <div className="tabular text-leaf-700/70">Calibre comercial: {pct(d.com)}</div>
                </TipBox>
              )
            }}
          />
          <ReferenceLine y={c.promedio} stroke={C.ink} strokeOpacity={0.5} strokeDasharray="5 4" />
          <Bar dataKey="v" radius={[4, 4, 0, 0]} animationDuration={900}>
            {data.map((d) => (
              <Cell key={d.t} fill={fill(d.tipo)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
