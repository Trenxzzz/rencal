// Tipos del prototipo Rencal. Todos los datos que los usan son SIMULADOS.

export type EspecieId = 'manzano' | 'cerezo' | 'palto'
export type Estado = 'ok' | 'atencion' | 'riesgo'
export type Severidad = 'alta' | 'media' | 'baja'

export interface CategoriaCalibre {
  id: string
  etiqueta: string // ej. "24–26 mm"
  nombre?: string // ej. "XL"
  desde: number // límite inferior (incl.) en la unidad de calibre de la especie
  hasta: number // límite superior (excl.)
  precio: number // USD/kg de ejemplo
}

export interface Etapa {
  id: string
  nombre: string
  inicio: string // ISO yyyy-mm-dd
  fin: string
  descripcion: string
}

export interface RangoKpi {
  min: number
  max: number
}

export interface Especie {
  id: EspecieId
  nombre: string // "Manzano"
  fruto: string // "manzana"
  frutoPlural: string
  unidadCalibre: 'mm' | 'g'
  medidaCalibre: string // "diámetro ecuatorial" | "peso"
  categorias: CategoriaCalibre[]
  /** Mínimo de calibre según norma UNECE FFV (valor de EJEMPLO, no normativo). */
  minimoUNECE: number
  normaUNECE: string
  /** Especificación del comprador del mercado de destino (EJEMPLO). */
  exigenciaComprador: number
  /** % mínimo de fruta sobre la exigencia del comprador que se espera (EJEMPLO). */
  metaComercial: number
  sdCalibre: number
  /** Costo de cosecha y embalaje por kg (EJEMPLO, USD/kg). */
  costoKg: number
  /** Elasticidad del calibre medio frente a la carga frutal (EJEMPLO). */
  elasticidadCarga: number
  tamanoAPeso: (calibre: number) => number
  etapas: Etapa[]
  inicioProyeccion: string
  /** Rangos esperados de los KPI de apoyo para esta especie y momento (EJEMPLO). */
  rangosApoyo: Record<KpiApoyoId, RangoKpi>
}

export type KpiApoyoId =
  | 'humedadSuelo'
  | 'ce'
  | 'tempSuelo'
  | 'ndvi'
  | 'ndre'
  | 'ndmi'
  | 'tmax'
  | 'tmin'
  | 'gda'
  | 'frio'
  | 'radiacion'
  | 'helada'
  | 'etc'
  | 'riego'
  | 'deficit'

export interface FactorHipotesis {
  hipotesis: string
  evidencia: string
  comoEvaluar: string
  confianza: 'alta' | 'media' | 'baja'
}

export type TipoAccion = 'raleo' | 'riego' | 'nutricion' | 'cosecha' | 'monitoreo' | 'proteccion'

export interface Recomendacion {
  id: string
  tipo: TipoAccion
  accion: string
  detalle: string
  ventanaInicio: string
  ventanaFin: string
  impacto: string
  prioridad: Severidad
  nota?: string
  /** Si es true, la UI muestra la carga objetivo calculada por la curva de equilibrio. */
  cargaObjetivo?: boolean
}

export interface Alerta {
  id: string
  predioId: string
  cuartelId: string
  severidad: Severidad
  titulo: string
  queOcurre: string
  factores: FactorHipotesis[]
  recomendacionIds: string[]
  fecha: string
  metodo: string // fuente de la señal
}

export interface CuartelSemilla {
  id: string
  numero: number
  variedad: string
  ha: number
  arbolesHa: number
  carga: number // frutos/árbol estimados
  calibreMedio: number // calibre medio proyectado a la carga actual
  defectos: number // fracción descartada por defectos (no calibre)
  incertidumbre: number // ancho relativo del rango (p10–p90)
  historial: { temporada: string; rendimiento: number; comercial: number }[]
  /** Tendencia de la proyección durante la temporada (rendimiento inicial relativo). */
  derivaInicial: number
  /** Puntos porcentuales de calibre comercial al inicio de la proyección respecto de hoy. */
  derivaComercial?: number
  apoyo?: Partial<Record<KpiApoyoId, number>>
  recomendaciones: Recomendacion[]
  estado: Estado
  resumen: string
  /** Posición del bloque en el mapa: fila, ancho relativo */
  fila: number
}

export interface Predio {
  id: string
  nombre: string
  huerto: string
  region: string
  pais: string
  especie: EspecieId
  mercado: string
  centro: [number, number]
  rotacion: number // grados, alinea los cuarteles con la hilera
  filaAlto: number // metros
  fechaHoy: string
  temporada: string
  cuarteles: CuartelSemilla[]
  alertas: Alerta[]
}
