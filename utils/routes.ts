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
      edit: (storeId: string, productId: string) =>
        `/store/${storeId}/products/${productId}`,
      inventory: (storeId: string) => `/store/${storeId}/products/inventory`,
      collectionsNew: (storeId: string) => `/store/${storeId}/products/collections/new`,
      collections: (storeId: string) => `/store/${storeId}/products/collections`,
      collectionsEdit: (storeId: string, collectionId: string) =>
        `/store/${storeId}/products/collections/${collectionId}`,
    },
    orders: (storeId: string) => `/store/${storeId}/orders`,
    customers: (storeId: string) => `/store/${storeId}/customers`,
    masterShop: (storeId: string) => `/store/${storeId}/mastershop`,
    collections: (storeId: string) => `/store/${storeId}/collections`,
    categories: (storeId: string) => `/store/${storeId}/categories`,

    setup: {
      main: (storeId: string) => `/store/${storeId}/setup`,
      explore: (storeId: string) => `/store/${storeId}/products/connect-products`,
      design: (storeId: string) => `/store/${storeId}/setup/design`,
      pages: (storeId: string) => `/store/${storeId}/setup/pages`,
      pagesNew: (storeId: string) => `/store/${storeId}/setup/pages/new`,
      pagesEdit: (storeId: string, pageId: string) =>
        `/store/${storeId}/setup/pages/${pageId}`,
      domain: (storeId: string) => `/store/${storeId}/setup/general`,
      apps: (storeId: string) => `/store/${storeId}/setup/apps`,
      navigation: (storeId: string) => `/store/${storeId}/setup/navigation`,
      shipping: (storeId: string) => `/store/${storeId}/setup/shipping`,
      payments: (storeId: string) => `/store/${storeId}/setup/payments`,
      testOrder: (storeId: string) => `/store/${storeId}/setup/test-order`,
    },

    themes: {
      main: (storeId: string) => `/store/${storeId}/themes`,
      edit: (storeId: string, themeId: string) => `/store/${storeId}/themes/${themeId}`,
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
