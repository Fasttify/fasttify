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

import { Polar } from '@polar-sh/sdk';
import { PolarSubscription, PolarCustomer, SubscriptionStatus } from '@/app/api/_lib/polar/types';

/**
 * Servicio para interactuar con la API de Polar
 * Implementa Clean Architecture como capa de infraestructura
 */
export class PolarService {
  private readonly polar: Polar;

  constructor(accessToken: string) {
    this.polar = new Polar({
      accessToken,
      server: this.getServerEnvironment(),
    });
  }

  /**
   * Obtiene el entorno del servidor (sandbox/production)
   */
  private getServerEnvironment(): 'sandbox' | 'production' {
    return process.env.NODE_ENV === 'production' ? 'production' : 'sandbox';
  }

  /**
   * Obtiene una suscripción por ID
   */
  async getSubscription(subscriptionId: string): Promise<PolarSubscription | null> {
    try {
      const response = await this.polar.subscriptions.get({
        id: subscriptionId,
      });

      if (!response) {
        console.warn(`Subscription not found: ${subscriptionId}`);
        return null;
      }

      return this.mapToPolarSubscription(response);
    } catch (error) {
      console.error(`Error fetching subscription ${subscriptionId}:`, error);
      return null;
    }
  }

  /**
   * Obtiene un cliente por ID
   */
  async getCustomer(customerId: string): Promise<PolarCustomer | null> {
    try {
      const response = await this.polar.customers.get({
        id: customerId,
      });

      if (!response) {
        console.warn(`Customer not found: ${customerId}`);
        return null;
      }

      return this.mapToPolarCustomer(response);
    } catch (error) {
      console.error(`Error fetching customer ${customerId}:`, error);
      return null;
    }
  }

  /**
   * Obtiene un cliente por external ID
   */
  async getCustomerByExternalId(externalId: string): Promise<PolarCustomer | null> {
    try {
      const response = await this.polar.customers.getExternal({
        externalId: externalId,
      });

      if (!response) {
        console.warn(`Customer not found with external ID: ${externalId}`);
        return null;
      }

      return this.mapToPolarCustomer(response);
    } catch (error) {
      console.error(`Error fetching customer by external ID ${externalId}:`, error);
      return null;
    }
  }

  /**
   * Obtiene el estado completo de un cliente (incluye suscripciones activas)
   */
  async getCustomerState(customerId: string): Promise<any | null> {
    try {
      const response = await this.polar.customers.getState({
        id: customerId,
      });

      return response;
    } catch (error) {
      console.error(`Error fetching customer state ${customerId}:`, error);
      return null;
    }
  }

  /**
   * Verifica si un cliente tiene suscripciones activas
   */
  async hasActiveSubscriptions(customerId: string): Promise<boolean> {
    try {
      const customerState = await this.getCustomerState(customerId);

      if (!customerState) {
        return false;
      }

      const activeSubscriptions = customerState.activeSubscriptions || [];
      return activeSubscriptions.length > 0;
    } catch (error) {
      console.error(`Error checking active subscriptions for customer ${customerId}:`, error);
      return false;
    }
  }

  /**
   * Mapea la respuesta de Polar a nuestro tipo PolarSubscription
   */
  private mapToPolarSubscription(polarResponse: any): PolarSubscription {
    return {
      id: polarResponse.id,
      status: polarResponse.status as SubscriptionStatus,
      customerId: polarResponse.customer?.id || '',
      customerExternalId: polarResponse.customer?.externalId || '',
      productId: polarResponse.productId || '',
      amount: polarResponse.amount || 0,
      currentPeriodEnd: polarResponse.currentPeriodEnd ? new Date(polarResponse.currentPeriodEnd) : new Date(),
      cancelAtPeriodEnd: polarResponse.cancelAtPeriodEnd || false,
    };
  }

  /**
   * Mapea la respuesta de Polar a nuestro tipo PolarCustomer
   */
  private mapToPolarCustomer(polarResponse: any): PolarCustomer {
    return {
      id: polarResponse.id,
      email: polarResponse.email || '',
      name: polarResponse.name || '',
      externalId: polarResponse.externalId || '',
    };
  }

  /**
   * Verifica si una suscripción está activa
   */
  isSubscriptionActive(subscription: PolarSubscription): boolean {
    return subscription.status === SubscriptionStatus.ACTIVE;
  }

  /**
   * Verifica si una suscripción está cancelada
   */
  isSubscriptionCanceled(subscription: PolarSubscription): boolean {
    return [SubscriptionStatus.CANCELED, SubscriptionStatus.INCOMPLETE_EXPIRED, SubscriptionStatus.UNPAID].includes(
      subscription.status
    );
  }
}
