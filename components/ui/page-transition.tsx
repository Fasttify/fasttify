'use client'

import { type ReactNode, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface PageTransitionProps {
  children: ReactNode
  enabled?: boolean // Permite desactivar la animación completamente
  duration?: number // Duración en ms
}

export function PageTransition({ children, enabled = true, duration = 300 }: PageTransitionProps) {
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled || !containerRef.current) return

    // Usar directamente la API de animación del navegador es más eficiente
    // que cambiar clases o estados de React
    const container = containerRef.current

    // Detener cualquier animación en curso
    container.getAnimations().forEach(animation => animation.cancel())

    // Crear y ejecutar una nueva animación
    container.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration,
      easing: 'ease-out',
      fill: 'forwards',
    })

    // No necesitamos limpiar nada ya que las animaciones se detienen
    // automáticamente cuando el componente se desmonta
  }, [pathname, enabled, duration])

  // Si la animación está desactivada, simplemente renderizamos los hijos
  if (!enabled) return <>{children}</>

  return <div ref={containerRef}>{children}</div>
}
