'use client'

import { Navigation } from '@shopify/polaris'
import {
  HomeIcon,
  ProductIcon,
  OrderIcon,
  StoreIcon,
  SettingsIcon,
  PersonIcon,
} from '@shopify/polaris-icons'
import { usePathname } from 'next/navigation'

interface NavigationPolarisProps {
  storeId: string
}

export function NavigationPolaris({ storeId }: NavigationPolarisProps) {
  const pathname = usePathname()

  return (
    <Navigation location={pathname}>
      <Navigation.Section
        items={[
          {
            url: `/store/${storeId}/dashboard`,
            label: 'Dashboard',
            icon: HomeIcon,
            selected: pathname === `/store/${storeId}/dashboard` || pathname.includes('/dashboard'),
            subNavigationItems: [
              {
                url: `/store/${storeId}/dashboard/statistics`,
                label: 'Estadísticas',
                disabled: false,
              },
              {
                url: `/store/${storeId}/dashboard/notifications`,
                label: 'Notificaciones',
                disabled: false,
              },
            ],
          },
          {
            url: `/store/${storeId}/products`,
            label: 'Productos',
            icon: ProductIcon,
            selected: pathname.includes('/products'),
            subNavigationItems: [
              {
                url: `/store/${storeId}/products/collections`,
                label: 'Colecciones',
                disabled: false,
              },
              {
                url: `/store/${storeId}/products/inventory`,
                label: 'Inventario',
                disabled: false,
              },
              {
                url: `/store/${storeId}/categories`,
                label: 'Categorías',
                disabled: false,
              },
            ],
          },
          {
            url: `/store/${storeId}/orders`,
            label: 'Pedidos',
            icon: OrderIcon,
            selected: pathname.includes('/orders'),
            badge: '3', // Ejemplo: número de pedidos pendientes
            subNavigationItems: [
              {
                url: `/store/${storeId}/orders/processing`,
                label: 'En Proceso',
                disabled: false,
              },
              {
                url: `/store/${storeId}/orders/shipping`,
                label: 'Envíos',
                disabled: false,
              },
            ],
          },
          {
            url: `/store/${storeId}/customers`,
            label: 'Clientes',
            icon: PersonIcon,
            selected: pathname.includes('/customers'),
          },
        ]}
      />

      <Navigation.Section
        title="CONFIGURACIÓN"
        items={[
          {
            url: `/store/${storeId}/setup`,
            label: 'Configuración de Tienda',
            icon: StoreIcon,
            selected: pathname.includes('/setup'),
            subNavigationItems: [
              {
                url: `/store/${storeId}/setup/domain`,
                label: 'Dominio y Nombre',
                disabled: false,
              },
              {
                url: `/store/${storeId}/setup/payments`,
                label: 'Pagos',
                disabled: false,
              },
              {
                url: `/store/${storeId}/setup/apps`,
                label: 'Apps',
                disabled: false,
              },
            ],
          },
          {
            url: `/store/${storeId}/settings`,
            label: 'Configuración',
            icon: SettingsIcon,
            selected: pathname.includes('/settings'),
            subNavigationItems: [
              {
                url: `/store/${storeId}/settings/general`,
                label: 'General',
                disabled: false,
              },
              {
                url: `/store/${storeId}/settings/team`,
                label: 'Equipo',
                disabled: false,
              },
              {
                url: `/store/${storeId}/settings/payments`,
                label: 'Pagos',
                disabled: false,
              },
              {
                url: `/store/${storeId}/settings/security`,
                label: 'Seguridad',
                disabled: false,
              },
            ],
          },
        ]}
        separator
      />
    </Navigation>
  )
}
