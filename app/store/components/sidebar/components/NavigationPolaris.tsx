'use client';

import { openStoreUrl } from '@/lib/utils/store-url';
import { Navigation } from '@shopify/polaris';
import useStoreDataStore from '@/context/core/storeDataStore';
import {
  HomeIcon,
  OrderIcon,
  PersonIcon,
  ProductIcon,
  SettingsIcon,
  StoreIcon,
  ViewIcon,
  ContentIcon,
} from '@shopify/polaris-icons';
import { usePathname } from 'next/navigation';

interface NavigationPolarisProps {
  storeId: string;
}

export function NavigationPolaris({ storeId }: NavigationPolarisProps) {
  const pathname = usePathname();
  const { currentStore } = useStoreDataStore();

  const handleViewStore = () => {
    openStoreUrl({ customDomain: currentStore?.defaultDomain ?? '', storeId: currentStore?.storeId ?? '' });
  };

  return (
    <Navigation location={pathname}>
      <Navigation.Section
        items={[
          {
            url: `/store/${storeId}/home`,
            label: 'Inicio',
            icon: HomeIcon,
            selected: pathname === `/store/${storeId}/home` || pathname.includes('/home'),
            subNavigationItems: [
              {
                url: `/store/${storeId}/home/analytics`,
                label: 'Analíticas',
                disabled: false,
              },
              {
                url: `/store/${storeId}/home/notifications`,
                label: 'Notificaciones',
                disabled: true,
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
                disabled: true,
              },
            ],
          },
          {
            url: `/store/${storeId}/orders`,
            label: 'Pedidos',
            icon: OrderIcon,
            selected: pathname.includes('/orders'),
            subNavigationItems: [
              {
                url: `/store/${storeId}/orders/checkouts`,
                label: 'Checkouts',
                disabled: false,
              },
            ],
          },
          {
            url: `/store/${storeId}/content/files`,
            label: 'Contenido',
            icon: ContentIcon,
            selected: pathname.includes('/content/files'),
            disabled: false,
            subNavigationItems: [
              {
                url: `/store/${storeId}/content/menus`,
                label: 'Menús',
                disabled: false,
              },
            ],
          },

          {
            url: `/store/${storeId}/customers`,
            label: 'Clientes',
            icon: PersonIcon,
            selected: pathname.includes('/customers'),
            disabled: true,
          },
        ]}
      />

      <Navigation.Section
        title="CONFIGURACIÓN"
        items={[
          {
            url: `/store/${storeId}/setup`,
            label: 'Tienda Online',
            displayActionsOnHover: true,
            secondaryActions: [
              {
                accessibilityLabel: 'Ver tienda online',
                icon: ViewIcon,
                tooltip: {
                  content: 'Ver tienda online',
                },
                onClick: handleViewStore,
              },
            ],
            icon: StoreIcon,
            selected: pathname.includes('/setup'),
            subNavigationItems: [
              {
                url: `/store/${storeId}/setup/general`,
                label: 'General',
                disabled: false,
              },
              {
                url: `/store/${storeId}/setup/pages`,
                label: 'Páginas',
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
                disabled: true,
              },
            ],
          },
          {
            url: `/store/${storeId}/settings`,
            label: 'Configuración',
            disabled: true,
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
  );
}
