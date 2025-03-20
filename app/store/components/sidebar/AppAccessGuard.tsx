'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useStoreDataStore from '@/zustand-states/storeDataStore'
import { routes } from '@/utils/routes'
import { toast } from 'sonner'

interface AppAccessGuardProps {
  children: React.ReactNode
  appName: 'mastershop' | 'otherapp' // Añadir más apps según sea necesario
  storeId: string
}

export function AppAccessGuard({ children, appName, storeId }: AppAccessGuardProps) {
  const router = useRouter()
  const { hasMasterShopApiKey } = useStoreDataStore()

  useEffect(() => {
    // Verificar acceso según la app
    let hasAccess = false

    switch (appName) {
      case 'mastershop':
        hasAccess = hasMasterShopApiKey
        break
      // Añadir más casos para otras apps
      default:
        hasAccess = false
    }

    // Si no tiene acceso, redirigir y mostrar mensaje
    if (!hasAccess) {
      toast.error('No tienes acceso a esta aplicación. Configúrala primero en la sección Apps.')
      router.push(routes.store.setup.apps(storeId))
    }
  }, [appName, hasMasterShopApiKey, router, storeId])

  // Si tiene acceso, mostrar el contenido
  return <>{children}</>
}
