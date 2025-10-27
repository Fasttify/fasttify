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

import { logger } from '../../../lib/logger';
import { dataFetcher } from '../data-fetcher';
import { cookiesClient } from '@/utils/server/AmplifyServer';

export interface StockValidationResult {
  isValid: boolean;
  error?: string;
  availableStock?: number;
  currentCartQuantity?: number;
  availableToAdd?: number;
}

export class CartStockValidator {
  /**
   * Valida que haya suficiente stock disponible para agregar al carrito
   */
  async validateStockAvailability(
    storeId: string,
    productId: string,
    variantId: string | null | undefined,
    requestedQuantity: number,
    cartId: string
  ): Promise<StockValidationResult> {
    try {
      // Obtener el producto actual para verificar stock
      const product = await dataFetcher.getProduct(storeId, productId);
      if (!product) {
        return { isValid: false, error: 'Product not found.' };
      }

      const availableStock = Number(product.quantity) || 0;

      // Obtener cantidad actual en el carrito para este producto
      const cartItemsResponse = await cookiesClient.models.CartItem.listCartItemByCartId(
        { cartId },
        { filter: { productId: { eq: productId }, variantId: { eq: variantId || undefined } } }
      );

      const existingCartItem =
        cartItemsResponse.data && cartItemsResponse.data.length > 0 ? cartItemsResponse.data[0] : undefined;

      const currentCartQuantity = existingCartItem ? existingCartItem.quantity : 0;
      const totalRequestedQuantity = currentCartQuantity + requestedQuantity;

      if (totalRequestedQuantity > availableStock) {
        const availableToAdd = availableStock - currentCartQuantity;
        if (availableToAdd <= 0) {
          return {
            isValid: false,
            error: `Not enough stock available. Current stock: ${availableStock} units.`,
            availableStock,
            currentCartQuantity,
            availableToAdd: 0,
          };
        }
        return {
          isValid: false,
          error: `You can only add ${availableToAdd} more units. Available stock: ${availableStock} units.`,
          availableStock,
          currentCartQuantity,
          availableToAdd,
        };
      }

      return {
        isValid: true,
        availableStock,
        currentCartQuantity,
        availableToAdd: availableStock - currentCartQuantity,
      };
    } catch (error) {
      logger.error('Error validating stock availability', error, 'CartStockValidator');
      return { isValid: false, error: 'Error validating stock availability.' };
    }
  }

  /**
   * Valida stock para actualización de item existente en el carrito
   */
  async validateStockForUpdate(
    storeId: string,
    productId: string,
    variantId: string | null | undefined,
    requestedQuantity: number,
    cartId: string,
    currentItemId: string
  ): Promise<StockValidationResult> {
    try {
      // Obtener el producto actual para verificar stock
      const product = await dataFetcher.getProduct(storeId, productId);
      if (!product) {
        return { isValid: false, error: 'Product not found.' };
      }

      const availableStock = Number(product.quantity) || 0;

      // Obtener cantidad actual en el carrito para este producto (excluyendo el item actual)
      const cartItemsResponse = await cookiesClient.models.CartItem.listCartItemByCartId(
        { cartId },
        { filter: { productId: { eq: productId }, variantId: { eq: variantId || undefined } } }
      );

      const otherCartItems = cartItemsResponse.data?.filter((item) => item.id !== currentItemId) || [];
      const currentCartQuantity = otherCartItems.reduce((total, item) => total + item.quantity, 0);
      const totalRequestedQuantity = currentCartQuantity + requestedQuantity;

      if (totalRequestedQuantity > availableStock) {
        const availableToAdd = availableStock - currentCartQuantity;
        if (availableToAdd <= 0) {
          return {
            isValid: false,
            error: `Not enough stock available. Current stock: ${availableStock} units.`,
            availableStock,
            currentCartQuantity,
            availableToAdd: 0,
          };
        }
        return {
          isValid: false,
          error: `You can only add ${availableToAdd} more units. Available stock: ${availableStock} units.`,
          availableStock,
          currentCartQuantity,
          availableToAdd,
        };
      }

      return {
        isValid: true,
        availableStock,
        currentCartQuantity,
        availableToAdd: availableStock - currentCartQuantity,
      };
    } catch (error) {
      logger.error('Error validating stock for update', error, 'CartStockValidator');
      return { isValid: false, error: 'Error validating stock availability.' };
    }
  }

  /**
   * Valida stock para múltiples productos de una vez (útil para checkout)
   */
  async validateMultipleProductsStock(
    storeId: string,
    products: Array<{ productId: string; variantId?: string | null; quantity: number }>,
    cartId: string
  ): Promise<{ isValid: boolean; errors: string[]; results: StockValidationResult[] }> {
    const results: StockValidationResult[] = [];
    const errors: string[] = [];

    for (const product of products) {
      const validation = await this.validateStockAvailability(
        storeId,
        product.productId,
        product.variantId,
        product.quantity,
        cartId
      );

      results.push(validation);

      if (!validation.isValid && validation.error) {
        errors.push(`${product.productId}: ${validation.error}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      results,
    };
  }

  /**
   * Obtiene información de stock para un producto específico
   */
  async getProductStockInfo(
    storeId: string,
    productId: string
  ): Promise<{
    availableStock: number;
    isInStock: boolean;
    productName?: string;
  }> {
    try {
      const product = await dataFetcher.getProduct(storeId, productId);
      if (!product) {
        return { availableStock: 0, isInStock: false };
      }

      const availableStock = Number(product.quantity) || 0;
      return {
        availableStock,
        isInStock: availableStock > 0,
        productName: product.name,
      };
    } catch (error) {
      logger.error('Error getting product stock info', error, 'CartStockValidator');
      return { availableStock: 0, isInStock: false };
    }
  }
}

export const cartStockValidator = new CartStockValidator();
