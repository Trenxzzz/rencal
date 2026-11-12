import type { CuartelSemilla, Predio, Recomendacion } from './types'

/*
 * ⚠️ DATOS SIMULADOS DE EJEMPLO.
 * Predios, empresas y cifras son ficticios. Las ubicaciones corresponden a
 * zonas agrícolas reales solo para dar contexto a la imagen satelital.
 *
 * En los textos de alertas se pueden usar marcadores que la interfaz reemplaza
 * con los valores calculados del cuartel: {comercial} {meta} {exigencia}
 * {carga} {optimo} {rend} {brecha} {promedio}.
 */

const T = ['2021–22', '2022–23', '2023–24', '2024–25', '2025–26']
const hist = (rend: number[], com: number[]) => rend.map((r, i) => ({ temporada: T[i], rendimiento: r, comercial: com[i] }))

const monitoreo = (id: string, extra?: Partial<Recomendacion>): Recomendacion => ({
  id,
  tipo: 'monitoreo',
  accion: 'Mantener el manejo actual',
  detalle: 'El cuartel está en línea con lo esperado. Continuar con el programa de riego y nutrición vigente y registrar el próximo conteo semanal.',
  ventanaInicio: '2026-11-12',
  ventanaFin: '2026-11-19',
  impacto: 'Mantiene la proyección dentro del rango esperado.',
  prioridad: 'baja',
  ...extra,
})

// ---------------------------------------------------------------------------
// 1) Manzanos · Valle de Elgin, Sudáfrica
// ---------------------------------------------------------------------------
const manzanos: CuartelSemilla[] = [
  {
    id: 'm1', numero: 1, variedad: 'Royal Gala', ha: 4.2, arbolesHa: 2500, carga: 128, calibreMedio: 72.4,
    defectos: 0.07, incertidumbre: 0.16, derivaInicial: -0.04, fila: 0, estado: 'ok',
    historial: hist([51.2, 55.8, 49.6, 57.9, 54.1], [61, 66, 58, 69, 64]),
    resumen: 'Carga equilibrada y calibre en línea con su historial.',
    recomendaciones: [monitoreo('m1-r1')],
  },
  {
    id: 'm2', numero: 2, variedad: 'Granny Smith', ha: 5.1, arbolesHa: 2200, carga: 140, calibreMedio: 73.1,
    defectos: 0.06, incertidumbre: 0.15, derivaInicial: 0.02, fila: 0, estado: 'ok',
    historial: hist([53.4, 58.2, 55.1, 60.3, 56.7], [64, 70, 66, 73, 68]),
    resumen: 'Buen vigor y calibre sobre la exigencia del comprador.',
    recomendaciones: [
      {
        id: 'm2-r1', tipo: 'proteccion', accion: 'Aplicar protector solar (caolín) antes del evento de calor',
        detalle: 'Se pronostican máximas sobre 31 °C. Granny Smith es sensible a golpe de sol en la cara expuesta.',
        ventanaInicio: '2026-11-14', ventanaFin: '2026-11-17', impacto: 'Reduce descarte por daño de sol en 2–4 %.', prioridad: 'baja',
      },
    ],
  },
  {
    id: 'm3', numero: 3, variedad: 'Fuji', ha: 3.8, arbolesHa: 2500, carga: 172, calibreMedio: 66.4,
    defectos: 0.09, incertidumbre: 0.22, derivaInicial: -0.08, derivaComercial: 22, fila: 0, estado: 'riesgo',
    historial: hist([52.8, 61.7, 55.0, 58.4, 54.6], [63, 71, 60, 68, 62]),
    apoyo: { ndre: 0.255, ndvi: 0.68 },
    resumen: 'Exceso de carga frutal: muchos kilos, pero fruta chica.',
    recomendaciones: [
      {
        id: 'm3-r1', tipo: 'raleo', accion: 'Raleo manual de ajuste de carga',
        detalle: 'Dejar un fruto por dardo, eliminando primero frutos laterales, deformes o dañados. Priorizar los árboles con más de 160 frutos.',
        ventanaInicio: '2026-11-12', ventanaFin: '2026-11-28',
        impacto: 'Es la acción con mayor efecto sobre el calibre en esta etapa. Después del 28 de noviembre el fruto pierde capacidad de responder.',
        prioridad: 'alta', cargaObjetivo: true,
      },
      {
        id: 'm3-r2', tipo: 'riego', accion: 'Reponer riego al 100 % de la ETc',
        detalle: 'Durante la división celular cualquier déficit reduce el número final de células del fruto. Revisar presiones al final de las líneas.',
        ventanaInicio: '2026-11-12', ventanaFin: '2027-01-31',
        impacto: 'Sostiene la expansión del fruto tras el raleo.', prioridad: 'media',
      },
      {
        id: 'm3-r3', tipo: 'nutricion', accion: 'Análisis foliar y plan de nitrógeno postcosecha',
        detalle: 'El NDRE bajo en el sector sur sugiere menor vigor. Confirmar con análisis foliar antes de decidir.',
        ventanaInicio: '2026-12-01', ventanaFin: '2026-12-15',
        impacto: 'Efecto lento: mejora la reserva para la próxima temporada.', prioridad: 'baja',
        nota: 'La nutrición actúa con semanas o meses de desfase.',
      },
    ],
  },
  {
    id: 'm4', numero: 4, variedad: 'Cripps Pink', ha: 4.6, arbolesHa: 2500, carga: 118, calibreMedio: 70.9,
    defectos: 0.08, incertidumbre: 0.18, derivaInicial: 0.03, derivaComercial: 6, fila: 1, estado: 'atencion',
    historial: hist([50.6, 56.9, 53.2, 57.4, 54.8], [58, 65, 60, 66, 63]),
    apoyo: { humedadSuelo: 21.4, deficit: 14.5, ndmi: 0.21 },
    resumen: 'Calibre algo bajo la meta; posible riego desuniforme.',
    recomendaciones: [
      {
        id: 'm4-r1', tipo: 'riego', accion: 'Revisar uniformidad del riego en el sector norte',
        detalle: 'Medir caudal de goteros en 3 líneas del sector norte y limpiar filtros. Ajustar la frecuencia a pulsos cortos diarios.',
        ventanaInicio: '2026-11-12', ventanaFin: '2026-11-20',
        impacto: 'Corrige el déficit hídrico que hoy limita el calibre.', prioridad: 'media',
      },
      {
        id: 'm4-r2', tipo: 'raleo', accion: 'Raleo manual selectivo solo en árboles sobrecargados',
        detalle: 'Ralear únicamente árboles con más de 135 frutos. El resto del cuartel tiene una carga adecuada.',
        ventanaInicio: '2026-11-12', ventanaFin: '2026-11-28',
        impacto: 'Mejora el calibre en la fracción del cuartel más cargada.', prioridad: 'baja',
      },
    ],
  },
  {
    id: 'm5', numero: 5, variedad: 'Golden Delicious', ha: 3.2, arbolesHa: 2700, carga: 120, calibreMedio: 72.8,
    defectos: 0.08, incertidumbre: 0.15, derivaInicial: -0.02, fila: 1, estado: 'ok',
    historial: hist([54.8, 59.1, 56.3, 61.2, 57.5], [62, 68, 63, 70, 66]),
    resumen: 'En línea con su promedio histórico.',
    recomendaciones: [monitoreo('m5-r1')],
  },
  {
    id: 'm6', numero: 6, variedad: 'Royal Gala', ha: 4.0, arbolesHa: 2500, carga: 124, calibreMedio: 72.6,
    defectos: 0.07, incertidumbre: 0.15, derivaInicial: 0.01, fila: 1, estado: 'ok',
    historial: hist([49.9, 54.6, 51.8, 56.2, 53.9], [60, 66, 61, 68, 65]),
    resumen: 'Proyección estable; cerca de su mejor temporada.',
    recomendaciones: [monitoreo('m6-r1')],
  },
  {
    id: 'm7', numero: 7, variedad: 'Granny Smith', ha: 3.5, arbolesHa: 2200, carga: 134, calibreMedio: 73.6,
    defectos: 0.06, incertidumbre: 0.15, derivaInicial: -0.01, fila: 1, estado: 'ok',
    historial: hist([52.1, 57.0, 54.4, 59.6, 55.8], [65, 71, 67, 74, 69]),
    resumen: 'Calibre sobre la exigencia y carga dentro del rango óptimo.',
    recomendaciones: [monitoreo('m7-r1')],
  },
]

// ---------------------------------------------------------------------------
// 2) Cerezos · Valle del Cachapoal, Chile
// ---------------------------------------------------------------------------
const cerezos: CuartelSemilla[] = [
  {
    id: 'c1', numero: 1, variedad: 'Santina', ha: 3.6, arbolesHa: 1250, carga: 1500, calibreMedio: 25.6,
    defectos: 0.08, incertidumbre: 0.2, derivaInicial: -0.03, fila: 0, estado: 'ok',
    historial: hist([15.8, 17.9, 13.6, 18.4, 16.9], [70, 76, 66, 78, 73]),
    resumen: 'Buena carga y calibre sobre la meta.',
    recomendaciones: [monitoreo('c1-r1')],
  },
  {
    id: 'c2', numero: 2, variedad: 'Lapins', ha: 4.4, arbolesHa: 1100, carga: 1720, calibreMedio: 25.3,
    defectos: 0.09, incertidumbre: 0.2, derivaInicial: 0.02, fila: 0, estado: 'ok',
    historial: hist([16.1, 18.7, 14.2, 19.3, 17.4], [67, 73, 62, 75, 70]),
    resumen: 'En línea con lo esperado. Variedad sensible a partidura.',
    recomendaciones: [
      {
        id: 'c2-r1', tipo: 'proteccion', accion: 'Revisar y cerrar cubiertas plásticas antes de la lluvia',
        detalle: 'Se pronostican 8–12 mm de lluvia. Lapins está cerca de pinta, cuando la partidura es más probable.',
        ventanaInicio: '2026-11-12', ventanaFin: '2026-11-15', impacto: 'Evita pérdidas por partidura de 5–15 %.', prioridad: 'baja',
      },
    ],
  },
  {
    id: 'c3', numero: 3, variedad: 'Regina', ha: 5.0, arbolesHa: 1000, carga: 1480, calibreMedio: 26.0,
    defectos: 0.07, incertidumbre: 0.18, derivaInicial: -0.02, fila: 0, estado: 'ok',
    historial: hist([12.9, 15.2, 11.8, 15.9, 14.6], [74, 80, 70, 82, 77]),
    resumen: 'Calibre alto, propio de la variedad.',
    recomendaciones: [monitoreo('c3-r1')],
  },
  {
    id: 'c4', numero: 4, variedad: 'Sweetheart', ha: 3.1, arbolesHa: 1250, carga: 1920, calibreMedio: 23.2,
    defectos: 0.1, incertidumbre: 0.26, derivaInicial: -0.06, derivaComercial: 24, fila: 1, estado: 'riesgo',
    historial: hist([16.4, 19.6, 14.8, 20.2, 17.8], [66, 72, 61, 74, 69]),
    apoyo: { humedadSuelo: 19.6, deficit: 19, ndmi: 0.19, tmax: 31.6 },
    resumen: 'Carga alta y déficit hídrico: calibre muy por debajo de la meta.',
    recomendaciones: [
      {
        id: 'c4-r1', tipo: 'riego', accion: 'Subir el riego al 110 % de la ETc, en 2 pulsos diarios',
        detalle: 'Corregir el déficit durante la última expansión del fruto. Verificar con el sensor de humedad que el suelo vuelva sobre 24 %.',
        ventanaInicio: '2026-11-12', ventanaFin: '2026-11-27',
        impacto: 'Es la última palanca antes de cosecha: puede recuperar 0,5–1 mm de calibre medio.', prioridad: 'alta',
      },
      {
        id: 'c4-r2', tipo: 'cosecha', accion: 'Cosechar por calibre en 2–3 pasadas',
        detalle: 'En la primera pasada cosechar solo fruta ≥ 24 mm. Dejar la fruta menor en el árbol para que siga creciendo.',
        ventanaInicio: '2026-11-28', ventanaFin: '2026-12-14',
        impacto: 'Aumenta la proporción de fruta XL y mayor en los envíos.', prioridad: 'media',
      },
      {
        id: 'c4-r3', tipo: 'nutricion', accion: 'Planificar poda de dardos y nitrógeno postcosecha',
        detalle: 'El raleo ya no es posible en esta etapa. Para la próxima temporada, regular la carga desde la poda invernal.',
        ventanaInicio: '2027-01-15', ventanaFin: '2027-03-15',
        impacto: 'Efecto en la próxima temporada.', prioridad: 'baja',
        nota: 'La ventana de raleo de frutos cerró con la cuaja (20 de octubre).',
      },
    ],
  },
  {
    id: 'c5', numero: 5, variedad: 'Kordia', ha: 2.8, arbolesHa: 1000, carga: 1560, calibreMedio: 24.75,
    defectos: 0.08, incertidumbre: 0.2, derivaInicial: 0.01, derivaComercial: 5, fila: 1, estado: 'atencion',
    historial: hist([13.6, 16.4, 12.7, 16.9, 15.5], [70, 76, 66, 78, 73]),
    apoyo: { deficit: 12.8, ndmi: 0.215 },
    resumen: 'Calibre algo bajo la meta; señales de estrés hídrico leve.',
    recomendaciones: [
      {
        id: 'c5-r1', tipo: 'riego', accion: 'Aumentar el tiempo de riego en un 15 %',
        detalle: 'El NDMI y el déficit hídrico muestran estrés leve. Ajustar el riego y revisar el sensor de humedad del cuartel.',
        ventanaInicio: '2026-11-12', ventanaFin: '2026-11-27',
        impacto: 'Puede llevar el calibre comercial cerca de la meta.', prioridad: 'media',
      },
    ],
  },
  {
    id: 'c6', numero: 6, variedad: 'Santina', ha: 3.9, arbolesHa: 1250, carga: 1440, calibreMedio: 25.7,
    defectos: 0.08, incertidumbre: 0.19, derivaInicial: 0, fila: 1, estado: 'ok',
    historial: hist([15.1, 17.2, 13.4, 17.8, 16.6], [71, 77, 67, 79, 74]),
    resumen: 'Proyección estable.',
    recomendaciones: [monitoreo('c6-r1')],
  },
]

// ---------------------------------------------------------------------------
// 3) Paltos (aguacates) · Meseta Purépecha, Michoacán, México
// ---------------------------------------------------------------------------
const paltos: CuartelSemilla[] = [
  {
    id: 'p1', numero: 1, variedad: 'Hass', ha: 5.5, arbolesHa: 204, carga: 290, calibreMedio: 188,
    defectos: 0.07, incertidumbre: 0.18, derivaInicial: -0.03, fila: 0, estado: 'ok',
    historial: hist([9.6, 12.4, 8.9, 11.8, 10.7], [56, 62, 54, 64, 60]),
    resumen: 'Calibre sobre la meta y buena carga.',
    recomendaciones: [monitoreo('p1-r1', { ventanaFin: '2026-11-26', detalle: 'En línea con lo esperado. Continuar riego y registrar el muestreo de materia seca de la próxima quincena.' })],
  },
  {
    id: 'p2', numero: 2, variedad: 'Hass', ha: 6.2, arbolesHa: 204, carga: 305, calibreMedio: 183,
    defectos: 0.07, incertidumbre: 0.18, derivaInicial: 0.02, fila: 0, estado: 'ok',
    historial: hist([10.1, 12.9, 9.4, 12.2, 11.3], [55, 61, 52, 63, 59]),
    resumen: 'En línea con su historial.',
    recomendaciones: [monitoreo('p2-r1', { ventanaFin: '2026-11-26' })],
  },
  {
    id: 'p3', numero: 3, variedad: 'Méndez', ha: 4.8, arbolesHa: 204, carga: 362, calibreMedio: 151,
    defectos: 0.09, incertidumbre: 0.24, derivaInicial: -0.05, derivaComercial: 20, fila: 0, estado: 'riesgo',
    historial: hist([10.4, 13.1, 9.2, 12.6, 11.5], [54, 60, 50, 62, 57]),
    apoyo: { humedadSuelo: 26.1, deficit: 17.5, ndmi: 0.245 },
    resumen: 'Alta carga y déficit hídrico: fruta chica para el comprador.',
    recomendaciones: [
      {
        id: 'p3-r1', tipo: 'riego', accion: 'Corregir el déficit hídrico: riego al 100 % de la ETc',
        detalle: 'Revisar microaspersores obstruidos en la parte alta del cuartel y extender el tiempo de riego hasta que la humedad del suelo supere 30 %.',
        ventanaInicio: '2026-11-12', ventanaFin: '2026-12-15',
        impacto: 'El fruto todavía está llenando: el agua de estas semanas define su peso.', prioridad: 'alta',
      },
      {
        id: 'p3-r2', tipo: 'cosecha', accion: 'Postergar la cosecha y cosechar por tamaño',
        detalle: 'La palta sigue ganando peso en el árbol. Retrasar la primera pasada 4–6 semanas y cosechar solo fruta ≥ 171 g (Cal. 60 y mayores).',
        ventanaInicio: '2026-12-16', ventanaFin: '2027-02-15',
        impacto: 'Puede subir el calibre comercial en 12–18 pp con poca pérdida de kilos.', prioridad: 'alta',
      },
      {
        id: 'p3-r3', tipo: 'nutricion', accion: 'Aplicar potasio y boro antes de la floración',
        detalle: 'Su efecto es lento: apoya el llenado tardío y la próxima floración. Confirmar dosis con análisis foliar.',
        ventanaInicio: '2026-11-20', ventanaFin: '2026-12-20',
        impacto: 'Efecto principal en la próxima temporada.', prioridad: 'baja',
        nota: 'La nutrición actúa con semanas o meses de desfase.',
      },
    ],
  },
  {
    id: 'p4', numero: 4, variedad: 'Hass', ha: 5.0, arbolesHa: 156, carga: 342, calibreMedio: 186,
    defectos: 0.08, incertidumbre: 0.18, derivaInicial: -0.01, fila: 1, estado: 'ok',
    historial: hist([7.9, 10.2, 7.4, 9.9, 9.1], [57, 63, 53, 65, 60]),
    resumen: 'En línea con lo esperado. Zona expuesta a heladas.',
    recomendaciones: [
      {
        id: 'p4-r1', tipo: 'proteccion', accion: 'Preparar riego antihelada para la noche del 16 de noviembre',
        detalle: 'Se pronostican mínimas cercanas a 1 °C en la parte baja del cuartel. Regar la tarde anterior para acumular calor en el suelo.',
        ventanaInicio: '2026-11-15', ventanaFin: '2026-11-17', impacto: 'Reduce el daño por frío en fruta y brotes.', prioridad: 'baja',
      },
    ],
  },
  {
    id: 'p5', numero: 5, variedad: 'Hass (ladera)', ha: 4.1, arbolesHa: 204, carga: 288, calibreMedio: 174.5,
    defectos: 0.08, incertidumbre: 0.2, derivaInicial: 0.02, derivaComercial: 5, fila: 1, estado: 'atencion',
    historial: hist([9.3, 11.8, 8.6, 11.4, 10.6], [56, 61, 52, 63, 59]),
    apoyo: { humedadSuelo: 27.4, deficit: 13.2 },
    resumen: 'Calibre bajo la meta; la ladera retiene menos agua.',
    recomendaciones: [
      {
        id: 'p5-r1', tipo: 'riego', accion: 'Fraccionar el riego en la ladera (2 turnos diarios)',
        detalle: 'El suelo de ladera drena rápido. Riegos más cortos y frecuentes mantienen la humedad en la zona de raíces.',
        ventanaInicio: '2026-11-12', ventanaFin: '2026-12-15',
        impacto: 'Puede acercar el calibre comercial a la meta.', prioridad: 'media',
      },
    ],
  },
  {
    id: 'p6', numero: 6, variedad: 'Hass', ha: 5.7, arbolesHa: 204, carga: 298, calibreMedio: 190,
    defectos: 0.07, incertidumbre: 0.17, derivaInicial: 0, fila: 1, estado: 'ok',
    historial: hist([9.9, 12.6, 9.1, 12.3, 11.2], [58, 64, 55, 66, 61]),
    resumen: 'Mejor proyección del huerto.',
    recomendaciones: [monitoreo('p6-r1', { ventanaFin: '2026-11-26' })],
  },
  {
    id: 'p7', numero: 7, variedad: 'Méndez', ha: 3.9, arbolesHa: 204, carga: 282, calibreMedio: 185,
    defectos: 0.08, incertidumbre: 0.18, derivaInicial: -0.02, fila: 1, estado: 'ok',
    historial: hist([9.8, 12.2, 8.8, 11.9, 10.9], [55, 61, 51, 63, 58]),
    resumen: 'En línea con lo esperado.',
    recomendaciones: [monitoreo('p7-r1', { ventanaFin: '2026-11-26' })],
  },
]

export const predios: Predio[] = [
  {
    id: 'elgin',
    nombre: 'Agrícola Los Robles del Cabo',
    huerto: 'Huerto Palmiet',
    region: 'Valle de Elgin, Cabo Occidental',
    pais: 'Sudáfrica',
    especie: 'manzano',
    mercado: 'Supermercados del norte de Europa',
    centro: [-34.1748, 19.0482],
    rotacion: -20,
    filaAlto: 190,
    fechaHoy: '2026-11-12',
    temporada: '2026–27',
    cuarteles: manzanos,
    alertas: [
      {
        id: 'a-m3-1', predioId: 'elgin', cuartelId: 'm3', severidad: 'alta', fecha: '2026-11-12',
        titulo: 'Calibre comercial muy bajo la meta: solo {comercial} de la fruta llegaría a {exigencia} o más (meta {meta})',
        queOcurre: 'La carga frutal estimada ({carga} frutos/árbol) supera el rango óptimo ({optimo}). Habrá muchos kilos, pero la mayoría de la fruta no alcanzaría el calibre que pide el comprador.',
        metodo: 'Conteo y fotografías en 20 árboles de muestra · imagen satelital',
        factores: [
          { hipotesis: 'Cuaja excesiva y raleo químico poco eficaz', evidencia: 'El conteo en árboles de muestra está 34 % sobre el promedio histórico del cuartel.', comoEvaluar: 'Comparar los conteos posteriores al raleo químico con el registro de aplicación (fecha, dosis y temperatura).', confianza: 'alta' },
          { hipotesis: 'Menor vigor en el sector sur del cuartel', evidencia: 'NDRE 0,26, bajo el rango esperado, en las últimas 3 imágenes satelitales.', comoEvaluar: 'Recorrer el sector sur, revisar el crecimiento de brotes y el color de las hojas; hacer análisis foliar si se confirma.', confianza: 'media' },
        ],
        recomendacionIds: ['m3-r1', 'm3-r2'],
      },
      {
        id: 'a-m4-1', predioId: 'elgin', cuartelId: 'm4', severidad: 'media', fecha: '2026-11-11',
        titulo: 'Calibre comercial bajo la meta ({comercial} vs {meta}) y déficit hídrico',
        queOcurre: 'El sector norte muestra humedad de suelo bajo el rango y el rendimiento proyectado está {promedio} respecto del promedio histórico.',
        metodo: 'Sensor de humedad de suelo · NDMI satelital',
        factores: [
          { hipotesis: 'Riego desuniforme por baja presión en el sector norte', evidencia: 'El sensor del sector norte marca 21 % de humedad frente a 28 % en el sector sur.', comoEvaluar: 'Medir el caudal de goteros al inicio y al final de 3 líneas.', confianza: 'alta' },
          { hipotesis: 'Polinización afectada por viento durante la floración', evidencia: 'Se registraron 6 días con viento sobre 35 km/h en plena flor.', comoEvaluar: 'Revisar el número de semillas en una muestra de 30 frutos.', confianza: 'baja' },
        ],
        recomendacionIds: ['m4-r1', 'm4-r2'],
      },
      {
        id: 'a-m2-1', predioId: 'elgin', cuartelId: 'm2', severidad: 'baja', fecha: '2026-11-12',
        titulo: 'Pronóstico de calor: riesgo de golpe de sol',
        queOcurre: 'Se esperan máximas sobre 31 °C entre el 15 y el 17 de noviembre.',
        metodo: 'Pronóstico meteorológico local',
        factores: [{ hipotesis: 'Daño por sol en la cara expuesta de la fruta', evidencia: 'Granny Smith es la variedad más sensible del huerto.', comoEvaluar: 'Revisar la fruta de la cara oeste 3 días después del evento.', confianza: 'media' }],
        recomendacionIds: ['m2-r1'],
      },
    ],
  },
  {
    id: 'cachapoal',
    nombre: 'Agrícola Cuatro Esteros',
    huerto: 'Huerto El Molino',
    region: "Valle del Cachapoal, O'Higgins",
    pais: 'Chile',
    especie: 'cerezo',
    mercado: 'Exportación a China',
    centro: [-34.3716, -70.8010],
    rotacion: 0,
    filaAlto: 170,
    fechaHoy: '2026-11-12',
    temporada: '2026–27',
    cuarteles: cerezos,
    alertas: [
      {
        id: 'a-c4-1', predioId: 'cachapoal', cuartelId: 'c4', severidad: 'alta', fecha: '2026-11-12',
        titulo: 'Riesgo de no cumplir calibre: solo {comercial} de la fruta llegaría a {exigencia} o más (meta {meta})',
        queOcurre: 'La carga es alta ({carga} frutos/árbol; óptimo {optimo}) y el cuartel está con déficit hídrico en la última expansión del fruto. La proyección de calibre cayó en las últimas semanas.',
        metodo: 'Calibre medido en 15 árboles de muestra · sensor de humedad · NDMI',
        factores: [
          { hipotesis: 'Déficit hídrico en la etapa final de crecimiento', evidencia: 'Humedad de suelo 19,6 % (esperado sobre 23 %) y NDMI 0,19.', comoEvaluar: 'Revisar el registro de riego de las últimas 3 semanas frente a la ETc.', confianza: 'alta' },
          { hipotesis: 'Carga alta por falta de raleo', evidencia: 'Frutos por dardo 30 % sobre el promedio histórico del cuartel.', comoEvaluar: 'Contar frutos por dardo en 10 ramillas por árbol en 5 árboles.', confianza: 'media' },
          { hipotesis: 'Estrés por temperaturas altas', evidencia: 'Máximas de 31,6 °C, sobre el rango esperado para la semana.', comoEvaluar: 'Comparar con un cuartel vecino de igual variedad y distinta exposición.', confianza: 'baja' },
        ],
        recomendacionIds: ['c4-r1', 'c4-r2'],
      },
      {
        id: 'a-c5-1', predioId: 'cachapoal', cuartelId: 'c5', severidad: 'media', fecha: '2026-11-10',
        titulo: 'Calibre comercial algo bajo la meta ({comercial} vs {meta})',
        queOcurre: 'El NDMI y el déficit hídrico muestran estrés leve. El calibre medio crece más lento que en los cuarteles vecinos.',
        metodo: 'NDMI satelital · balance hídrico',
        factores: [{ hipotesis: 'Tiempo de riego insuficiente para la demanda actual', evidencia: 'La ETc subió 18 % en 2 semanas y el riego aplicado no cambió.', comoEvaluar: 'Comparar el riego aplicado con la ETc semanal.', confianza: 'media' }],
        recomendacionIds: ['c5-r1'],
      },
      {
        id: 'a-c2-1', predioId: 'cachapoal', cuartelId: 'c2', severidad: 'baja', fecha: '2026-11-12',
        titulo: 'Lluvia pronosticada: riesgo de partidura',
        queOcurre: 'Se esperan 8–12 mm de lluvia el 14 de noviembre, con la fruta cerca de pinta.',
        metodo: 'Pronóstico meteorológico local',
        factores: [{ hipotesis: 'Partidura de fruta por lluvia', evidencia: 'Lapins es sensible y la fruta está en la etapa de mayor riesgo.', comoEvaluar: 'Muestrear 100 frutos 48 h después de la lluvia.', confianza: 'media' }],
        recomendacionIds: ['c2-r1'],
      },
    ],
  },
  {
    id: 'michoacan',
    nombre: 'Rancho La Loma Alta',
    huerto: 'Huerta San Lorenzo',
    region: 'Meseta Purépecha, Michoacán',
    pais: 'México',
    especie: 'palto',
    mercado: 'Exportación a Estados Unidos',
    centro: [19.383, -102.127],
    rotacion: 0,
    filaAlto: 230,
    fechaHoy: '2026-11-12',
    temporada: '2026–27',
    cuarteles: paltos,
    alertas: [
      {
        id: 'a-p3-1', predioId: 'michoacan', cuartelId: 'p3', severidad: 'alta', fecha: '2026-11-12',
        titulo: 'Fruta chica para el comprador: solo {comercial} llegaría a {exigencia} o más (meta {meta})',
        queOcurre: 'La carga ({carga} frutos/árbol) está sobre el óptimo ({optimo}) y el cuartel tiene déficit hídrico. La mayoría de la fruta quedaría bajo Cal. 60.',
        metodo: 'Pesaje de frutos en 12 árboles de muestra · sensor de humedad · NDMI',
        factores: [
          { hipotesis: 'Déficit hídrico en la parte alta del cuartel', evidencia: 'Humedad de suelo 26 % (esperado sobre 28 %) y déficit hídrico de 17,5 %.', comoEvaluar: 'Revisar microaspersores y la presión en la parte alta.', confianza: 'alta' },
          { hipotesis: 'Cuaja alta de la flor loca', evidencia: 'Hay 2 generaciones de fruta en el árbol según las fotografías de muestra.', comoEvaluar: 'Separar por generación el pesaje de 30 frutos.', confianza: 'media' },
        ],
        recomendacionIds: ['p3-r1', 'p3-r2'],
      },
      {
        id: 'a-p5-1', predioId: 'michoacan', cuartelId: 'p5', severidad: 'media', fecha: '2026-11-09',
        titulo: 'Calibre comercial bajo la meta en la ladera ({comercial} vs {meta})',
        queOcurre: 'La humedad del suelo baja rápido después de cada riego y el déficit hídrico supera el rango esperado.',
        metodo: 'Sensor de humedad de suelo',
        factores: [{ hipotesis: 'Suelo de ladera con baja retención de agua', evidencia: 'La humedad cae 6 puntos en 24 h tras el riego, frente a 3 puntos en el plano.', comoEvaluar: 'Instalar un segundo sensor a 40 cm de profundidad.', confianza: 'media' }],
        recomendacionIds: ['p5-r1'],
      },
      {
        id: 'a-p4-1', predioId: 'michoacan', cuartelId: 'p4', severidad: 'baja', fecha: '2026-11-12',
        titulo: 'Pronóstico de helada ligera',
        queOcurre: 'Se esperan mínimas cercanas a 1 °C la noche del 16 de noviembre en la parte baja del cuartel.',
        metodo: 'Pronóstico meteorológico local',
        factores: [{ hipotesis: 'Daño por frío en fruta y brotes', evidencia: 'El cuartel está en la parte baja, donde se acumula el aire frío.', comoEvaluar: 'Revisar daño en brotes 2 días después del evento.', confianza: 'media' }],
        recomendacionIds: ['p4-r1'],
      },
    ],
  },
]
