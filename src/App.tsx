import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getPredio } from './data'
import { Sidebar, TopBar, type Vista } from './components/Shell'
import { Panel } from './pages/Panel'
import { Cuartel } from './pages/Cuartel'
import { AlertCenter } from './pages/AlertCenter'

// Navegación por hash: #/<predio>/<panel|cuartel|alertas>/<id?>
function leerHash(): { predioId: string; vista: Vista } {
  const [, pid, tipo, id] = window.location.hash.replace(/^#/, '').split('/')
  const predioId = getPredio(pid ?? '').id
  if (tipo === 'cuartel' && id) return { predioId, vista: { tipo: 'cuartel', id } }
  if (tipo === 'alertas') return { predioId, vista: { tipo: 'alertas', cuartel: id || undefined } }
  return { predioId, vista: { tipo: 'panel' } }
}
function escribirHash(predioId: string, v: Vista) {
  const h = `#/${predioId}/${v.tipo}${v.tipo === 'cuartel' ? '/' + v.id : v.tipo === 'alertas' && v.cuartel ? '/' + v.cuartel : ''}`
  if (window.location.hash !== h) window.location.hash = h
}

export default function App() {
  const [estado, setEstado] = useState(leerHash)
  const { predioId, vista } = estado
  const predio = getPredio(predioId)

  useEffect(() => {
    const h = () => setEstado(leerHash())
    window.addEventListener('hashchange', h)
    return () => window.removeEventListener('hashchange', h)
  }, [])
  const ir = (pid: string, v: Vista) => {
    setEstado({ predioId: pid, vista: v })
    escribirHash(pid, v)
  }
  const navegar = (v: Vista) => ir(predioId, v)
  const setPredioId = (pid: string) => ir(pid, { tipo: 'panel' })
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [vista, predioId])

  const clave = `${predioId}-${vista.tipo}-${vista.tipo === 'cuartel' ? vista.id : vista.tipo === 'alertas' ? (vista.cuartel ?? '') : ''}`

  return (
    <div className="flex min-h-screen">
      <Sidebar predio={predio} vista={vista} onNavegar={navegar} />
      <div className="min-w-0 flex-1">
        <TopBar
          predio={predio}
          vista={vista}
          onNavegar={navegar}
          onPredio={(id) => setPredioId(id)}
        />
        <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={clave}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {vista.tipo === 'panel' && <Panel predio={predio} onNavegar={navegar} />}
              {vista.tipo === 'cuartel' && <Cuartel predio={predio} id={vista.id} onNavegar={navegar} />}
              {vista.tipo === 'alertas' && (
                <AlertCenter
                  predio={predio}
                  cuartelInicial={vista.cuartel}
                  onVerCuartel={(pid, cid) => ir(pid, { tipo: 'cuartel', id: cid })}
                />
              )}
            </motion.div>
          </AnimatePresence>
          <footer className="mt-10 border-t border-leaf-100 pt-4 pb-2 text-[11px] text-leaf-700/70">
            Rencal · Prototipo para pruebas con usuarios. Todos los datos, categorías de calibre, umbrales de mercado y precios son simulados y de ejemplo. Imágenes satelitales © Esri.
          </footer>
        </main>
      </div>
    </div>
  )
}
