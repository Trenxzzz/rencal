import type { Especie, EspecieId, KpiApoyoId } from './types'

/*
 * ⚠️ VALORES DE EJEMPLO.
 * Las categorías de calibre, precios, mínimos UNECE, exigencias de comprador,
 * metas, rangos y etapas de este archivo son ficticios pero coherentes con
 * cada especie. Se configuran aquí para adaptar Rencal a otros cultivos y
 * mercados. No son cifras normativas ni comerciales reales.
 */

export const baseApoyo: Record<EspecieId, Record<KpiApoyoId, number>> = {
  manzano: {
    humedadSuelo: 28, ce: 0.6, tempSuelo: 17, ndvi: 0.74, ndre: 0.33, ndmi: 0.29,
    tmax: 24, tmin: 10, gda: 318, frio: 64, radiacion: 24.5, helada: 3,
    etc: 3.8, riego: 255, deficit: 5,
  },
  cerezo: {
    humedadSuelo: 27, ce: 0.9, tempSuelo: 19, ndvi: 0.75, ndre: 0.34, ndmi: 0.31,
    tmax: 27, tmin: 9, gda: 612, frio: 58, radiacion: 27.2, helada: 1,
    etc: 5.1, riego: 330, deficit: 4,
  },
  palto: {
    humedadSuelo: 34, ce: 0.5, tempSuelo: 19, ndvi: 0.83, ndre: 0.38, ndmi: 0.37,
    tmax: 24, tmin: 9, gda: 2360, frio: 0, radiacion: 18.4, helada: 6,
    etc: 2.9, riego: 140, deficit: 4,
  },
}

export const especies: Record<EspecieId, Especie> = {
  manzano: {
    id: 'manzano',
    nombre: 'Manzano',
    fruto: 'manzana',
    frutoPlural: 'manzanas',
    unidadCalibre: 'mm',
    medidaCalibre: 'diámetro ecuatorial',
    categorias: [
      { id: 'm60', etiqueta: '< 60 mm', nombre: 'Industria', desde: 0, hasta: 60, precio: 0.22 },
      { id: 'm65', etiqueta: '60–65', nombre: 'Pequeña', desde: 60, hasta: 65, precio: 0.55 },
      { id: 'm70', etiqueta: '65–70', nombre: 'Mediana', desde: 65, hasta: 70, precio: 0.78 },
      { id: 'm75', etiqueta: '70–75', nombre: 'Grande', desde: 70, hasta: 75, precio: 1.05 },
      { id: 'm80', etiqueta: '75–80', nombre: 'Extra', desde: 75, hasta: 80, precio: 1.2 },
      { id: 'm85', etiqueta: '≥ 80', nombre: 'Jumbo', desde: 80, hasta: 999, precio: 1.25 },
    ],
    minimoUNECE: 60,
    normaUNECE: 'UNECE FFV-50 (manzanas)',
    exigenciaComprador: 70,
    metaComercial: 62,
    sdCalibre: 5.8,
    costoKg: 0.3,
    elasticidadCarga: -0.16,
    tamanoAPeso: (d) => 4.7e-4 * d ** 3,
    inicioProyeccion: '2026-09-21',
    etapas: [
      { id: 'flor', nombre: 'Floración', inicio: '2026-09-15', fin: '2026-10-14', descripcion: 'Apertura de flores y polinización.' },
      { id: 'cuaja', nombre: 'Cuaja', inicio: '2026-10-15', fin: '2026-11-04', descripcion: 'La flor fecundada pasa a fruto. Se define la carga potencial.' },
      { id: 'crec', nombre: 'Crecimiento del fruto', inicio: '2026-11-05', fin: '2027-01-31', descripcion: 'División y expansión celular. Las primeras semanas son la última oportunidad de ajustar carga con raleo.' },
      { id: 'cosecha', nombre: 'Cosecha', inicio: '2027-02-01', fin: '2027-04-10', descripcion: 'Recolección por pasadas según variedad y madurez.' },
    ],
    rangosApoyo: {
      humedadSuelo: { min: 23, max: 34 }, ce: { min: 0.2, max: 1.2 }, tempSuelo: { min: 12, max: 22 },
      ndvi: { min: 0.65, max: 0.88 }, ndre: { min: 0.27, max: 0.42 }, ndmi: { min: 0.2, max: 0.4 },
      tmax: { min: 15, max: 30 }, tmin: { min: 4, max: 14 }, gda: { min: 260, max: 380 },
      frio: { min: 50, max: 90 }, radiacion: { min: 18, max: 30 }, helada: { min: 0, max: 15 },
      etc: { min: 2.5, max: 5.2 }, riego: { min: 200, max: 330 }, deficit: { min: 0, max: 12 },
    },
  },

  cerezo: {
    id: 'cerezo',
    nombre: 'Cerezo',
    fruto: 'cereza',
    frutoPlural: 'cerezas',
    unidadCalibre: 'mm',
    medidaCalibre: 'diámetro',
    categorias: [
      { id: 'c20', etiqueta: '< 20 mm', nombre: 'Descarte', desde: 0, hasta: 20, precio: 0.4 },
      { id: 'c22', etiqueta: '20–22', nombre: 'Mercado interno', desde: 20, hasta: 22, precio: 1.4 },
      { id: 'c24', etiqueta: '22–24', nombre: 'L', desde: 22, hasta: 24, precio: 2.6 },
      { id: 'c26', etiqueta: '24–26', nombre: 'XL', desde: 24, hasta: 26, precio: 4.1 },
      { id: 'c28', etiqueta: '26–28', nombre: 'J', desde: 26, hasta: 28, precio: 5.6 },
      { id: 'c30', etiqueta: '≥ 28', nombre: '2J+', desde: 28, hasta: 999, precio: 6.6 },
    ],
    minimoUNECE: 20,
    normaUNECE: 'UNECE FFV-13 (cerezas)',
    exigenciaComprador: 24,
    metaComercial: 68,
    sdCalibre: 2.1,
    costoKg: 1.6,
    elasticidadCarga: -0.12,
    tamanoAPeso: (d) => 5.6e-4 * d ** 3,
    inicioProyeccion: '2026-09-14',
    etapas: [
      { id: 'flor', nombre: 'Floración', inicio: '2026-09-01', fin: '2026-09-30', descripcion: 'Floración y polinización; clave la actividad de abejas.' },
      { id: 'cuaja', nombre: 'Cuaja', inicio: '2026-10-01', fin: '2026-10-20', descripcion: 'Se define la carga. Ventana de raleo de frutos.' },
      { id: 'crec', nombre: 'Crecimiento del fruto', inicio: '2026-10-21', fin: '2026-11-27', descripcion: 'Endurecimiento de carozo y última expansión celular. El agua define el calibre final.' },
      { id: 'cosecha', nombre: 'Cosecha', inicio: '2026-11-28', fin: '2027-01-10', descripcion: 'Cosecha por color y calibre, en pasadas.' },
    ],
    rangosApoyo: {
      humedadSuelo: { min: 23, max: 33 }, ce: { min: 0.3, max: 1.5 }, tempSuelo: { min: 14, max: 23 },
      ndvi: { min: 0.66, max: 0.88 }, ndre: { min: 0.28, max: 0.43 }, ndmi: { min: 0.22, max: 0.42 },
      tmax: { min: 20, max: 31 }, tmin: { min: 4, max: 13 }, gda: { min: 520, max: 720 },
      frio: { min: 50, max: 80 }, radiacion: { min: 22, max: 32 }, helada: { min: 0, max: 10 },
      etc: { min: 3.8, max: 6.5 }, riego: { min: 280, max: 400 }, deficit: { min: 0, max: 12 },
    },
  },

  palto: {
    id: 'palto',
    nombre: 'Palto (aguacate)',
    fruto: 'palta',
    frutoPlural: 'paltas',
    unidadCalibre: 'g',
    medidaCalibre: 'peso',
    categorias: [
      { id: 'p0', etiqueta: '< 123 g', nombre: 'Industria', desde: 0, hasta: 123, precio: 0.35 },
      { id: 'p84', etiqueta: '123–150', nombre: 'Cal. 84', desde: 123, hasta: 151, precio: 1.15 },
      { id: 'p70', etiqueta: '151–170', nombre: 'Cal. 70', desde: 151, hasta: 171, precio: 1.55 },
      { id: 'p60', etiqueta: '171–210', nombre: 'Cal. 60', desde: 171, hasta: 211, precio: 2.05 },
      { id: 'p48', etiqueta: '211–265', nombre: 'Cal. 48', desde: 211, hasta: 266, precio: 2.35 },
      { id: 'p40', etiqueta: '≥ 266', nombre: 'Cal. 40+', desde: 266, hasta: 9999, precio: 2.25 },
    ],
    minimoUNECE: 123,
    normaUNECE: 'UNECE FFV-42 (aguacates)',
    exigenciaComprador: 171,
    metaComercial: 58,
    sdCalibre: 36,
    costoKg: 0.6,
    elasticidadCarga: -0.4,
    tamanoAPeso: (g) => g,
    inicioProyeccion: '2026-07-20',
    etapas: [
      { id: 'flor', nombre: 'Floración', inicio: '2026-02-01', fin: '2026-03-31', descripcion: 'Floración principal (flor normal).' },
      { id: 'cuaja', nombre: 'Cuaja', inicio: '2026-04-01', fin: '2026-05-15', descripcion: 'Cuaja y caída fisiológica de frutos.' },
      { id: 'crec', nombre: 'Crecimiento del fruto', inicio: '2026-05-16', fin: '2026-12-15', descripcion: 'Llenado del fruto. La palta sigue ganando peso mientras esté en el árbol.' },
      { id: 'cosecha', nombre: 'Cosecha', inicio: '2026-12-16', fin: '2027-04-30', descripcion: 'Cosecha escalonada por materia seca y calibre.' },
    ],
    rangosApoyo: {
      humedadSuelo: { min: 28, max: 40 }, ce: { min: 0.2, max: 1.0 }, tempSuelo: { min: 15, max: 23 },
      ndvi: { min: 0.74, max: 0.92 }, ndre: { min: 0.31, max: 0.46 }, ndmi: { min: 0.27, max: 0.46 },
      tmax: { min: 18, max: 29 }, tmin: { min: 5, max: 14 }, gda: { min: 2150, max: 2600 },
      frio: { min: 0, max: 9999 }, radiacion: { min: 14, max: 23 }, helada: { min: 0, max: 15 },
      etc: { min: 2, max: 4 }, riego: { min: 100, max: 200 }, deficit: { min: 0, max: 12 },
    },
  },
}
