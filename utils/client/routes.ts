/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export const routes = {
  store: {
    dashboard: {
      main: (storeId: string) => `/store/${storeId}/home`,
      analytics: (storeId: string) => `/store/${storeId}/home/analytics`,
      notification: (storeId: string) => `/store/${storeId}/home/notification`,
    },
    settings: (storeId: string) => `/store/${storeId}/settings`,
    products: {
      main: (storeId: string) => `/store/${storeId}/products`,
      list: (storeId: string) => `/store/${storeId}/products/inventory  `,
      add: (storeId: string) => `/store/${storeId}/products/new`,
      edit: (storeId: string, productId: string) => `/store/${storeId}/products/${productId}`,
      inventory: (storeId: string) => `/store/${storeId}/products/inventory`,
      collectionsNew: (storeId: string) => `/store/${storeId}/products/collections/new`,
      collections: (storeId: string) => `/store/${storeId}/products/collections`,
      collectionsEdit: (storeId: string, collectionId: string) =>
        `/store/${storeId}/products/collections/${collectionId}`,
    },
    orders: {
      main: (storeId: string) => `/store/${storeId}/orders`,
      checkouts: (storeId: string) => `/store/${storeId}/orders/checkouts`,
    },
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
      pagesEdit: (storeId: string, pageId: string) => `/store/${storeId}/setup/pages/${pageId}`,
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

    accessAccount: {
      checkout: (storeId: string) => `/store/${storeId}/access_account/checkout?no_redirect=true`,
    },
    content: {
      files: (storeId: string) => `/store/${storeId}/content/files`,
    },
  },

  auth: {
    login: '/login',
  },
} as const;

// Función para obtener rutas con seguridad de tipos
export function getRoute<T extends keyof typeof routes>(
  section: T,
  subsection: keyof (typeof routes)[T],
  ...params: any[]
): string {
  const route = routes[section][subsection];
  if (typeof route === 'function') {
    return route(...params);
  }
  return route as string;
}
