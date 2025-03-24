export const routes = {
  store: {
    dashboard: {
      main: (storeId: string) => `/store/${storeId}/dashboard`,
      statistics: (storeId: string) => `/store/${storeId}/dashboard/statistics`,
      notification: (storeId: string) => `/store/${storeId}/dashboard/notification`,
    },
    settings: (storeId: string) => `/store/${storeId}/settings`,
    products: {
      main: (storeId: string) => `/store/${storeId}/products`,
      list: (storeId: string) => `/store/${storeId}/products/inventory  `,
      add: (storeId: string) => `/store/${storeId}/products/new`,
      edit: (storeId: string, productId: string) => `/store/${storeId}/products/${productId}`,
      categories: (storeId: string) => `/store/${storeId}/products/categories`,
    },
    orders: (storeId: string) => `/store/${storeId}/orders`,
    customers: (storeId: string) => `/store/${storeId}/customers`,
    masterShop: (storeId: string) => `/store/${storeId}/mastershop`,

    setup: {
      main: (storeId: string) => `/store/${storeId}/setup`,
      explore: (storeId: string) => `/store/${storeId}/products/connect-products`,
      design: (storeId: string) => `/store/${storeId}/setup/design`,
      domain: (storeId: string) => `/store/${storeId}/setup/domain`,
      apps: (storeId: string) => `/store/${storeId}/setup/apps`,
      shipping: (storeId: string) => `/store/${storeId}/setup/shipping`,
      payments: (storeId: string) => `/store/${storeId}/setup/payments`,
      testOrder: (storeId: string) => `/store/${storeId}/setup/test-order`,
    },
  },
  account: {
    settings: '/account-settings',
    profile: '/account-settings?section=cuenta',
    payments: '/account-settings?section=pagos',
    sessions: '/account-settings?section=sesiones',
  },
  auth: {
    login: '/login',
  },
} as const

// Función para obtener rutas con seguridad de tipos
export function getRoute<T extends keyof typeof routes>(
  section: T,
  subsection: keyof (typeof routes)[T],
  ...params: any[]
): string {
  const route = routes[section][subsection]
  if (typeof route === 'function') {
    return route(...params)
  }
  return route as string
}
