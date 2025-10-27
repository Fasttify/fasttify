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
import type { CheckoutResponse, CheckoutSession } from '../../../types';
import { orderFetcher, type CreateOrderRequest } from '../order';

export class CheckoutOrderCreator {
  /**
   * Completa una sesión de checkout (la marca como completed) y crea la orden
   */
  public async completeCheckout(
    session: CheckoutSession,
    paymentMethod?: string,
    paymentId?: string,
    customerEmail?: string
  ): Promise<CheckoutResponse> {
    try {
      // Crear la orden automáticamente
      const createOrderRequest: CreateOrderRequest = {
        checkoutSession: session,
        paymentMethod,
        paymentId,
        customerEmail,
      };

      const orderResponse = await orderFetcher.createOrderFromCheckout(createOrderRequest);

      if (orderResponse.success) {
        logger.info(`Order created successfully for checkout session ${session.token}`);
        return {
          success: true,
          session: session,
          order: orderResponse.order,
        };
      } else {
        logger.error(`Failed to create order for checkout session ${session.token}:`, orderResponse.error);
        // Aunque falle la creación de la orden, el checkout se completó
        // Podemos retornar éxito pero con un warning
        return {
          success: true,
          session: session,
          warning: 'Checkout completed but order creation failed',
        };
      }
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
    session: CheckoutSession,
    paymentMethod: string,
    paymentId: string,
    customerEmail?: string
  ): Promise<CheckoutResponse> {
    return this.completeCheckout(session, paymentMethod, paymentId, customerEmail);
  }
}

export const checkoutOrderCreator = new CheckoutOrderCreator();
