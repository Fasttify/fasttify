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
import { cookiesClient } from '@/utils/server/AmplifyServer';
import crypto from 'crypto';
import type { CheckoutSessionData, UserStoreCurrency } from './types/checkout-types';

export class CheckoutSessionManager {
  /**
   * Genera un token único para la sesión de checkout
   * Formato: fs_<base64url> similar a Shopify
   */
  public generateToken(): string {
    const raw = crypto.randomBytes(16).toString('base64url');
    return `fs_${raw}`;
  }

  /**
   * Obtiene el storeOwner (userId) basado en storeId
   */
  public async getStoreOwner(storeId: string): Promise<string> {
    try {
      const { data: store } = await cookiesClient.models.UserStore.get({ storeId });
      return (store as UserStoreCurrency)?.userId || '';
    } catch (error) {
      logger.error('Error getting store owner:', error);
      throw new Error('Store not found');
    }
  }

  /**
   * Crea una nueva sesión de checkout
   */
  public async createSession(sessionData: CheckoutSessionData): Promise<any> {
    try {
      // Agregar TTL para DynamoDB
      const expiresAt = new Date(sessionData.expiresAt);
      const sessionDataWithTtl = {
        ...sessionData,
        ttl: Math.floor(expiresAt.getTime() / 1000),
      };

      const response = await cookiesClient.models.CheckoutSession.create(sessionDataWithTtl);

      if (response.data) {
        logger.info(
          `Checkout session created: ${sessionData.token} for store ${sessionData.storeId} (expires: ${sessionData.expiresAt})`
        );
        return response.data;
      } else {
        logger.error('Failed to create checkout session:', response.errors);
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      logger.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Obtiene una sesión de checkout por token
   */
  public async getSessionByToken(token: string): Promise<any | null> {
    try {
      const response = await cookiesClient.models.CheckoutSession.listCheckoutSessionByToken({ token }, { limit: 1 });

      if (response.data && response.data.length > 0) {
        return response.data[0];
      }

      return null;
    } catch (error) {
      logger.error('Error getting checkout session:', error);
      return null;
    }
  }

  /**
   * Actualiza el estado de una sesión de checkout
   */
  public async updateSessionStatus(
    sessionId: string,
    status: 'open' | 'completed' | 'expired' | 'cancelled'
  ): Promise<any> {
    try {
      const response = await cookiesClient.models.CheckoutSession.update({
        id: sessionId,
        status,
      });

      if (response.data) {
        logger.info(`Checkout session ${sessionId} updated to status: ${status}`);
        return response.data;
      } else {
        throw new Error('Failed to update checkout session status');
      }
    } catch (error) {
      logger.error('Error updating checkout session status:', error);
      throw error;
    }
  }

  /**
   * Actualiza los datos del cliente en la sesión de checkout
   */
  public async updateSessionCustomerInfo(sessionId: string, updateData: any): Promise<any> {
    try {
      const response = await cookiesClient.models.CheckoutSession.update({
        id: sessionId,
        ...updateData,
      });

      if (response.data) {
        return response.data;
      } else {
        throw new Error('Failed to update checkout session');
      }
    } catch (error) {
      logger.error('Error updating checkout session:', error);
      throw error;
    }
  }

  /**
   * Verifica si una sesión ha expirado
   */
  public isSessionExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  }

  /**
   * Marca una sesión como expirada si es necesario
   */
  public async markSessionAsExpiredIfNeeded(session: any): Promise<void> {
    if (this.isSessionExpired(session.expiresAt) && session.status === 'open') {
      await this.updateSessionStatus(session.id, 'expired');
    }
  }
}

export const checkoutSessionManager = new CheckoutSessionManager();
