import type { CuartelSemilla, Especie, Estado, KpiApoyoId, Predio, RangoKpi } from './types'

/*
 * "Modelo" simulado del prototipo. No hay machine learning: estas funciones
 * derivan, de forma determinista y coherente, las proyecciones a partir de las
 * semillas de cada cuartel (carga, calibre medio, árboles/ha, historial...).
 */

// ---------- utilidades ----------
export function rng(seedStr: string) {
  let h = 2166136261
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  let a = h >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function erf(x: number) {
  const s = Math.sign(x)
  x = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * x)
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return s * y
}
const cdf = (x: number, m: number, sd: number) => 0.5 * (1 + erf((x - m) / (sd * Math.SQRT2)))

const DIA = 86400000
export const parseFecha = (s: string) => new Date(s + 'T12:00:00')
export const diasEntre = (a: string, b: string) => Math.round((parseFecha(b).getTime() - parseFecha(a).getTime()) / DIA)
export function sumarDias(s: string, n: number) {
  const d = new Date(parseFecha(s).getTime() + n * DIA)
  return d.toISOString().slice(0, 10)
}

// ---------- calibre ----------
export function distribucion(esp: Especie, media: number): number[] {
  return esp.categorias.map((c) => (cdf(c.hasta, media, esp.sdCalibre) - cdf(c.desde, media, esp.sdCalibre)) * 100)
}
export const pctSobre = (esp: Especie, media: number, umbral: number) => (1 - cdf(umbral, media, esp.sdCalibre)) * 100

function mediaParaComercial(esp: Especie, objetivo: number) {
  let lo = esp.minimoUNECE * 0.5
  let hi = esp.exigenciaComprador * 1.8
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2
    if (pctSobre(esp, mid, esp.exigenciaComprador) < objetivo) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

function valorPorHa(esp: Especie, rend: number, media: number, defectos: number) {
  const dist = distribucion(esp, media)
  // margen por kilo = precio de la categoría − costo de cosecha y embalaje (valores de ejemplo)
  const margenMedio = dist.reduce((acc, p, i) => acc + (p / 100) * (esp.categorias[i].precio - esp.costoKg), 0)
  return rend * 1000 * (1 - defectos) * margenMedio
}

// ---------- cálculo por cuartel ----------
export interface PuntoSemana {
  semana: string
  fecha: string
  p10: number
  p50: number
  p90: number
  rango: [number, number]
  comercial: number
  carga: number
  peso: number
  packout: number
  kgExport: number
}

export interface PuntoEquilibrio {
  carga: number
  valor: number
  rend: number
  comercial: number
}

export interface KpiApoyoValor {
  id: KpiApoyoId
  valor: number
  previo: number
  serie: number[]
  rango: RangoKpi | undefined
  fuera: 'bajo' | 'alto' | null
}

export interface CuartelCalc extends Omit<CuartelSemilla, 'apoyo'> {
  nombre: string
  predioId: string
  esp: Especie
  arboles: number
  peso: number
  rend: { p10: number; p50: number; p90: number }
  dist: number[]
  distHistorica: number[]
  comercial: number
  comercialPromedio: number
  sobreUNECE: number
  packout: number
  kgExport: number
  mejor: { temporada: string; rendimiento: number; comercial: number }
  promedio: number
  brecha: number
  brechaPromedio: number
  valorHa: number
  evolucion: PuntoSemana[]
  equilibrio: { curva: PuntoEquilibrio[]; optima: number; rangoOptimo: [number, number]; valorOptimo: number; posicion: number }
  apoyo: KpiApoyoValor[]
}

function semanaISO(s: string) {
  const d = parseFecha(s)
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = t.getUTCDay() || 7
  t.setUTCDate(t.getUTCDate() + 4 - day)
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  return Math.ceil(((t.getTime() - y0.getTime()) / DIA + 1) / 7)
}
export const numeroSemana = semanaISO

export function calcularCuartel(p: Predio, esp: Especie, s: CuartelSemilla, base: Record<KpiApoyoId, number>): CuartelCalc {
  const r = rng(p.id + s.id)
  const peso = esp.tamanoAPeso(s.calibreMedio)
  const p50 = (s.carga * s.arbolesHa * peso) / 1e6
  const p10 = p50 * (1 - s.incertidumbre * 0.55)
  const p90 = p50 * (1 + s.incertidumbre * 0.45)
  const dist = distribucion(esp, s.calibreMedio)
  const comercial = pctSobre(esp, s.calibreMedio, esp.exigenciaComprador)
  const sobreUNECE = pctSobre(esp, s.calibreMedio, esp.minimoUNECE)
  const packout = sobreUNECE * (1 - s.defectos)
  const kgExport = (p50 * packout) / 100

  const mejor = s.historial.reduce((a, b) => (b.rendimiento > a.rendimiento ? b : a))
  const promedio = s.historial.reduce((a, b) => a + b.rendimiento, 0) / s.historial.length
  const comercialPromedio = s.historial.reduce((a, b) => a + b.comercial, 0) / s.historial.length
  const distHistorica = distribucion(esp, mediaParaComercial(esp, comercialPromedio))

  // Evolución semanal de la proyección
  const semanas = Math.floor(diasEntre(esp.inicioProyeccion, p.fechaHoy) / 7)
  const inicio = Math.max(0, semanas - 15)
  const evolucion: PuntoSemana[] = []
  for (let i = inicio; i <= semanas; i++) {
    const fecha = sumarDias(p.fechaHoy, -(semanas - i) * 7)
    const frac = semanas === 0 ? 1 : (i - inicio) / (semanas - inicio)
    const ruido = i === semanas ? 0 : (r() - 0.5) * 0.035
    const lejos = 1 - frac
    const v50 = p50 * (1 + s.derivaInicial * lejos * (0.85 + 0.3 * r()) + ruido)
    const ancho = s.incertidumbre * (1 + 1.5 * lejos)
    const com = Math.max(2, Math.min(98, comercial + (s.derivaComercial ?? comercial * s.derivaInicial * 1.1) * lejos + (i === semanas ? 0 : (r() - 0.5) * 2.5)))
    const carga = s.carga * (1 + 0.14 * lejos * lejos)
    const pesoS = (v50 * 1e6) / (carga * s.arbolesHa)
    const pack = packout * Math.pow(com / comercial, 0.25)
    evolucion.push({
      semana: `S${semanaISO(fecha)}`,
      fecha,
      p10: v50 * (1 - ancho * 0.55),
      p50: v50,
      p90: v50 * (1 + ancho * 0.45),
      rango: [v50 * (1 - ancho * 0.55), v50 * (1 + ancho * 0.45)],
      comercial: com,
      carga,
      peso: pesoS,
      packout: pack,
      kgExport: (v50 * pack) / 100,
    })
  }

  // Curva de equilibrio carga ↔ valor
  const curva: PuntoEquilibrio[] = []
  for (let k = 0; k <= 30; k++) {
    const f = 0.5 + k * (0.95 / 30)
    const c = s.carga * f
    const media = s.calibreMedio * (1 + esp.elasticidadCarga * (f - 1))
    const rend = (c * s.arbolesHa * esp.tamanoAPeso(media)) / 1e6
    curva.push({
      carga: Math.round(c),
      valor: valorPorHa(esp, rend, media, s.defectos),
      rend,
      comercial: pctSobre(esp, media, esp.exigenciaComprador),
    })
  }
  const maxPt = curva.reduce((a, b) => (b.valor > a.valor ? b : a))
  const buenos = curva.filter((pt) => pt.valor >= maxPt.valor * 0.97)
  const rangoOptimo: [number, number] = [buenos[0].carga, buenos[buenos.length - 1].carga]
  // posición: -1 (le falta carga: más calibre que kilos) .. +1 (exceso de carga: más kilos que calibre)
  const centro = (rangoOptimo[0] + rangoOptimo[1]) / 2
  const posicion = Math.max(-1, Math.min(1, (s.carga - centro) / (centro * 0.3)))

  // KPI de apoyo
  const apoyo: KpiApoyoValor[] = (Object.keys(base) as KpiApoyoId[]).map((id) => {
    const decimales = ['ndvi', 'ndre', 'ndmi', 'ce'].includes(id)
    const valor = s.apoyo?.[id] ?? base[id] * (1 + (r() - 0.5) * (decimales ? 0.06 : 0.08))
    const serie: number[] = []
    let v = valor * (1 + (r() - 0.5) * 0.12)
    for (let k = 0; k < 8; k++) {
      serie.push(v)
      v = v + (valor - v) * 0.35 + valor * (r() - 0.5) * 0.04
    }
    serie[7] = valor
    const acumulado = id === 'gda' || id === 'frio'
    if (acumulado) {
      for (let k = 0; k < 8; k++) serie[k] = valor * (0.82 + 0.18 * (k / 7))
    }
    const rango = esp.rangosApoyo[id]
    const fuera = rango ? (valor < rango.min ? 'bajo' : valor > rango.max ? 'alto' : null) : null
    return { id, valor, previo: serie[6], serie, rango, fuera }
  })

  return {
    ...s,
    nombre: `Cuartel ${s.numero} – ${s.variedad}`,
    predioId: p.id,
    esp,
    arboles: Math.round(s.arbolesHa * s.ha),
    peso,
    rend: { p10, p50, p90 },
    dist,
    distHistorica,
    comercial,
    comercialPromedio,
    sobreUNECE,
    packout,
    kgExport,
    mejor,
    promedio,
    brecha: ((p50 - mejor.rendimiento) / mejor.rendimiento) * 100,
    brechaPromedio: ((p50 - promedio) / promedio) * 100,
    valorHa: valorPorHa(esp, p50, s.calibreMedio, s.defectos),
    evolucion,
    equilibrio: { curva, optima: maxPt.carga, rangoOptimo, valorOptimo: maxPt.valor, posicion },
    apoyo,
  }
}

/** Regla de estado de ejemplo (para validar coherencia de los datos simulados). */
export function estadoSugerido(c: CuartelCalc): Estado {
  const gap = c.esp.metaComercial - c.comercial
  if (gap > 12 || c.brecha < -25) return 'riesgo'
  if (gap > 3 || c.brechaPromedio < -8) return 'atencion'
  return 'ok'
}

// ---------- agregados del huerto ----------
export interface Agregado {
  rend: { p10: number; p50: number; p90: number }
  kgExport: number
  comercial: number
  packout: number
  carga: number
  peso: number
  brecha: number
  dist: number[]
  serie: Record<'rend' | 'kgExport' | 'comercial' | 'packout' | 'carga' | 'peso' | 'brecha', number[]>
  ha: number
}

export function agregar(cs: CuartelCalc[]): Agregado {
  const ha = cs.reduce((a, c) => a + c.ha, 0)
  const w = (f: (c: CuartelCalc) => number) => cs.reduce((a, c) => a + f(c) * c.ha, 0) / ha
  const n = Math.min(...cs.map((c) => c.evolucion.length))
  const serieDe = (f: (pt: PuntoSemana, c: CuartelCalc) => number) =>
    Array.from({ length: n }, (_, i) => cs.reduce((a, c) => a + f(c.evolucion[c.evolucion.length - n + i], c) * c.ha, 0) / ha)
  const mejorPond = w((c) => c.mejor.rendimiento)
  const rendSerie = serieDe((pt) => pt.p50)
  return {
    ha,
    rend: { p10: w((c) => c.rend.p10), p50: w((c) => c.rend.p50), p90: w((c) => c.rend.p90) },
    kgExport: w((c) => c.kgExport),
    comercial: w((c) => c.comercial),
    packout: w((c) => c.packout),
    carga: w((c) => c.carga),
    peso: w((c) => c.peso),
    brecha: ((w((c) => c.rend.p50) - mejorPond) / mejorPond) * 100,
    dist: cs[0].dist.map((_, i) => w((c) => c.dist[i])),
    serie: {
      rend: rendSerie,
      kgExport: serieDe((pt) => pt.kgExport),
      comercial: serieDe((pt) => pt.comercial),
      packout: serieDe((pt) => pt.packout),
      carga: serieDe((pt) => pt.carga),
      peso: serieDe((pt) => pt.peso),
      brecha: rendSerie.map((v) => ((v - mejorPond) / mejorPond) * 100),
    },
  }
}
