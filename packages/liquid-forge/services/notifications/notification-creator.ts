/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-20.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { cookiesClient } from '@/utils/server/AmplifyServer';
import type { Order } from '../../types';
import { logger } from '../../lib/logger';
import type { CreateAdminNotificationRequest } from './types/notification-types';
import { EmailFormattingUtils } from './email-formatting-utils';

export class NotificationCreator {
  /**
   * Crea una notificación para el panel de administración
   */
  public async createAdminNotification(request: CreateAdminNotificationRequest): Promise<void> {
    const { order, storeOwner, type } = request;

    try {
      const title = this.getNotificationTitle(type);
      const message = this.getNotificationMessage(order, type);

      await cookiesClient.models.Notification.create({
        storeId: order.storeId,
        storeOwner: storeOwner,
        type: type,
        title: title,
        message: message,
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        currency: order.currency,
        customerEmail: order.customerEmail || undefined,
        priority: type === 'new_order' ? 'high' : 'medium',
      });

      logger.info(`Notification created for order ${order.orderNumber} (type: ${type})`);
    } catch (error) {
      logger.error(`Error creating notification for order ${order.orderNumber}:`, error, 'NotificationCreator');
    }
  }

  /**
   * Obtiene el título de la notificación basado en el tipo
   */
  private getNotificationTitle(type: CreateAdminNotificationRequest['type']): string {
    switch (type) {
      case 'new_order':
        return '🛒 Nuevo Pedido';
      case 'payment_confirmed':
        return '💳 Pago Confirmado';
      case 'status_updated':
        return '📦 Estado Actualizado';
      default:
        return '📢 Notificación';
    }
  }

  /**
   * Obtiene el mensaje de la notificación basado en el tipo y los datos de la orden
   */
  private getNotificationMessage(order: Order, type: CreateAdminNotificationRequest['type']): string {
    switch (type) {
      case 'new_order':
        return `Pedido #${order.orderNumber} por ${EmailFormattingUtils.formatCurrency(order.totalAmount, order.currency)}${order.customerEmail ? ` de ${order.customerEmail}` : ''}`;
      case 'payment_confirmed':
        return `Pago confirmado para el pedido #${order.orderNumber} por ${EmailFormattingUtils.formatCurrency(order.totalAmount, order.currency)}`;
      case 'status_updated':
        return `El pedido #${order.orderNumber} ha sido actualizado a ${order.status}`;
      default:
        return `Notificación para el pedido #${order.orderNumber}`;
    }
  }
}

export const notificationCreator = new NotificationCreator();
