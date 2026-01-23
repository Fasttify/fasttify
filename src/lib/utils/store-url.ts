/**
 * Utilidades para generar URLs de la tienda del usuario
 */

export interface StoreUrlOptions {
  /** ID de la tienda */
  storeId: string;
  /** Dominio personalizado de la tienda (opcional) */
  customDomain?: string;
  /** Protocolo a usar (por defecto 'https') */
  protocol?: 'http' | 'https';
}

export interface ProductUrlOptions extends StoreUrlOptions {
  /** Slug del producto */
  productSlug: string;
}

export interface CollectionUrlOptions extends StoreUrlOptions {
  /** Slug de la colección */
  collectionSlug: string;
}

export interface PageUrlOptions extends StoreUrlOptions {
  /** Slug de la página */
  pageSlug: string;
}

/**
 * Genera la URL base de la tienda
 */
export function getStoreUrl(options: StoreUrlOptions): string {
  const { storeId, customDomain, protocol = 'https' } = options;

  if (customDomain) {
    return `${protocol}://${customDomain}`;
  }

  // Fallback al dominio por defecto de la plataforma
  return `${protocol}://${storeId}.fasttify.com`;
}

/**
 * Genera la URL de un producto específico
 */
export function getProductUrl(options: ProductUrlOptions): string {
  const baseUrl = getStoreUrl(options);
  return `${baseUrl}/products/${options.productSlug}`;
}

/**
 * Genera la URL de una colección específica
 */
export function getCollectionUrl(options: CollectionUrlOptions): string {
  const baseUrl = getStoreUrl(options);
  return `${baseUrl}/collections/${options.collectionSlug}`;
}

/**
 * Genera la URL de una página específica
 */
export function getPageUrl(options: PageUrlOptions): string {
  const baseUrl = getStoreUrl(options);
  return `${baseUrl}/pages/${options.pageSlug}`;
}

/**
 * Genera la URL de la página de inicio de la tienda
 */
export function getHomeUrl(options: StoreUrlOptions): string {
  return getStoreUrl(options);
}

/**
 * Genera la URL de la página de carrito
 */
export function getCartUrl(options: StoreUrlOptions): string {
  const baseUrl = getStoreUrl(options);
  return `${baseUrl}/cart`;
}

/**
 * Genera la URL de la página de checkout
 */
export function getCheckoutUrl(options: StoreUrlOptions): string {
  const baseUrl = getStoreUrl(options);
  return `${baseUrl}/checkout`;
}

/**
 * Genera la URL de búsqueda de la tienda
 */
export function getSearchUrl(options: StoreUrlOptions & { query?: string }): string {
  const baseUrl = getStoreUrl(options);
  const searchQuery = options.query ? `?q=${encodeURIComponent(options.query)}` : '';
  return `${baseUrl}/search${searchQuery}`;
}

/**
 * Abre la URL en una nueva pestaña
 */
export function openStoreUrl(options: StoreUrlOptions): void {
  const url = getStoreUrl(options);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Abre un producto específico en una nueva pestaña
 */
export function openProductUrl(options: ProductUrlOptions): void {
  const url = getProductUrl(options);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Abre una colección específica en una nueva pestaña
 */
export function openCollectionUrl(options: CollectionUrlOptions): void {
  const url = getCollectionUrl(options);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Abre una página específica en una nueva pestaña
 */
export function openPageUrl(options: PageUrlOptions): void {
  const url = getPageUrl(options);
  window.open(url, '_blank', 'noopener,noreferrer');
}
