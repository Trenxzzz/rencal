import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, BarChart3, History, ListChecks, Ruler, Scale, Sprout, TrendingUp } from 'lucide-react'
import { alertasOrdenadas, type PredioCalc } from '../data'
import { kpiPrincipal } from '../data/kpis'
import { BalanceMeter, CalibreChart, CumplimientoBar, EquilibrioChart, EvolucionChart, HistorialChart } from '../charts/Charts'
import { RecoItem } from '../components/Alertas'
import { Condiciones } from '../components/Condiciones'
import { KpiCard, RangeBar } from '../components/Kpi'
import { etapaActual } from '../components/SeasonTimeline'
import type { Vista } from '../components/Shell'
import { Card, CardTitle, CountUp, EstadoBadge, InfoTip, SevDot, sevInfo } from '../components/ui'
import { cx, fmt, interpolar, pct, signo } from '../lib/format'
import { ordenSeveridad } from '../data'

export function Cuartel({ predio, id, onNavegar }: { predio: PredioCalc; id: string; onNavegar: (v: Vista) => void }) {
  const c = predio.cuartelesCalc.find((x) => x.id === id) ?? predio.cuartelesCalc[0]
  const esp = c.esp
  const alertas = alertasOrdenadas(predio.alertas.filter((a) => a.cuartelId === c.id))
  const principal = alertas[0]
  const etapa = etapaActual(esp, predio.fechaHoy)
  const ev = c.evolucion
  const n = ev.length
  const semanasEv = ev.map((e) => e.semana)
  const recos = [...c.recomendaciones].sort((a, b) => ordenSeveridad[a.prioridad] - ordenSeveridad[b.prioridad])
  const estadoCom = c.comercial < esp.metaComercial - 12 ? 'riesgo' : c.comercial < esp.metaComercial - 3 ? 'atencion' : 'ok'
  const rel = (k: 'kgExport' | 'carga' | 'peso') => ((ev[n - 1][k] - ev[n - 2][k]) / ev[n - 2][k]) * 100
  const min = Math.min(c.rend.p10, c.promedio, ...c.historial.map((h) => h.rendimiento)) * 0.9
  const max = Math.max(c.rend.p90, c.mejor.rendimiento) * 1.06
  const sobrecarga = c.carga > c.equilibrio.rangoOptimo[1]

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div>
        <button onClick={() => onNavegar({ tipo: 'panel' })} className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-leaf-700 transition hover:text-leaf-900">
          <ArrowLeft className="h-4 w-4" /> Panel del huerto
        </button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-display text-[28px] leading-tight font-semibold tracking-tight text-leaf-950">
                {c.nombre}
              </motion.h1>
              <EstadoBadge estado={c.estado} size="md" />
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-leaf-800/70">
              <span>{predio.huerto}</span>
              <span>· {fmt(c.ha, 1)} ha</span>
              <span>· {fmt(c.arboles)} árboles ({fmt(c.arbolesHa)}/ha)</span>
              <span>· Etapa: <b className="font-semibold text-leaf-800">{etapa.nombre}</b></span>
            </div>
          </div>
        </div>
        {principal && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cx('mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border-l-4 px-4 py-3 ring-1', sevInfo[principal.severidad].bg, sevInfo[principal.severidad].ring, sevInfo[principal.severidad].border)}
          >
            <SevDot sev={principal.severidad} />
            <div className="min-w-0 flex-1">
              <div className={cx('text-[11px] font-bold', sevInfo[principal.severidad].text)}>Alerta de severidad {sevInfo[principal.severidad].label.toLowerCase()}</div>
              <div className="text-sm font-semibold text-leaf-950">{interpolar(principal.titulo, c)}</div>
            </div>
            <button onClick={() => onNavegar({ tipo: 'alertas', cuartel: c.id })} className="flex shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-leaf-800 ring-1 ring-leaf-100 transition hover:ring-leaf-300">
              Ver posibles factores <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Fila 1: predicción + qué hacer */}
      <div className="grid gap-4 md:grid-cols-12">
        <div className="space-y-4 md:col-span-7">
          <Card className="p-5" delay={0.05}>
            <CardTitle icon={<TrendingUp className="h-4 w-4 text-leaf-600" />} tip={kpiPrincipal.rend.tip} sub="Valor más probable y rango, frente a la mejor temporada y al promedio del cuartel">
              Rendimiento proyectado
            </CardTitle>
            <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-2">
              <div className="flex items-baseline gap-1.5">
                <CountUp value={c.rend.p50} dec={1} className="font-display text-[44px] leading-none font-semibold tracking-tight text-leaf-950" />
                <span className="text-sm font-medium text-leaf-700/70">t/ha</span>
              </div>
              <div className="flex gap-2 pb-0.5">
                <span className={cx('rounded-lg px-2 py-1 text-[11px] font-semibold tabular', c.brecha < -12 ? 'bg-warn-50 text-warn-700' : 'bg-leaf-50 text-leaf-800')}>
                  {signo(c.brecha)} % vs mejor ({c.mejor.temporada})
                </span>
                <span className="rounded-lg bg-leaf-50 px-2 py-1 text-[11px] font-semibold text-leaf-800 tabular">{signo(c.brechaPromedio)} % vs promedio</span>
              </div>
            </div>
            <div className="mt-4" />
            <RangeBar p10={c.rend.p10} p50={c.rend.p50} p90={c.rend.p90} promedio={c.promedio} mejor={c.mejor.rendimiento} min={Math.floor(min)} max={Math.ceil(max)} estado={c.estado} delay={0.2} />
          </Card>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
            <KpiCard semanas={semanasEv} label={kpiPrincipal.comercial.label} tip={kpiPrincipal.comercial.tip} value={c.comercial} unit="%" delta={ev[n - 1].comercial - ev[n - 2].comercial} deltaUnit=" pp" serie={ev.map((e) => e.comercial)} estado={estadoCom} sub={`Meta ${pct(esp.metaComercial)}`} delay={0.1} />
            <KpiCard semanas={semanasEv} label={kpiPrincipal.kgExport.label} tip={kpiPrincipal.kgExport.tip} value={c.kgExport} dec={1} unit="t/ha" delta={rel('kgExport')} deltaUnit="%" serie={ev.map((e) => e.kgExport)} delay={0.13} />
            <KpiCard semanas={semanasEv} label={kpiPrincipal.packout.label} tip={kpiPrincipal.packout.tip} value={c.packout} unit="%" delta={ev[n - 1].packout - ev[n - 2].packout} deltaUnit=" pp" serie={ev.map((e) => e.packout)} delay={0.16} />
            <KpiCard semanas={semanasEv} label={kpiPrincipal.carga.label} tip={kpiPrincipal.carga.tip} value={c.carga} unit="fr/árbol" delta={rel('carga')} deltaUnit="%" mejorSiSube={false} serie={ev.map((e) => e.carga)} estado={sobrecarga ? (c.estado === 'riesgo' ? 'riesgo' : 'atencion') : 'ok'} sub={`Óptimo ${fmt(c.equilibrio.rangoOptimo[0])}–${fmt(c.equilibrio.rangoOptimo[1])}`} delay={0.19} />
            <KpiCard semanas={semanasEv} label={kpiPrincipal.peso.label} tip={kpiPrincipal.peso.tip} value={c.peso} dec={esp.id === 'cerezo' ? 1 : 0} unit="g" delta={rel('peso')} deltaUnit="%" serie={ev.map((e) => e.peso)} delay={0.22} />
            <KpiCard semanas={semanasEv} label={kpiPrincipal.brecha.label} tip={kpiPrincipal.brecha.tip} value={c.brecha} dec={1} unit="%" serie={ev.map((e) => ((e.p50 - c.mejor.rendimiento) / c.mejor.rendimiento) * 100)} estado={c.brecha < -15 ? 'atencion' : 'ok'} sub={`Mejor: ${fmt(c.mejor.rendimiento, 1)} t/ha`} delay={0.25} />
          </div>
          <Card className="p-5" delay={0.15}>
            <CardTitle
              icon={<Ruler className="h-4 w-4 text-leaf-600" />}
              tip={`Categorías de ${esp.medidaCalibre} para ${esp.frutoPlural}. Las líneas marcan el mínimo de la norma ${esp.normaUNECE} y la especificación del comprador. Categorías, umbrales y precios son valores de ejemplo.`}
              sub={`Por categoría de ${esp.medidaCalibre}, frente a la exigencia del mercado de destino (${predio.mercado})`}
            >
              Distribución de calibres proyectada
            </CardTitle>
            <div className="mt-4">
              <CumplimientoBar c={c} />
            </div>
            <div className="mt-5">
              <CalibreChart c={c} />
            </div>
          </Card>
          <Card className="p-5" delay={0.2}>
            <CardTitle icon={<BarChart3 className="h-4 w-4 text-leaf-600" />} sub="Cómo ha cambiado la proyección semana a semana. El rango se estrecha a medida que hay más mediciones.">
              Evolución de la proyección
            </CardTitle>
            <div className="mt-3">
              <EvolucionChart c={c} />
            </div>
          </Card>
        </div>

        <div className="space-y-4 md:col-span-5">
          <Card className="p-5" delay={0.1}>
            <CardTitle icon={<ListChecks className="h-4 w-4 text-leaf-600" />} sub={<>Según la etapa actual: <b className="font-semibold text-leaf-800">{etapa.nombre}</b>, ordenadas por prioridad</>}>
              Qué hacer ahora
            </CardTitle>
            <div className="mt-3 space-y-2.5">
              {recos.map((r, i) => (
                <RecoItem key={r.id} r={r} c={c} hoy={predio.fechaHoy} destacada={i === 0 && r.prioridad !== 'baja'} delay={0.15 + i * 0.07} />
              ))}
            </div>
            </Card>
          <Card className="p-5" delay={0.2}>
            <CardTitle
              icon={<Scale className="h-4 w-4 text-leaf-600" />}
              tip="Más frutos por árbol dan más kilos, pero frutos más chicos. La curva estima el margen por hectárea (precio por categoría menos costo de cosecha y embalaje) para cada nivel de carga. La zona verde es donde se maximiza el valor de la cosecha."
              sub="Carga frutal y su efecto en el valor de la cosecha"
            >
              Equilibrio entre kilos y calibre
            </CardTitle>
            <div className="mt-4 flex items-baseline gap-2">
              <Sprout className="h-4 w-4 self-center text-leaf-600" />
              <CountUp value={c.carga} className="font-display text-2xl font-semibold text-leaf-950" />
              <span className="text-xs text-leaf-700/70">frutos/árbol estimados</span>
              <span className="ml-auto text-xs text-leaf-700/70 tabular">
                óptimo {fmt(c.equilibrio.rangoOptimo[0])}–{fmt(c.equilibrio.rangoOptimo[1])}
              </span>
            </div>
            <div className="mt-3">
              <BalanceMeter c={c} />
            </div>
            <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-leaf-700/70">
              Margen estimado (mil USD/ha) según carga frutal
              <InfoTip text="Valores de ejemplo, calculados con precios y costos ficticios por categoría." />
            </div>
            <EquilibrioChart c={c} />
          </Card>
          <Card className="p-5" delay={0.25}>
            <CardTitle icon={<History className="h-4 w-4 text-leaf-600" />} sub="Rendimiento por temporada (t/ha). * Proyección actual.">
              Historial del cuartel
            </CardTitle>
            <div className="mt-3">
              <HistorialChart c={c} temporada={predio.temporada} />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
              <div className="rounded-lg bg-leaf-25 p-2 ring-1 ring-leaf-100">
                <div className="text-leaf-700/80">Mejor temporada</div>
                <div className="font-semibold text-leaf-900 tabular">{c.mejor.temporada} · {fmt(c.mejor.rendimiento, 1)} t/ha</div>
              </div>
              <div className="rounded-lg bg-leaf-25 p-2 ring-1 ring-leaf-100">
                <div className="text-leaf-700/80">Promedio</div>
                <div className="font-semibold text-leaf-900 tabular">{fmt(c.promedio, 1)} t/ha</div>
              </div>
              <div className="rounded-lg bg-leaf-25 p-2 ring-1 ring-leaf-100">
                <div className="text-leaf-700/80">Calibre com. prom.</div>
                <div className="font-semibold text-leaf-900 tabular">{pct(c.comercialPromedio)}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Condiciones (apoyo) */}
      <Card className="p-5" delay={0.25}>
        <CardTitle sub="Indicadores de apoyo de sensores, imágenes satelitales y clima. Solo se colorean si están fuera de su rango esperado.">
          Condiciones del cuartel
        </CardTitle>
        <div className="mt-3">
          <Condiciones c={c} />
        </div>
      </Card>
    </div>
  )
}
