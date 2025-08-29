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
import type {
  Cart,
  CartSnapshot,
  CheckoutContext,
  CheckoutResponse,
  CheckoutSession,
  CheckoutStatus,
  StartCheckoutRequest,
  UpdateCustomerInfoRequest,
} from '@/renderer-engine/types';
import { checkoutDataTransformer } from './checkout-data-transformer';
import { checkoutOrderCreator } from './checkout-order-creator';
import { checkoutSessionManager } from './checkout-session-manager';
import type { CheckoutTotals } from './types/checkout-types';

export class CheckoutFetcher {
  /**
   * Inicia una nueva sesión de checkout
   */
  public async startCheckout(request: StartCheckoutRequest, cart: Cart): Promise<CheckoutResponse> {
    try {
      const token = checkoutSessionManager.generateToken();
      const storeOwner = await checkoutSessionManager.getStoreOwner(request.storeId);

      // Configurar expiración (24 horas por defecto)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Calcular totales basados en el carrito
      const totals = this.calculateCheckoutTotals(cart);

      // Crear snapshot de los items del carrito
      const itemsSnapshot = this.createItemsSnapshot(cart);

      const sessionData = {
        token,
        storeId: request.storeId,
        cartId: request.cartId,
        sessionId: request.sessionId,
        status: 'open' as const,
        expiresAt: expiresAt.toISOString(),
        currency: cart.currency || 'COP',
        ...totals,
        itemsSnapshot: JSON.stringify(itemsSnapshot),
        customerInfo: request.customerInfo ? JSON.stringify(request.customerInfo) : null,
        shippingAddress: request.shippingAddress ? JSON.stringify(request.shippingAddress) : null,
        billingAddress: request.billingAddress ? JSON.stringify(request.billingAddress) : null,
        notes: request.notes,
        storeOwner,
      };

      const response = await checkoutSessionManager.createSession(sessionData);

      return {
        success: true,
        session: this.transformToSession(response),
      };
    } catch (error) {
      logger.error('Error starting checkout:', error);
      return {
        success: false,
        error: 'Internal error starting checkout',
      };
    }
  }

  /**
   * Obtiene una sesión de checkout por token
   */
  public async getSessionByToken(token: string): Promise<CheckoutSession | null> {
    try {
      const session = await checkoutSessionManager.getSessionByToken(token);

      if (!session) {
        return null;
      }

      // Verificar si la sesión ha expirado
      if (checkoutSessionManager.isSessionExpired(session.expiresAt)) {
        await checkoutSessionManager.markSessionAsExpiredIfNeeded(session);
        return null;
      }

      return this.transformToSession(session);
    } catch (error) {
      logger.error('Error getting checkout session:', error);
      return null;
    }
  }

  /**
   * Actualiza los datos del cliente en la sesión de checkout
   */
  public async updateCustomerInfo(request: UpdateCustomerInfoRequest): Promise<CheckoutResponse> {
    try {
      // Obtener la sesión raw directamente de la base de datos
      const session = await checkoutSessionManager.getSessionByToken(request.token);

      if (!session) {
        return {
          success: false,
          error: 'Checkout session not found',
        };
      }

      if (session.status !== 'open') {
        return {
          success: false,
          error: 'Checkout session not available',
        };
      }

      const updateData: any = {};
      if (request.customerInfo) updateData.customerInfo = JSON.stringify(request.customerInfo);
      if (request.shippingAddress) updateData.shippingAddress = JSON.stringify(request.shippingAddress);
      if (request.billingAddress) updateData.billingAddress = JSON.stringify(request.billingAddress);
      if (request.notes !== undefined) updateData.notes = request.notes;

      const updatedSession = await checkoutSessionManager.updateSessionCustomerInfo(session.id, updateData);

      return {
        success: true,
        session: this.transformToSession(updatedSession),
      };
    } catch (error) {
      logger.error('Error updating checkout session:', error);
      return {
        success: false,
        error: 'Internal error updating checkout session',
      };
    }
  }

  /**
   * Actualiza el estado de una sesión de checkout
   */
  public async updateSessionStatus(token: string, status: CheckoutStatus): Promise<CheckoutResponse> {
    try {
      // Obtener la sesión raw directamente para tener el ID
      const session = await checkoutSessionManager.getSessionByToken(token);

      if (!session) {
        return {
          success: false,
          error: 'Checkout session not found',
        };
      }

      const updatedSession = await checkoutSessionManager.updateSessionStatus(session.id, status);

      return {
        success: true,
        session: this.transformToSession(updatedSession),
      };
    } catch (error) {
      logger.error('Error updating checkout session status:', error);
      return {
        success: false,
        error: 'Internal error updating checkout session',
      };
    }
  }

  /**
   * Completa una sesión de checkout (la marca como completed) y crea la orden
   */
  public async completeCheckout(
    token: string,
    paymentMethod?: string,
    paymentId?: string,
    customerEmail?: string
  ): Promise<CheckoutResponse> {
    try {
      // Primero actualizar el estado a completed
      const updateResponse = await this.updateSessionStatus(token, 'completed');

      if (!updateResponse.success || !updateResponse.session) {
        return updateResponse;
      }

      // Crear la orden automáticamente
      return await checkoutOrderCreator.completeCheckout(
        updateResponse.session,
        paymentMethod,
        paymentId,
        customerEmail
      );
    } catch (error) {
      logger.error('Error completing checkout:', error);
      return {
        success: false,
        error: 'Internal error completing checkout',
      };
    }
  }

  /**
   * Completa una sesión de checkout con información de pago y crea la orden
   */
  public async completeCheckoutWithPayment(
    token: string,
    paymentMethod: string,
    paymentId: string,
    customerEmail?: string
  ): Promise<CheckoutResponse> {
    return this.completeCheckout(token, paymentMethod, paymentId, customerEmail);
  }

  /**
   * Cancela una sesión de checkout
   */
  public async cancelCheckout(token: string): Promise<CheckoutResponse> {
    return this.updateSessionStatus(token, 'cancelled');
  }

  /**
   * Transforma los datos raw de Amplify a formato CheckoutSession
   */
  private transformToSession(rawData: any): CheckoutSession {
    return {
      token: rawData.token,
      storeId: rawData.storeId,
      cartId: rawData.cartId,
      sessionId: rawData.sessionId,
      status: rawData.status,
      expiresAt: rawData.expiresAt,
      currency: rawData.currency || 'COP',
      subtotal: rawData.subtotal || 0,
      shippingCost: rawData.shippingCost || 0,
      taxAmount: rawData.taxAmount || 0,
      totalAmount: rawData.totalAmount || 0,
      itemsSnapshot: rawData.itemsSnapshot ? JSON.parse(rawData.itemsSnapshot) : null,
      customerInfo: rawData.customerInfo ? JSON.parse(rawData.customerInfo) : null,
      shippingAddress: rawData.shippingAddress ? JSON.parse(rawData.shippingAddress) : null,
      billingAddress: rawData.billingAddress ? JSON.parse(rawData.billingAddress) : null,
      notes: rawData.notes,
      storeOwner: rawData.storeOwner,
    };
  }

  /**
   * Transforma sesión de checkout para uso en contexto Liquid
   */
  public transformSessionToContext(session: CheckoutSession): CheckoutContext {
    return checkoutDataTransformer.transformSessionToContext(session);
  }

  /**
   * Valida una sesión de checkout
   */
  public validateSession(session: CheckoutSession): boolean {
    return checkoutDataTransformer.validateCheckoutSession(session);
  }

  /**
   * Calcula los totales del checkout basados en el carrito
   */
  private calculateCheckoutTotals(cart: Cart): CheckoutTotals {
    const subtotal = cart.totalAmount || 0;
    const shippingCost = 0; // Por ahora, se puede calcular después
    const taxAmount = 0; // Por ahora, se puede calcular después
    const totalAmount = subtotal + shippingCost + taxAmount;

    return {
      subtotal,
      shippingCost,
      taxAmount,
      totalAmount,
    };
  }

  /**
   * Crea el snapshot de los items del carrito
   */
  private createItemsSnapshot(cart: Cart): CartSnapshot {
    return {
      items: (cart.items || []).map((item: any) => ({
        ...item,
        attributes: item.attributes || [],
        selectedAttributes: item.selectedAttributes || {},
        product_id: item.product_id || item.productId,
        variant_id: item.variant_id || item.variantId,
        title: item.title,
        price: item.price,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        image: item.image,
        url: item.url,
        variant_title: item.variant_title || item.variantTitle,
      })),
      itemCount: cart.itemCount || 0,
      cartTotal: cart.totalAmount || 0,
      snapshotAt: new Date().toISOString(),
    };
  }
}

export const checkoutFetcher = new CheckoutFetcher();
