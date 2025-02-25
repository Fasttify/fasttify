export const routes = {
  store: {
    dashboard: (storeId: string) => `/store/${storeId}/dashboard`,
    settings: (storeId: string) => `/store/${storeId}/settings`,
    products: (storeId: string) => `/store/${storeId}/products`,
    orders: (storeId: string) => `/store/${storeId}/orders`,
    customers: (storeId: string) => `/store/${storeId}/customers`,
  },
  account: {
    settings: '/account-settings',
    billing: '/account-settings/billing',
  },
  auth: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
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
