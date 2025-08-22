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

import { logger } from '@/renderer-engine/lib/logger';
import type { Cart, CartContext } from '@/renderer-engine/types';

export class CartContextTransformer {
  /**
   * Transforma el carrito al formato para Liquid Context
   */
  public transformCartToContext(cart: Cart): CartContext {
    const totalItems = Array.isArray(cart.items) ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;

    const totalPrice = Array.isArray(cart.items) ? cart.items.reduce((total, item) => total + item.totalPrice, 0) : 0;

    return {
      id: cart.id,
      item_count: totalItems,
      total_price: totalPrice,
      currency: cart.currency || 'COP',
      items: Array.isArray(cart.items) ? cart.items.map((item) => this.transformCartItemToContext(item)) : [],
      created_at: cart.createdAt,
      updated_at: cart.updatedAt,
    };
  }

  /**
   * Transforma un item del carrito al formato de contexto
   */
  private transformCartItemToContext(item: any): any {
    let productSnapshotParsed: any = {};
    if (typeof item.productSnapshot === 'string') {
      try {
        productSnapshotParsed = JSON.parse(item.productSnapshot);
      } catch (e) {
        logger.error('Failed to parse productSnapshot for cart item', e, 'CartContextTransformer');
      }
    }

    return {
      id: item.id,
      product_id: item.productId,
      variant_id: item.variantId || '',
      title: productSnapshotParsed.name || 'N/A',
      price: item.unitPrice,
      quantity: item.quantity,
      line_price: item.totalPrice,
      image: productSnapshotParsed.images?.[0] || '',
      url: `/products/${productSnapshotParsed.slug || productSnapshotParsed.id}`,
      attributes: productSnapshotParsed.attributes || [],
      selectedAttributes: productSnapshotParsed.selectedAttributes || {},
      variant_title: productSnapshotParsed.variant_title || '',
    };
  }
}

export const cartContextTransformer = new CartContextTransformer();
