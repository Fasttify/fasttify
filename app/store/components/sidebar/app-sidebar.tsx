import * as React from 'react'
import { SquareTerminal, ShoppingCart, Box, Settings2 } from 'lucide-react'
import { NavMain } from '@/app/store/components/sidebar/nav-main'
import { NavUser } from '@/app/store/components/sidebar/nav-user'
import { Sidebar, SidebarContent, SidebarFooter, SidebarRail } from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/auth/useAuth'
import { signOut } from 'aws-amplify/auth'
import { useRouter } from 'next/navigation'
import useUserStore from '@/zustand-states/userStore'

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/store/dashboard',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'Resumen',
          url: '/store/dashboard/resumen',
        },
        {
          title: 'Estadísticas',
          url: '/store/dashboard/estadisticas',
        },
        {
          title: 'Notificaciones',
          url: '/store/dashboard/notificaciones',
        },
      ],
    },
    {
      title: 'Productos',
      url: '/store/productos',
      icon: ShoppingCart,
      items: [
        {
          title: 'Listado',
          url: '/store/productos/listado',
        },
        {
          title: 'Agregar Producto',
          url: '/store/productos/agregar',
        },
        {
          title: 'Categorías',
          url: '/store/productos/categorias',
        },
      ],
    },
    {
      title: 'Pedidos',
      url: '/store/pedidos',
      icon: Box,
      items: [
        {
          title: 'Historial',
          url: '/store/pedidos/historial',
        },
        {
          title: 'En Proceso',
          url: '/store/pedidos/proceso',
        },
        {
          title: 'Envíos',
          url: '/store/pedidos/envios',
        },
      ],
    },
    {
      title: 'Configuración',
      url: '/store/configuracion',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '/store/configuracion/general',
        },
        {
          title: 'Equipo',
          url: '/store/configuracion/equipo',
        },
        {
          title: 'Pagos',
          url: '/store/configuracion/pagos',
        },
        {
          title: 'Seguridad',
          url: '/store/configuracion/seguridad',
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, clearUser } = useUserStore()
  const { loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      clearUser()
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} loading={loading} onSignOut={handleSignOut} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
