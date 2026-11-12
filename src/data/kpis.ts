import type { KpiApoyoId } from './types'

export type KpiPrincipalId = 'rend' | 'kgExport' | 'comercial' | 'packout' | 'carga' | 'peso' | 'brecha'

export const kpiPrincipal: Record<KpiPrincipalId, { label: string; unidad: string; dec: number; tip: string; mejorSiSube: boolean }> = {
  rend: { label: 'Rendimiento proyectado', unidad: 't/ha', dec: 1, mejorSiSube: true, tip: 'Toneladas de fruta que se espera cosechar por hectárea. Se muestra el valor más probable y un rango: hay 80 % de probabilidad de que el resultado real quede dentro de él.' },
  kgExport: { label: 'Exportable proyectado', unidad: 't/ha', dec: 1, mejorSiSube: true, tip: 'Toneladas por hectárea que cumplirían el calibre mínimo y la calidad para exportar. Es el rendimiento multiplicado por el packout.' },
  comercial: { label: 'Calibre comercial', unidad: '%', dec: 0, mejorSiSube: true, tip: 'Porcentaje de la fruta que alcanzaría el calibre que exige el comprador del mercado de destino. Se compara con la meta de la temporada.' },
  packout: { label: 'Packout proyectado', unidad: '%', dec: 0, mejorSiSube: true, tip: 'Proporción de la fruta cosechada que se podría embalar para exportación: supera el mínimo de calibre y no tiene defectos de calidad.' },
  carga: { label: 'Carga frutal', unidad: 'frutos/árbol', dec: 0, mejorSiSube: false, tip: 'Número estimado de frutos por árbol, según conteos y fotografías en árboles de muestra. Más frutos dan más kilos, pero fruta más chica.' },
  peso: { label: 'Peso medio por fruto', unidad: 'g', dec: 0, mejorSiSube: true, tip: 'Peso promedio proyectado de cada fruto a cosecha. Está muy ligado al calibre.' },
  brecha: { label: 'Brecha vs mejor temporada', unidad: '%', dec: 1, mejorSiSube: true, tip: 'Diferencia entre el rendimiento proyectado y la mejor temporada registrada del cuartel (o del huerto). Un valor negativo indica que se está por debajo de ese techo.' },
}

export const gruposApoyo: { id: string; nombre: string; kpis: KpiApoyoId[] }[] = [
  { id: 'suelo', nombre: 'Suelo', kpis: ['humedadSuelo', 'ce', 'tempSuelo'] },
  { id: 'veg', nombre: 'Vegetación', kpis: ['ndvi', 'ndre', 'ndmi'] },
  { id: 'clima', nombre: 'Clima', kpis: ['tmax', 'tmin', 'gda', 'frio', 'radiacion', 'helada'] },
  { id: 'agua', nombre: 'Agua', kpis: ['etc', 'riego', 'deficit'] },
]

export const kpiApoyo: Record<KpiApoyoId, { label: string; unidad: string; dec: number; tip: string }> = {
  humedadSuelo: { label: 'Humedad de suelo', unidad: '%', dec: 1, tip: 'Contenido volumétrico de agua en la zona de raíces, medido por sensores en terreno.' },
  ce: { label: 'Conductividad eléctrica', unidad: 'dS/m', dec: 2, tip: 'Indica la cantidad de sales en el suelo. Valores altos dificultan que la planta absorba agua.' },
  tempSuelo: { label: 'Temp. de suelo', unidad: '°C', dec: 1, tip: 'Temperatura del suelo a 20 cm. Influye en la actividad de las raíces.' },
  ndvi: { label: 'NDVI', unidad: '', dec: 2, tip: 'Índice de vigor de la vegetación calculado con imágenes satelitales. Más alto significa follaje más denso y verde.' },
  ndre: { label: 'NDRE', unidad: '', dec: 2, tip: 'Índice de vigor sensible al contenido de clorofila y nitrógeno, útil cuando el follaje ya es denso.' },
  ndmi: { label: 'NDMI', unidad: '', dec: 2, tip: 'Índice de contenido de agua en las hojas. Si baja, la planta puede estar con estrés hídrico.' },
  tmax: { label: 'Temp. máxima', unidad: '°C', dec: 1, tip: 'Temperatura máxima promedio de los últimos 7 días.' },
  tmin: { label: 'Temp. mínima', unidad: '°C', dec: 1, tip: 'Temperatura mínima promedio de los últimos 7 días.' },
  gda: { label: 'Grados día', unidad: 'GD', dec: 0, tip: 'Calor acumulado desde floración (base 10 °C). Ayuda a anticipar el avance de las etapas del cultivo.' },
  frio: { label: 'Porciones de frío', unidad: 'PF', dec: 0, tip: 'Frío invernal acumulado. Un frío insuficiente provoca floración despareja.' },
  radiacion: { label: 'Radiación solar', unidad: 'MJ/m²', dec: 1, tip: 'Energía solar diaria promedio de la última semana. Es el motor de la fotosíntesis.' },
  helada: { label: 'Riesgo de helada', unidad: '%', dec: 0, tip: 'Probabilidad de que la temperatura baje de 0 °C en los próximos 7 días, según el pronóstico.' },
  etc: { label: 'ETc', unidad: 'mm/día', dec: 1, tip: 'Evapotranspiración del cultivo: el agua que el huerto pierde por día y que el riego debe reponer.' },
  riego: { label: 'Riego aplicado', unidad: 'm³/ha', dec: 0, tip: 'Agua de riego aplicada en los últimos 7 días.' },
  deficit: { label: 'Déficit hídrico', unidad: '%', dec: 1, tip: 'Cuánto faltó para cubrir la demanda de agua del cultivo en la última semana.' },
}
