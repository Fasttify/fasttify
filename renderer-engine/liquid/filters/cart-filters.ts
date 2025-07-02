import type { LiquidFilter } from '@/renderer-engine/types';

/**
 * Filtro cart_url - Genera URL del carrito
 */
export const cartUrlFilter: LiquidFilter = {
  name: 'cart_url',
  filter: (): string => {
    return '/cart';
  },
};

/**
 * Filtro cart_add_url - Genera URL para agregar al carrito
 */
export const cartAddUrlFilter: LiquidFilter = {
  name: 'cart_add_url',
  filter: (): string => {
    return '/cart/add';
  },
};

/**
 * Filtro cart_update_url - Genera URL para actualizar carrito
 */
export const cartUpdateUrlFilter: LiquidFilter = {
  name: 'cart_update_url',
  filter: (): string => {
    return '/cart/update';
  },
};

/**
 * Filtro cart_clear_url - Genera URL para limpiar carrito
 */
export const cartClearUrlFilter: LiquidFilter = {
  name: 'cart_clear_url',
  filter: (): string => {
    return '/cart/clear';
  },
};

/**
 * Filtro item_count_for_variant - Cuenta items de una variante específica en el carrito
 */
export const itemCountForVariantFilter: LiquidFilter = {
  name: 'item_count_for_variant',
  filter: (cart: any, variantId: string): number => {
    if (!cart || !cart.items || !Array.isArray(cart.items)) {
      return 0;
    }

    return cart.items
      .filter((item: any) => item.variant_id === variantId || item.variantId === variantId)
      .reduce((count: number, item: any) => count + (item.quantity || 0), 0);
  },
};

/**
 * Filtro line_items_for - Obtiene los items del carrito para un producto específico
 */
export const lineItemsForFilter: LiquidFilter = {
  name: 'line_items_for',
  filter: (cart: any, productId: string): any[] => {
    if (!cart || !cart.items || !Array.isArray(cart.items)) {
      return [];
    }

    return cart.items.filter((item: any) => item.product_id === productId || item.productId === productId);
  },
};

/**
 * Filtro cart_item_key - Genera clave única para un item del carrito
 */
export const cartItemKeyFilter: LiquidFilter = {
  name: 'cart_item_key',
  filter: (productId: string, variantId?: string): string => {
    return variantId ? `${productId}:${variantId}` : productId;
  },
};

/**
 * Filtro remove_from_cart_url - Genera URL para remover un item del carrito
 */
export const removeFromCartUrlFilter: LiquidFilter = {
  name: 'remove_from_cart_url',
  filter: (itemKey: string): string => {
    return `/cart/change?line=${itemKey}&quantity=0`;
  },
};

/**
 * Filtro cart_change_url - Genera URL para cambiar cantidad de un item
 */
export const cartChangeUrlFilter: LiquidFilter = {
  name: 'cart_change_url',
  filter: (itemKey: string, quantity?: number): string => {
    const qty = quantity !== undefined ? quantity : 1;
    return `/cart/change?line=${itemKey}&quantity=${qty}`;
  },
};

export const cartFilters: LiquidFilter[] = [
  cartUrlFilter,
  cartAddUrlFilter,
  cartUpdateUrlFilter,
  cartClearUrlFilter,
  itemCountForVariantFilter,
  lineItemsForFilter,
  cartItemKeyFilter,
  removeFromCartUrlFilter,
  cartChangeUrlFilter,
];
