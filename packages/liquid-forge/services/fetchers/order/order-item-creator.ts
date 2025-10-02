/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { CartSnapshot, OrderItem } from '@/liquid-forge/types';
import { cookiesClient } from '@/utils/server/AmplifyServer';
import type { OrderItemData, ProductSnapshotData } from './types/order-types';

export class OrderItemCreator {
  /**
   * Crea los items de la orden basados en el snapshot del carrito
   */
  public async createOrderItems(
    orderId: string,
    itemsSnapshot: CartSnapshot,
    storeId: string,
    storeOwner: string
  ): Promise<OrderItem[]> {
    const orderItems: OrderItem[] = [];

    if (!itemsSnapshot.items || itemsSnapshot.items.length === 0) {
      return orderItems;
    }

    for (const item of itemsSnapshot.items) {
      try {
        // Validar que el precio esté disponible (usar unitPrice del carrito)
        const itemPrice = item.unitPrice || item.price;
        if (itemPrice === undefined || itemPrice === null) {
          continue; // Saltar este item si no tiene precio
        }

        // Crear el snapshot del producto
        const productSnapshotData = this.createProductSnapshotData(item, itemPrice);

        // Obtener compareAtPrice del productSnapshot parseado
        let compareAtPrice = null;
        try {
          if (item.productSnapshot && typeof item.productSnapshot === 'string') {
            const parsedSnapshot = JSON.parse(item.productSnapshot);
            compareAtPrice = parsedSnapshot.compare_at_price || null;
          }
        } catch (error) {
          // Silenciar error de parsing
        }

        const orderItemData: OrderItemData = {
          orderId,
          storeId,
          productId: item.product_id || item.productId,
          variantId: item.variant_id || item.variantId || null,
          quantity: item.quantity,
          compareAtPrice: compareAtPrice,
          unitPrice: itemPrice,
          totalPrice: itemPrice * item.quantity,
          productSnapshot: JSON.stringify(productSnapshotData),
          storeOwner,
        };

        const response = await cookiesClient.models.OrderItem.create(orderItemData);

        if (response.data) {
          orderItems.push(response.data as OrderItem);
        }
      } catch (error) {
        // Silenciar error, continuar con el siguiente item
      }
    }

    return orderItems;
  }

  /**
   * Crea los datos del snapshot del producto para el item de la orden
   */
  private createProductSnapshotData(item: any, itemPrice: number): ProductSnapshotData {
    // Parsear el productSnapshot para extraer información del producto
    let productInfo = null;
    try {
      if (item.productSnapshot && typeof item.productSnapshot === 'string') {
        productInfo = JSON.parse(item.productSnapshot);
      }
    } catch (error) {
      // Silenciar error de parsing, continuar con valores por defecto
    }

    return {
      id: item.product_id || item.productId,
      title: productInfo?.title || item.title || 'Unknown Product',
      variantTitle: item.variant_title || item.variantTitle || null,
      price: itemPrice,
      image: productInfo?.featured_image || productInfo?.image || item.image || null,
      handle: productInfo?.url || item.url || null,
      variantHandle: null,
      compareAtPrice: productInfo?.compare_at_price || item.compareAtPrice || null,
      attributes: item.attributes || [],
      selectedAttributes: item.selectedAttributes || {},
      snapshotAt: new Date().toISOString(),
    };
  }
}

export const orderItemCreator = new OrderItemCreator();
