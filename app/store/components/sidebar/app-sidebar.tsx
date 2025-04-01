import type * as React from 'react'
import {
  LayoutDashboard,
  ShoppingBag,
  PackageCheck,
  Store,
  Settings,
  PuzzleIcon as PuzzlePiece,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { NavMain } from '@/app/store/components/sidebar/nav-main'
import { NavUser } from '@/app/store/components/sidebar/nav-user'
import { Sidebar, SidebarContent, SidebarFooter, SidebarRail } from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/auth/useAuth'
import { routes } from '@/utils/routes'
import { getStoreId } from '@/utils/store-utils'
import { useParams, usePathname } from 'next/navigation'
import { NavApps } from '@/app/store/components/sidebar/nav-apps'
import useUserStore from '@/zustand-states/userStore'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useUserStore()
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()
  const params = useParams()
  const storeId = getStoreId(params, pathname)

  useAuth()

  useEffect(() => {
    setIsClient(true)
  }, [])
  const data = {
    navMain: [
      {
        title: 'Dashboard',
        url: routes.store.dashboard.main(storeId),
        icon: LayoutDashboard,
        isActive: true,
        items: [
          {
            title: 'Estadísticas',
            url: `${routes.store.dashboard.statistics(storeId)}`,
          },
          {
            title: 'Notificaciones',
            url: `${routes.store.dashboard.notification(storeId)}`,
          },
        ],
      },
      {
        title: 'Productos',
        url: routes.store.products.main(storeId),
        icon: ShoppingBag,
        items: [
          {
            title: 'Colecciones',
            url: routes.store.collections(storeId),
          },
          {
            title: 'Inventario',
            url: routes.store.inventory(storeId),
          },
          {
            title: 'Categorías',
            url: routes.store.categories(storeId),
          },
        ],
      },
      {
        title: 'Pedidos',
        url: routes.store.orders(storeId),
        icon: PackageCheck,
        items: [
          {
            title: 'En Proceso',
            url: `${routes.store.orders(storeId)}/processing`,
          },
          {
            title: 'Envíos',
            url: `${routes.store.orders(storeId)}/shipping`,
          },
        ],
      },

      {
        title: 'Configuración de Tienda',
        url: routes.store.setup.main(storeId),
        icon: Store,
        items: [
          {
            title: 'Dominio y Nombre',
            url: routes.store.setup.domain(storeId),
          },
          {
            title: 'Pagos',
            url: routes.store.setup.payments(storeId),
          },
          // Add Apps section to main navigation
          {
            title: 'Apps',
            url: routes.store.setup.apps(storeId),
            icon: PuzzlePiece,
            items: [], // No subitems
          },
        ],
      },
      {
        title: 'Configuración',
        url: routes.store.settings(storeId),
        icon: Settings,
        items: [
          {
            title: 'General',
            url: `${routes.store.settings(storeId)}/general`,
          },
          {
            title: 'Equipo',
            url: `${routes.store.settings(storeId)}/team`,
          },
          {
            title: 'Pagos',
            url: `${routes.store.settings(storeId)}/payments`,
          },
          {
            title: 'Seguridad',
            url: `${routes.store.settings(storeId)}/security`,
          },
        ],
      },
    ],
  }

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarContent className="bg-[#ebebeb] rounded-xl font-medium text-gray-800">
        <NavMain items={data.navMain} />
        <NavApps />
        <SidebarFooter className="bg-[#ebebeb] text-gray-800 mt-auto">
          <NavUser user={user} loading={loading} />
        </SidebarFooter>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
