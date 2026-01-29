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

import { cookiesClient } from '@/utils/server/AmplifyServer';
import { logger } from '@/liquid-forge';
import { AnalyticsWebhookJWTAuth } from '@/api/webhooks/_lib/middleware/jwt-auth.middleware';
import type { OrderCreatedData, OrderCancelledData } from '@/api/webhooks/_lib/analytics/types/analytics-webhook.types';

interface InventoryUpdateItem {
  productId: string;
  quantity: number;
}

export class InventoryStockService {
  private getThreshold(product: any): number {
    const fallback = 5;

    const threshold = (product && (product as any).lowStockThreshold) ?? fallback;
    return typeof threshold === 'number' && threshold >= 0 ? threshold : fallback;
  }

  private clampNonNegative(value: number): number {
    return value < 0 ? 0 : value;
  }

  private async sendInventoryWebhook(
    storeId: string,
    type: 'INVENTORY_LOW' | 'INVENTORY_OUT',
    payload: any
  ): Promise<void> {
    try {
      const jwtToken = AnalyticsWebhookJWTAuth.generateToken(storeId, type);
      const baseUrl = process.env.APP_URL || 'http://localhost:3000';
      const analyticsWebhookUrl = `${baseUrl}/api/webhooks/analytics`;

      const response = await fetch(analyticsWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      logger.error('[InventoryStockService] Error sending inventory webhook', error, 'InventoryStockService');
    }
  }

  private async evaluateAndNotify(storeId: string, product: any, productName?: string): Promise<void> {
    const threshold = this.getThreshold(product);
    const qty = Number(product.quantity) || 0;

    if (qty === 0) {
      await this.sendInventoryWebhook(storeId, 'INVENTORY_OUT', {
        type: 'INVENTORY_OUT',
        storeId,
        timestamp: new Date().toISOString(),
        data: {
          productId: product.id,
          productName: productName ?? product.name ?? 'Unknown',
        },
      });
      return;
    }

    if (qty > 0 && qty <= threshold) {
      await this.sendInventoryWebhook(storeId, 'INVENTORY_LOW', {
        type: 'INVENTORY_LOW',
        storeId,
        timestamp: new Date().toISOString(),
        data: {
          productId: product.id,
          currentQuantity: qty,
          threshold,
        },
      });
    }
  }

  /**
   * Descuenta stock por cada ítem al crearse una orden
   */
  async decrementOnOrderCreated(storeId: string, orderData: OrderCreatedData): Promise<void> {
    try {
      const items: InventoryUpdateItem[] = orderData.items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
      }));

      for (const item of items) {
        try {
          const existing = await cookiesClient.models.Product.get({ id: item.productId });
          const product = existing.data;
          if (!product) {
            logger.warn(`[InventoryStockService] Product not found: ${item.productId}`, 'InventoryStockService');
            continue;
          }

          // Opcional: validar storeId si el modelo Product lo incluye
          if ((product as any).storeId && (product as any).storeId !== storeId) {
            logger.warn(
              `[InventoryStockService] Product ${item.productId} does not belong to store ${storeId}`,
              'InventoryStockService'
            );
            continue;
          }

          const currentQty = Number(product.quantity) || 0;
          const newQty = this.clampNonNegative(currentQty - item.quantity);

          const updated = await cookiesClient.models.Product.update({ id: product.id, quantity: newQty });
          if (!updated.data) {
            logger.error(
              `[InventoryStockService] Failed to update product quantity: ${product.id}`,
              updated.errors,
              'InventoryStockService'
            );
            continue;
          }

          await this.evaluateAndNotify(storeId, updated.data, product.name);
        } catch (error) {
          logger.error(
            '[InventoryStockService] Error decrementing stock for item',
            { item, error },
            'InventoryStockService'
          );
        }
      }
    } catch (error) {
      logger.error('[InventoryStockService] Error in decrementOnOrderCreated', error, 'InventoryStockService');
    }
  }

  /**
   * Repone stock por cada ítem al cancelarse una orden
   */
  async incrementOnOrderCancelled(
    storeId: string,
    orderData: OrderCancelledData & { items?: { productId: string; quantity: number }[] }
  ): Promise<void> {
    try {
      const items = orderData.items || [];
      if (!Array.isArray(items) || items.length === 0) {
        return;
      }

      for (const item of items) {
        try {
          const existing = await cookiesClient.models.Product.get({ id: item.productId });
          const product = existing.data;
          if (!product) {
            logger.warn(`[InventoryStockService] Product not found: ${item.productId}`, 'InventoryStockService');
            continue;
          }

          if ((product as any).storeId && (product as any).storeId !== storeId) {
            logger.warn(
              `[InventoryStockService] Product ${item.productId} does not belong to store ${storeId}`,
              'InventoryStockService'
            );
            continue;
          }

          const currentQty = Number(product.quantity) || 0;
          const newQty = currentQty + (Number(item.quantity) || 0);

          const updated = await cookiesClient.models.Product.update({ id: product.id, quantity: newQty });
          if (!updated.data) {
            logger.error(
              `[InventoryStockService] Failed to update product quantity (cancelled): ${product.id}`,
              updated.errors,
              'InventoryStockService'
            );
            continue;
          }

          await this.evaluateAndNotify(storeId, updated.data, product.name);
        } catch (error) {
          logger.error(
            '[InventoryStockService] Error incrementing stock for item (cancelled)',
            { item, error },
            'InventoryStockService'
          );
        }
      }
    } catch (error) {
      logger.error('[InventoryStockService] Error in incrementOnOrderCancelled', error, 'InventoryStockService');
    }
  }
}

export const inventoryStockService = new InventoryStockService();
