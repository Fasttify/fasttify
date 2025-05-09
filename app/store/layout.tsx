'use client'

import { AppSidebar } from '@/app/store/components/sidebar/app-sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { useEffect, useState } from 'react'
import { SearchNavigation } from '@/app/store/components/search-bar/SearchNavigation'
import { NotificationPopover } from '@/app/store/components/notifications/NotificationPopover'
import { PageTransition } from '@/components/ui/page-transition'
import { getStoreId } from '@/utils/store-utils'
import { useParams, usePathname } from 'next/navigation'
import { useStore } from '@/app/store/hooks/useStore'
import { ChatTrigger } from '@/app/store/components/ai-chat/ChatTrigger'
import { Amplify } from 'aws-amplify'
import outputs from '@/amplify_outputs.json'

Amplify.configure(outputs)
const existingConfig = Amplify.getConfig()
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
})

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const params = useParams()

  const storeId = getStoreId(params, pathname)
  useStore(storeId)

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    document.title = 'Mi tienda • Fasttify'

    // Comprobar si el usuario prefiere reducir el movimiento
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Efecto para ajustar el viewport en dispositivos móviles
  useEffect(() => {
    // Función para ajustar la escala de visualización
    const adjustViewport = () => {
      // Verificar si es un dispositivo móvil (ancho menor a 768px)
      if (window.innerWidth < 768) {
        // Crear o actualizar la meta tag de viewport
        let viewportMeta = document.querySelector('meta[name="viewport"]')
        if (!viewportMeta) {
          viewportMeta = document.createElement('meta')
          viewportMeta.setAttribute('name', 'viewport')
          document.head.appendChild(viewportMeta)
        }

        // Establecer una escala inicial más pequeña para las vistas de store
        viewportMeta.setAttribute(
          'content',
          'width=device-width, initial-scale=0.95, maximum-scale=3, user-scalable=yes'
        )
      }
    }

    // Aplicar el ajuste al cargar la página
    adjustViewport()

    // Aplicar el ajuste al cambiar el tamaño de la ventana
    window.addEventListener('resize', adjustViewport)

    // Limpiar el event listener cuando el componente se desmonte
    return () => {
      window.removeEventListener('resize', adjustViewport)

      // Restaurar el viewport original al salir de las rutas /store
      const viewportMeta = document.querySelector('meta[name="viewport"]')
      if (viewportMeta) {
        viewportMeta.setAttribute(
          'content',
          'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes'
        )
      }
    }
  }, [])

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '19rem',
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between px-4 text-[#f3f4f6] transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-[#2a2a2a]" />
            <Separator orientation="vertical" className="h-4" />
          </div>

          <div className="relative max-w-md w-full">
            <SearchNavigation />
          </div>

          <div className="flex items-center gap-3">
            <ChatTrigger />
            <NotificationPopover />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-[#f3f4f6] overflow-auto">
          <PageTransition enabled={!prefersReducedMotion}>{children}</PageTransition>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
