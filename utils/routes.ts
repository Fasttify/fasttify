export const routes = {
  store: {
    dashboard: (storeId: string) => `/store/${storeId}/dashboard`,
    settings: (storeId: string) => `/store/${storeId}/settings`,
    products: (storeId: string) => `/store/${storeId}/products`,
    orders: (storeId: string) => `/store/${storeId}/orders`,
    customers: (storeId: string) => `/store/${storeId}/customers`,

    setup: {
      main: (storeId: string) => `/store/${storeId}/setup`,
      products: (storeId: string) => `/store/${storeId}/setup/products`,
      design: (storeId: string) => `/store/${storeId}/setup/design`,
      domain: (storeId: string) => `/store/${storeId}/setup/domain`,
      shipping: (storeId: string) => `/store/${storeId}/setup/shipping`,
      payments: (storeId: string) => `/store/${storeId}/setup/payments`,
      testOrder: (storeId: string) => `/store/${storeId}/setup/test-order`,
    },
  },
  account: {
    settings: '/account-settings',
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
