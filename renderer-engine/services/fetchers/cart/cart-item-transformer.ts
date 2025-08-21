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

import type { TransformedCartItem } from './types/cart-types';

export class CartItemTransformer {
  /**
   * Transforma un item del carrito para incluir los atributos del productSnapshot
   */
  public transformCartItem(item: any): TransformedCartItem {
    let productSnapshot = null;
    try {
      if (item.productSnapshot && typeof item.productSnapshot === 'string') {
        productSnapshot = JSON.parse(item.productSnapshot);
      }
    } catch (error) {}

    return {
      ...item,
      attributes: productSnapshot?.attributes || [],
      selectedAttributes: productSnapshot?.selectedAttributes || {},
      title: productSnapshot?.title || productSnapshot?.name || 'Unknown Product',
      price: item.unitPrice,
      image: productSnapshot?.featured_image || productSnapshot?.image,
      url: productSnapshot?.url,
      variant_title: productSnapshot?.variantTitle,
    };
  }

  /**
   * Transforma un array de items del carrito
   */
  public transformCartItems(items: any[]): TransformedCartItem[] {
    return (items || []).map((item) => this.transformCartItem(item));
  }

  /**
   * Crea un productSnapshot para un producto
   */
  public createProductSnapshot(product: any, selectedAttributes?: Record<string, string>): string {
    return JSON.stringify({
      id: product.id,
      storeId: product.storeId,
      name: product.name,
      title: product.name,
      slug: product.slug,
      attributes: product.attributes || [],
      selectedAttributes: selectedAttributes || {},
      featured_image: product.featured_image,
      quantity: product.quantity,
      description: product.description,
      price: product.price,
      compare_at_price: product.compare_at_price,
      url: product.url,
      images: product.images || [],
      variants: product.variants || [],
      status: product.status,
      category: product.category,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  }
}

export const cartItemTransformer = new CartItemTransformer();
