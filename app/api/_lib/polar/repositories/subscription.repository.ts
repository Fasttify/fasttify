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
import { UserSubscriptionData, PlanType } from '@/app/api/_lib/polar/types';

/**
 * Repositorio para operaciones de suscripciones en DynamoDB
 * Implementa Clean Architecture separando infraestructura de lógica de negocio
 */
export class SubscriptionRepository {
  /**
   * Busca una suscripción por ID de usuario
   */
  async findByUserId(userId: string): Promise<UserSubscriptionData | null> {
    try {
      const response = await cookiesClient.models.UserSubscription.get({
        id: userId,
      });

      return response.data as unknown as UserSubscriptionData | null;
    } catch (error) {
      console.error(`Error finding subscription for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Crea una nueva suscripción
   */
  async create(data: UserSubscriptionData): Promise<UserSubscriptionData> {
    try {
      // Validar campos requeridos
      if (!data.userId || !data.subscriptionId || !data.planName) {
        throw new Error('Missing required fields: userId, subscriptionId, planName');
      }

      const subscriptionPayload = {
        id: data.userId,
        userId: data.userId,
        subscriptionId: data.subscriptionId,
        planName: data.planName,
        nextPaymentDate: data.nextPaymentDate,
        lastFourDigits: data.lastFourDigits,
        pendingPlan: data.pendingPlan,
      };

      const response = await cookiesClient.models.UserSubscription.create(subscriptionPayload);

      if (!response.data) {
        throw new Error('Failed to create subscription');
      }

      return response.data as unknown as UserSubscriptionData;
    } catch (error) {
      console.error(`Error creating subscription for user ${data.userId}:`, error);
      throw new Error(`Failed to create subscription: ${data.userId}`);
    }
  }

  /**
   * Actualiza una suscripción existente
   */
  async update(userId: string, data: Partial<UserSubscriptionData>): Promise<UserSubscriptionData> {
    try {
      // Filtrar campos undefined/null para evitar errores en DynamoDB
      const updateFields: Record<string, any> = {};

      if (data.subscriptionId !== undefined) updateFields.subscriptionId = data.subscriptionId;
      if (data.planName !== undefined) updateFields.planName = data.planName;
      if (data.nextPaymentDate !== undefined) updateFields.nextPaymentDate = data.nextPaymentDate;
      if (data.lastFourDigits !== undefined) updateFields.lastFourDigits = data.lastFourDigits;
      if (data.pendingPlan !== undefined) updateFields.pendingPlan = data.pendingPlan;
      if (data.pendingStartDate !== undefined) updateFields.pendingStartDate = data.pendingStartDate;
      if (data.planPrice !== undefined) updateFields.planPrice = data.planPrice;

      const updatePayload = {
        id: userId,
        ...updateFields,
      };

      const response = await cookiesClient.models.UserSubscription.update(updatePayload);

      if (!response.data) {
        throw new Error('Failed to update subscription');
      }

      return response.data as unknown as UserSubscriptionData;
    } catch (error) {
      console.error(`Error updating subscription for user ${userId}:`, error);
      throw new Error(`Failed to update subscription: ${userId}`);
    }
  }

  /**
   * Crea o actualiza una suscripción (upsert)
   */
  async upsert(data: UserSubscriptionData): Promise<UserSubscriptionData> {
    try {
      const existingSubscription = await this.findByUserId(data.userId);

      if (existingSubscription) {
        return await this.update(data.userId, data);
      } else {
        return await this.create(data);
      }
    } catch (error) {
      console.error(`Error upserting subscription for user ${data.userId}:`, error);
      throw new Error(`Failed to upsert subscription: ${data.userId}`);
    }
  }

  /**
   * Elimina una suscripción
   */
  async delete(userId: string): Promise<void> {
    try {
      await cookiesClient.models.UserSubscription.delete({
        id: userId,
      });
    } catch (error) {
      console.error(`Error deleting subscription for user ${userId}:`, error);
      throw new Error(`Failed to delete subscription: ${userId}`);
    }
  }

  /**
   * Actualiza el plan pendiente de un usuario
   */
  async updatePendingPlan(userId: string, pendingPlan: PlanType | null): Promise<void> {
    try {
      await this.update(userId, { pendingPlan });
    } catch (error) {
      console.error(`Error updating pending plan for user ${userId}:`, error);
      throw new Error(`Failed to update pending plan: ${userId}`);
    }
  }

  /**
   * Verifica si un usuario tiene una suscripción activa
   */
  async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const subscription = await this.findByUserId(userId);
      return subscription !== null && subscription.planName !== PlanType.FREE;
    } catch (error) {
      console.error(`Error checking active subscription for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Obtiene todas las suscripciones de un usuario (si hubiera múltiples)
   */
  async findAllByUserId(userId: string): Promise<UserSubscriptionData[]> {
    try {
      const response = await cookiesClient.models.UserSubscription.listUserSubscriptionByUserId({
        userId: userId,
      });

      return response.data as unknown as UserSubscriptionData[];
    } catch (error) {
      console.error(`Error finding all subscriptions for user ${userId}:`, error);
      return [];
    }
  }
}
