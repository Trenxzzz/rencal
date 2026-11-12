import { motion } from 'framer-motion'
import { ArrowRight, Bell, CalendarRange, Map as MapIcon, Rows3, Store } from 'lucide-react'
import { alertasOrdenadas, type PredioCalc } from '../data'
import { kpiPrincipal } from '../data/kpis'
import { Comparativa } from '../components/Comparativa'
import { KpiCard, RangeBar, TendenciaSemanal } from '../components/Kpi'
import { AlertaCompacta } from '../components/Alertas'
import { OrchardMap } from '../components/OrchardMap'
import { SeasonTimeline } from '../components/SeasonTimeline'
import { Card, CardTitle, CountUp, Delta, InfoTip, estadoInfo } from '../components/ui'
import type { Vista } from '../components/Shell'
import { fmt, pct } from '../lib/format'
import type { Especie } from '../data/types'

/** Barra compacta: cuánta fruta cumple al comprador, solo el mínimo UNECE o ninguno, con la meta marcada. */
export function CumplimientoMini({ dist, esp }: { dist: number[]; esp: Especie }) {
  const suma = (f: (desde: number) => boolean) => dist.reduce((acc, d, i) => acc + (f(esp.categorias[i].desde) ? d : 0), 0)
  const comp = suma((x) => x >= esp.exigenciaComprador)
  const solo = suma((x) => x >= esp.minimoUNECE && x < esp.exigenciaComprador)
  const bajo = 100 - comp - solo
  const segs = [
    { w: comp, c: '#2f7448', l: `Cumple comprador (≥ ${fmt(esp.exigenciaComprador)} ${esp.unidadCalibre})` },
    { w: solo, c: '#9bc9a8', l: 'Solo mínimo UNECE' },
    { w: bajo, c: '#d5ddd8', l: 'Bajo el mínimo' },
  ]
  return (
    <div className="mt-2.5">
      <div className="relative">
        <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
          {segs.map((sg, i) => (
            <motion.div key={sg.l} title={`${sg.l}: ${pct(sg.w)}`} style={{ background: sg.c }} initial={{ width: 0 }} animate={{ width: `${sg.w}%` }} transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }} />
          ))}
        </div>
        <div className="absolute -top-1 -bottom-1 w-0.5 rounded bg-leaf-950" style={{ left: `${esp.metaComercial}%` }} title={`Meta ${pct(esp.metaComercial)}`} />
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-0.5 text-[10px] text-leaf-700/80">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: segs[0].c }} />Cumple {pct(comp)}</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm" style={{ background: segs[1].c }} />Solo mín. {pct(solo)}</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-0.5 rounded bg-leaf-950" />Meta {pct(esp.metaComercial)}</span>
      </div>
    </div>
  )
}

export function Panel({ predio, onNavegar }: { predio: PredioCalc; onNavegar: (v: Vista) => void }) {
  const a = predio.agregado
  const s = a.serie
  const n = s.rend.length
  const d = (arr: number[]) => arr[n - 1] - arr[n - 2]
  const dRel = (arr: number[]) => ((arr[n - 1] - arr[n - 2]) / arr[n - 2]) * 100
  const esp = predio.esp
  const cont = { riesgo: 0, atencion: 0, ok: 0 }
  predio.cuartelesCalc.forEach((c) => cont[c.estado]++)
  const alertas = alertasOrdenadas(predio.alertas)
  const mejorH = predio.cuartelesCalc.reduce((acc, c) => acc + c.mejor.rendimiento * c.ha, 0) / a.ha
  const promH = predio.cuartelesCalc.reduce((acc, c) => acc + c.promedio * c.ha, 0) / a.ha
  const estadoCom = a.comercial < esp.metaComercial - 12 ? 'riesgo' : a.comercial < esp.metaComercial - 3 ? 'atencion' : 'ok'
  const cuartel = (id: string) => predio.cuartelesCalc.find((c) => c.id === id)!
  const semanas = predio.cuartelesCalc[0].evolucion.slice(-n).map((e) => e.semana)

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-display text-[28px] leading-tight font-semibold tracking-tight text-leaf-950">
            {predio.huerto}
          </motion.h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-leaf-800/70">
            <span>{esp.nombre} · {fmt(a.ha, 1)} ha · {predio.cuarteles.length} cuarteles</span>
            <span className="flex items-center gap-1"><Store className="h-3.5 w-3.5" /> Mercado: {predio.mercado}</span>
            <span className="flex items-center gap-1"><CalendarRange className="h-3.5 w-3.5" /> Temporada {predio.temporada}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {(['riesgo', 'atencion', 'ok'] as const).map((k, i) => (
            <motion.div key={k} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.06 }} className={`flex items-center gap-2 rounded-xl px-3 py-2 ring-1 ${estadoInfo[k].bg} ${estadoInfo[k].ring}`}>
              <span className="font-display text-xl font-semibold text-leaf-950 tabular">{cont[k]}</span>
              <span className={`text-[11px] leading-tight font-semibold ${estadoInfo[k].text}`}>{k === 'ok' ? 'En línea' : k === 'atencion' ? 'En atención' : 'En riesgo'}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Línea de tiempo */}
      <Card className="px-5 pt-4 pb-3" delay={0.05}>
        <SeasonTimeline esp={esp} hoy={predio.fechaHoy} />
      </Card>

      {/* KPI principales */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="col-span-2 rounded-2xl border border-leaf-100 bg-gradient-to-br from-white to-leaf-50 p-4 shadow-card"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1 text-xs font-medium text-leaf-800/75">
                {kpiPrincipal.rend.label} del huerto <InfoTip text={kpiPrincipal.rend.tip} />
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <CountUp value={a.rend.p50} dec={1} className="font-display text-[38px] leading-none font-semibold tracking-tight text-leaf-950" />
                <span className="text-sm font-medium text-leaf-700/70">t/ha</span>
              </div>
              <div className="mt-1">
                <Delta value={dRel(s.rend)} dec={1} unit="%" suffix="vs semana anterior" />
              </div>
            </div>
            <TendenciaSemanal data={s.rend.slice(-8)} semanas={semanas.slice(-8)} formato={(v) => `${fmt(v, 1)} t/ha`} delay={0.1} />
          </div>
          <div className="mt-3">
            <RangeBar p10={a.rend.p10} p50={a.rend.p50} p90={a.rend.p90} promedio={promH} mejor={mejorH} min={Math.floor(Math.min(a.rend.p10, promH) * 0.92)} max={Math.ceil(Math.max(a.rend.p90, mejorH) * 1.05)} delay={0.3} />
          </div>
        </motion.div>
        <KpiCard
          label={kpiPrincipal.comercial.label}
          tip={kpiPrincipal.comercial.tip}
          value={a.comercial}
          unit="%"
          delta={d(s.comercial)}
          deltaUnit=" pp"
          serie={s.comercial} semanas={semanas}
          estado={estadoCom}
          delay={0.15}
          sub={
            <>
              Fruta ≥ {fmt(esp.exigenciaComprador)} {esp.unidadCalibre}, la exigencia del comprador
              <CumplimientoMini dist={a.dist} esp={esp} />
            </>
          }
        />
        <KpiCard label={kpiPrincipal.kgExport.label} tip={kpiPrincipal.kgExport.tip} value={a.kgExport} dec={1} unit="t/ha" delta={dRel(s.kgExport)} deltaUnit="%" serie={s.kgExport} semanas={semanas} delay={0.2} sub="Fruta apta para exportar" />
        <KpiCard label={kpiPrincipal.packout.label} tip={kpiPrincipal.packout.tip} value={a.packout} unit="%" delta={d(s.packout)} deltaUnit=" pp" serie={s.packout} semanas={semanas} delay={0.25} />
        <KpiCard label={kpiPrincipal.carga.label} tip={kpiPrincipal.carga.tip} value={a.carga} unit="frutos/árbol" delta={dRel(s.carga)} deltaUnit="%" mejorSiSube={false} serie={s.carga} semanas={semanas} delay={0.3} />
        <KpiCard label={kpiPrincipal.peso.label} tip={kpiPrincipal.peso.tip} value={a.peso} dec={esp.id === 'cerezo' ? 1 : 0} unit="g" delta={dRel(s.peso)} deltaUnit="%" serie={s.peso} semanas={semanas} delay={0.35} />
        <KpiCard
          label={kpiPrincipal.brecha.label}
          tip={kpiPrincipal.brecha.tip}
          value={a.brecha}
          dec={1}
          unit="%"
          delta={d(s.brecha)}
          deltaUnit=" pp"
          serie={s.brecha} semanas={semanas}
          estado={a.brecha < -15 ? 'atencion' : 'ok'}
          delay={0.4}
          sub={`Mejor temporada ponderada: ${fmt(mejorH, 1)} t/ha`}
        />
      </div>

      {/* Mapa + alertas */}
      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="p-4 xl:col-span-8" delay={0.2}>
          <CardTitle icon={<MapIcon className="h-4 w-4 text-leaf-600" />} sub={`${predio.region}, ${predio.pais} · imagen satelital`}>
            Mapa de cuarteles
          </CardTitle>
          <div className="mt-3">
            <OrchardMap predio={predio} onSelect={(id) => onNavegar({ tipo: 'cuartel', id })} height={430} />
          </div>
        </Card>
        <Card className="flex flex-col p-4 xl:col-span-4" delay={0.25}>
          <CardTitle
            icon={<Bell className="h-4 w-4 text-leaf-600" />}
            sub="Ordenadas por severidad"
            right={
              <button onClick={() => onNavegar({ tipo: 'alertas' })} className="flex shrink-0 items-center gap-1 text-xs font-semibold text-leaf-700 hover:text-leaf-900">
                Ver todas <ArrowRight className="h-3.5 w-3.5" />
              </button>
            }
          >
            Alertas del huerto
          </CardTitle>
          <div className="scroll-soft mt-3 -mr-1 flex-1 space-y-2.5 overflow-y-auto pr-1 xl:max-h-[456px]">
            {alertas.map((al, i) => (
              <AlertaCompacta key={al.id} a={al} c={cuartel(al.cuartelId)} hoy={predio.fechaHoy} delay={0.3 + i * 0.07} onAbrir={() => onNavegar({ tipo: 'cuartel', id: al.cuartelId })} />
            ))}
          </div>
        </Card>
      </div>

      {/* Comparación con referencias */}
      <Card className="p-4" delay={0.3}>
        <CardTitle
          icon={<Rows3 className="h-4 w-4 text-leaf-600" />}
          sub={`Cada cuartel contra su propio historial y contra la exigencia del comprador (≥ ${fmt(esp.exigenciaComprador)} ${esp.unidadCalibre}; mínimo ${esp.normaUNECE}: ${fmt(esp.minimoUNECE)} ${esp.unidadCalibre}, valores de ejemplo)`}
        >
          Cuarteles frente a sus referencias
        </CardTitle>
        <div className="mt-3">
          <Comparativa predio={predio} onSelect={(id) => onNavegar({ tipo: 'cuartel', id })} />
        </div>
      </Card>
    </div>
  )
}
