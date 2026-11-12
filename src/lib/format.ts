import type { CuartelCalc } from '../data/model'
import { parseFecha } from '../data/model'

export const fmt = (n: number, dec = 0) =>
  n.toLocaleString('es-CL', { minimumFractionDigits: dec, maximumFractionDigits: dec })

export const pct = (n: number, dec = 0) => `${fmt(n, dec)} %`

export const signo = (n: number, dec = 0) => `${n > 0 ? '+' : n < 0 ? '−' : '±'}${fmt(Math.abs(n), dec)}`

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic']
export const fechaCorta = (s: string) => {
  const d = parseFecha(s)
  return `${d.getDate()} ${MESES[d.getMonth()]}`
}
export const fechaLarga = (s: string) => {
  const d = parseFecha(s)
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

export const calibreTxt = (c: CuartelCalc, v: number) => `${fmt(v)} ${c.esp.unidadCalibre}`

/** Reemplaza los marcadores {x} de los textos de alertas por los valores del cuartel. */
export function interpolar(texto: string, c: CuartelCalc) {
  const vals: Record<string, string> = {
    comercial: pct(c.comercial),
    meta: pct(c.esp.metaComercial),
    exigencia: calibreTxt(c, c.esp.exigenciaComprador),
    carga: fmt(c.carga),
    optimo: `${fmt(c.equilibrio.rangoOptimo[0])}–${fmt(c.equilibrio.rangoOptimo[1])}`,
    rend: `${fmt(c.rend.p50, 1)} t/ha`,
    brecha: `${signo(c.brecha)} %`,
    promedio: `${signo(c.brechaPromedio)} %`,
  }
  return texto.replace(/\{(\w+)\}/g, (m, k) => vals[k] ?? m)
}

export const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ')
