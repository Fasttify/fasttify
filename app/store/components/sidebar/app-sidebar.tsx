import * as React from 'react'
import { SquareTerminal, ShoppingCart, Box, Settings2, LayoutGrid } from 'lucide-react'
import { useState, useEffect } from 'react'
import { NavMain } from '@/app/store/components/sidebar/nav-main'
import { NavUser } from '@/app/store/components/sidebar/nav-user'
import { Sidebar, SidebarContent, SidebarFooter, SidebarRail } from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/auth/useAuth'
import { routes } from '@/utils/routes'
import { getStoreId } from '@/utils/store-utils'
import { useParams, usePathname } from 'next/navigation'
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
        icon: SquareTerminal,
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
        icon: ShoppingCart,
        items: [
          {
            title: 'Inventario',
            url: routes.store.products.list(storeId),
          },
          {
            title: 'Categorías',
            url: routes.store.products.categories(storeId),
          },
        ],
      },
      {
        title: 'Pedidos',
        url: routes.store.orders(storeId),
        icon: Box,
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
        icon: LayoutGrid,
        items: [
          {
            title: 'Dominio y Nombre',
            url: routes.store.setup.domain(storeId),
          },
          {
            title: 'Pagos',
            url: routes.store.setup.payments(storeId),
          },
        ],
      },
      {
        title: 'Configuración',
        url: routes.store.settings(storeId),
        icon: Settings2,
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
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent className="bg-[#ebebeb] font-medium text-gray-800">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="bg-[#ebebeb] text-gray-800">
        <NavUser user={user} loading={loading} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
