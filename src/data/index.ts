import { baseApoyo, especies } from './especies'
import { agregar, calcularCuartel, type Agregado, type CuartelCalc } from './model'
import { predios } from './predios'
import type { Alerta, Especie, Predio, Severidad } from './types'

export interface PredioCalc extends Predio {
  esp: Especie
  cuartelesCalc: CuartelCalc[]
  agregado: Agregado
}

export const prediosCalc: PredioCalc[] = predios.map((p) => {
  const esp = especies[p.especie]
  const cuartelesCalc = p.cuarteles.map((s) => calcularCuartel(p, esp, s, baseApoyo[p.especie]))
  return { ...p, esp, cuartelesCalc, agregado: agregar(cuartelesCalc) }
})

export const ordenSeveridad: Record<Severidad, number> = { alta: 0, media: 1, baja: 2 }

export function alertasOrdenadas(alertas: Alerta[]) {
  return [...alertas].sort((a, b) => ordenSeveridad[a.severidad] - ordenSeveridad[b.severidad] || b.fecha.localeCompare(a.fecha))
}

export const getPredio = (id: string) => prediosCalc.find((p) => p.id === id) ?? prediosCalc[0]
