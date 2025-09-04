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

import type { Order } from '@/renderer-engine/types';
import { cookiesClient } from '@/utils/server/AmplifyServer';
import { customerInfoManager } from './customer-info-manager';
import { orderItemCreator } from './order-item-creator';
import { orderNumberGenerator } from './order-number-generator';
import { orderValidator } from './order-validator';
import type { CreateOrderRequest, CreateOrderResponse } from './types/order-types';
import { EmailOrderService } from '../../notifications/email-order-service';
import { notificationCreator } from '../../notifications';

export class OrderFetcher {
  /**
   * Crea una nueva orden basada en la sesión de checkout completada
   */
  public async createOrderFromCheckout(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      const { checkoutSession, paymentMethod, paymentId, customerEmail } = request;

      if (checkoutSession.status !== 'completed') {
        return {
          success: false,
          error: 'Checkout session must be completed to create order',
        };
      }

      // Generar número de orden único
      const orderNumber = orderNumberGenerator.generateOrderNumber();

      // Determinar información del cliente
      const customerType = customerInfoManager.determineCustomerType(checkoutSession.customerInfo, customerEmail);

      const customerId = customerInfoManager.extractCustomerId(checkoutSession.customerInfo, checkoutSession.sessionId);

      // Extraer email del customerInfo o usar el proporcionado
      const finalCustomerEmail = customerInfoManager.extractCustomerEmail(checkoutSession.customerInfo, customerEmail);

      // Calcular el compareAtPrice total antes de crear la orden
      let totalCompareAtPrice = 0;
      if (checkoutSession.itemsSnapshot) {
        for (const item of checkoutSession.itemsSnapshot.items) {
          try {
            if (item.productSnapshot && typeof item.productSnapshot === 'string') {
              const parsedSnapshot = JSON.parse(item.productSnapshot);
              const itemCompareAtPrice = parsedSnapshot.compare_at_price || 0;
              totalCompareAtPrice += itemCompareAtPrice * (item.quantity || 1);
            }
          } catch (error) {
            // Silenciar error de parsing
          }
        }
      }

      // Crear datos de la orden
      const orderData = {
        orderNumber,
        storeId: checkoutSession.storeId,
        customerId,
        customerType,
        customerEmail: finalCustomerEmail,
        subtotal: checkoutSession.subtotal,
        shippingCost: checkoutSession.shippingCost,
        taxAmount: checkoutSession.taxAmount,
        totalAmount: checkoutSession.totalAmount,
        compareAtPrice: totalCompareAtPrice,
        currency: checkoutSession.currency,
        status: 'pending' as const,
        paymentStatus: 'pending' as const,
        paymentMethod: paymentMethod || 'Manual',
        paymentId: paymentId || null,
        shippingAddress: checkoutSession.shippingAddress ? JSON.stringify(checkoutSession.shippingAddress) : null,
        billingAddress: checkoutSession.billingAddress ? JSON.stringify(checkoutSession.billingAddress) : null,
        customerInfo: checkoutSession.customerInfo ? JSON.stringify(checkoutSession.customerInfo) : null,
        notes: checkoutSession.notes,
        storeOwner: checkoutSession.storeOwner,
      };

      // Validar campos requeridos
      const requiredValidation = orderValidator.validateRequiredFields(orderData);
      if (!requiredValidation.isValid) {
        return {
          success: false,
          error: `Missing required fields: ${requiredValidation.errors.join(', ')}`,
        };
      }

      // Validar campos JSON
      const jsonValidation = orderValidator.validateJsonFields(orderData);
      if (!jsonValidation.isValid) {
        return {
          success: false,
          error: `JSON field validation failed: ${jsonValidation.errors.join(', ')}`,
        };
      }

      // Validar datos completos de la orden
      const validation = orderValidator.validateOrderData(orderData);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Order data validation failed: ${validation.errors.join(', ')}`,
        };
      }

      // Crear la orden
      const orderResponse = await cookiesClient.models.Order.create(orderData);

      if (!orderResponse.data) {
        return {
          success: false,
          error: 'Failed to create order',
        };
      }

      const order = orderResponse.data as Order;

      // Crear los items de la orden
      if (checkoutSession.itemsSnapshot) {
        await orderItemCreator.createOrderItems(
          order.id,
          checkoutSession.itemsSnapshot,
          checkoutSession.storeId,
          checkoutSession.storeOwner
        );
      }

      if (finalCustomerEmail) {
        this.sendOrderConfirmationEmail(order, checkoutSession);
      }

      // Crear notificación para el panel de administración
      await notificationCreator.createAdminNotification({
        order: order,
        storeOwner: checkoutSession.storeOwner,
        type: 'new_order',
      });

      return {
        success: true,
        order,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Internal error creating order',
      };
    }
  }

  /**
   * Obtiene una orden por ID
   */
  public async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const response = await cookiesClient.models.Order.get({ id: orderId });
      return (response.data as Order) || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtiene una orden por número de orden
   */
  public async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    try {
      const response = await cookiesClient.models.Order.listOrderByOrderNumber({ orderNumber }, { limit: 1 });

      if (response.data && response.data.length > 0) {
        return response.data[0] as Order;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtiene órdenes por storeId
   */
  public async getOrdersByStore(storeId: string, limit: number = 50): Promise<Order[]> {
    try {
      const response = await cookiesClient.models.Order.listOrderByStoreId({ storeId }, { limit });

      return (response.data as Order[]) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Actualiza el estado de una orden
   */
  public async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    try {
      const response = await cookiesClient.models.Order.update({
        id: orderId,
        status,
      });

      if (response.data) {
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Actualiza el estado de pago de una orden
   */
  public async updatePaymentStatus(orderId: string, paymentStatus: Order['paymentStatus']): Promise<boolean> {
    try {
      const response = await cookiesClient.models.Order.update({
        id: orderId,
        paymentStatus,
      });

      if (response.data) {
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Envía email de confirmación al cliente cuando se crea una orden
   */
  private async sendOrderConfirmationEmail(order: Order, checkoutSession: any): Promise<void> {
    EmailOrderService.sendOrderConfirmationEmail(order, checkoutSession);
  }
}

export const orderFetcher = new OrderFetcher();
