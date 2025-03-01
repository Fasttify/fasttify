import * as React from 'react'
import { SquareTerminal, ShoppingCart, Box, Settings2, LayoutGrid } from 'lucide-react'
import { NavMain } from '@/app/store/components/sidebar/nav-main'
import { NavUser } from '@/app/store/components/sidebar/nav-user'
import { Sidebar, SidebarContent, SidebarFooter, SidebarRail } from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/auth/useAuth'
import { useParams } from 'next/navigation'
import { useStore } from '@/app/store/hooks/useStore'
import { routes } from '@/utils/routes'
import useUserStore from '@/zustand-states/userStore'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUserStore()
  const { loading } = useAuth()
  const params = useParams()
  const storeId = params.slug as string
  const { store } = useStore(storeId)

  const data = {
    navMain: [
      {
        title: 'Dashboard',
        url: routes.store.dashboard(storeId),
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: 'Resumen',
            url: `${routes.store.dashboard(storeId)}/summary`,
          },
          {
            title: 'Estadísticas',
            url: `${routes.store.dashboard(storeId)}/statistics`,
          },
          {
            title: 'Notificaciones',
            url: `${routes.store.dashboard(storeId)}/notifications`,
          },
        ],
      },
      {
        title: 'Productos',
        url: routes.store.products.main(storeId), // Add the main URL
        icon: ShoppingCart,
        items: [
          {
            title: 'Listado',
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
            title: 'Historial',
            url: `${routes.store.orders(storeId)}/history`,
          },
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
            title: 'Guía de Configuración',
            url: routes.store.setup.main(storeId),
          },
          {
            title: 'Productos',
            url: routes.store.setup.products(storeId),
          },
          {
            title: 'Diseño',
            url: routes.store.setup.design(storeId),
          },
          {
            title: 'Dominio',
            url: routes.store.setup.domain(storeId),
          },
          {
            title: 'Envíos',
            url: routes.store.setup.shipping(storeId),
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
        <NavMain items={data.navMain} storeName={store?.storeName} isLoading={loading} />
      </SidebarContent>
      <SidebarFooter className="bg-[#ebebeb] text-gray-800">
        <NavUser user={user} loading={loading} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
