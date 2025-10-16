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

import { UserRepository } from '@/app/api/_lib/polar/repositories/user.repository';
import { SubscriptionRepository } from '@/app/api/_lib/polar/repositories/subscription.repository';
import { PolarService } from '@/app/api/_lib/polar/services/polar.service';
import { PlanType, SubscriptionProcessResult, ProductConfig, ProductPlanMapping } from '@/app/api/_lib/polar/types';

/**
 * Servicio de aplicación para lógica de negocio de suscripciones
 * Implementa Clean Architecture como capa de aplicación
 * Coordina repositorios y servicios de infraestructura
 */
export class SubscriptionService {
  private readonly productConfig: ProductConfig;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly polarService: PolarService
  ) {
    this.productConfig = this.initializeProductConfig();
  }

  /**
   * Procesa una actualización de suscripción desde webhook de Polar
   */
  async processSubscriptionUpdate(subscriptionId: string): Promise<SubscriptionProcessResult> {
    try {
      console.log(`Processing subscription update for: ${subscriptionId}`);

      const polarSubscription = await this.polarService.getSubscription(subscriptionId);

      if (!polarSubscription) {
        return {
          success: false,
          userId: '',
          plan: PlanType.FREE,
          message: `Subscription not found: ${subscriptionId}`,
        };
      }

      const userId = polarSubscription.customerExternalId;

      if (!userId) {
        return {
          success: false,
          userId: '',
          plan: PlanType.FREE,
          message: 'No user ID found in subscription',
        };
      }

      // Determinar acción basada en el estado de la suscripción
      const isActive = this.polarService.isSubscriptionActive(polarSubscription);
      const isCanceled = this.polarService.isSubscriptionCanceled(polarSubscription);
      const isScheduledForCancellation = this.polarService.isSubscriptionScheduledForCancellation(polarSubscription);

      // Priorizar cancelación sobre activación
      if (isCanceled || isScheduledForCancellation) {
        return await this.cancelSubscription(userId, polarSubscription);
      } else if (isActive) {
        return await this.activateSubscription(userId, polarSubscription.productId, subscriptionId, polarSubscription);
      }

      return {
        success: true,
        userId,
        plan: PlanType.FREE,
        message: 'Subscription processed successfully',
      };
    } catch (error) {
      console.error(`Error processing subscription update ${subscriptionId}:`, error);
      return {
        success: false,
        userId: '',
        plan: PlanType.FREE,
        message: `Error processing subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Activa una suscripción para un usuario
   */
  async activateSubscription(
    userId: string,
    productId: string,
    subscriptionId?: string,
    polarSubscription?: any
  ): Promise<SubscriptionProcessResult> {
    try {
      const plan = this.mapProductIdToPlan(productId);

      if (plan === PlanType.FREE) {
        return {
          success: false,
          userId,
          plan: PlanType.FREE,
          message: `Invalid product ID: ${productId}`,
        };
      }

      // Verificar si es una renovación o activación inicial
      const existingSubscription = await this.subscriptionRepository.findByUserId(userId);
      const isRenewal = existingSubscription && existingSubscription.planName === plan;

      if (isRenewal) {
        // RENOVACIÓN: Actualizar nextPaymentDate, planPrice y limpiar campos pendientes
        const nextPaymentDate = polarSubscription?.currentPeriodEnd
          ? new Date(polarSubscription.currentPeriodEnd).toISOString()
          : undefined;
        const planPrice = polarSubscription?.amount ? polarSubscription.amount / 100 : undefined;

        await this.subscriptionRepository.update(userId, {
          nextPaymentDate,
          planPrice,
          pendingPlan: null,
          pendingStartDate: null,
        });

        console.log(`Successfully renewed subscription for user ${userId} with plan ${plan}`);
        return {
          success: true,
          userId,
          plan,
          message: `Subscription renewed with plan ${plan}`,
        };
      } else {
        // ACTIVACIÓN INICIAL: Cambiar plan y activar tiendas
        await this.userRepository.updateUserPlan(userId, plan);
        await this.userRepository.updateStoresStatus(userId, true);

        const nextPaymentDate = polarSubscription?.currentPeriodEnd
          ? new Date(polarSubscription.currentPeriodEnd).toISOString()
          : undefined;
        const planPrice = polarSubscription?.amount ? polarSubscription.amount / 100 : undefined;

        await this.subscriptionRepository.upsert({
          id: userId,
          userId,
          subscriptionId: subscriptionId || '',
          planName: plan,
          nextPaymentDate,
          planPrice,
          pendingPlan: null,
          pendingStartDate: null,
        });

        console.log(`Successfully activated subscription for user ${userId} with plan ${plan}`);
        return {
          success: true,
          userId,
          plan,
          message: `Subscription activated with plan ${plan}`,
        };
      }
    } catch (error) {
      console.error(`Error activating subscription for user ${userId}:`, error);
      return {
        success: false,
        userId,
        plan: PlanType.FREE,
        message: `Error activating subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Cancela/downgrade una suscripción de un usuario
   */
  async cancelSubscription(userId: string, polarSubscription?: any): Promise<SubscriptionProcessResult> {
    try {
      const cancelAtPeriodEnd = polarSubscription?.cancelAtPeriodEnd || false;
      const currentPeriodEnd = polarSubscription?.currentPeriodEnd
        ? new Date(polarSubscription.currentPeriodEnd)
        : null;

      // Actualizar registro de suscripción
      const existingSubscription = await this.subscriptionRepository.findByUserId(userId);

      if (existingSubscription) {
        if (cancelAtPeriodEnd && currentPeriodEnd) {
          // Cancelación al final del período - mantener plan actual, establecer pendingPlan
          const updateData = {
            pendingPlan: PlanType.FREE,
            pendingStartDate: currentPeriodEnd.toISOString(),
          };

          await this.subscriptionRepository.update(userId, updateData);
        } else {
          // Cancelación inmediata - downgrade a plan gratuito
          await this.userRepository.updateUserPlan(userId, PlanType.FREE);
          await this.userRepository.updateStoresStatus(userId, false);

          await this.subscriptionRepository.update(userId, {
            planName: PlanType.FREE,
            pendingPlan: null,
            pendingStartDate: undefined,
            nextPaymentDate: undefined,
            planPrice: undefined,
          });
        }
      }

      return {
        success: true,
        userId,
        plan: PlanType.FREE,
        message: 'Subscription canceled successfully',
      };
    } catch (error) {
      console.error(`Error canceling subscription for user ${userId}:`, error);
      return {
        success: false,
        userId,
        plan: PlanType.FREE,
        message: `Error canceling subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Mapea un ID de producto de Polar a un tipo de plan
   */
  mapProductIdToPlan(productId: string): PlanType {
    const isProduction = process.env.NODE_ENV === 'production';
    const environment = isProduction ? 'production' : 'development';
    const config = this.productConfig[environment];

    const productPlanMapping: ProductPlanMapping = {
      [config.royal]: PlanType.ROYAL,
      [config.majestic]: PlanType.MAJESTIC,
      [config.imperial]: PlanType.IMPERIAL,
    };

    return productPlanMapping[productId] || PlanType.FREE;
  }

  /**
   * Obtiene el plan actual de un usuario
   */
  async getUserPlan(userId: string): Promise<PlanType> {
    try {
      const userAttributes = await this.userRepository.getUserById(userId);
      if (!userAttributes) {
        return PlanType.FREE;
      }

      return this.userRepository.getCurrentPlanFromAttributes(userAttributes);
    } catch (error) {
      console.error(`Error getting user plan for ${userId}:`, error);
      return PlanType.FREE;
    }
  }

  /**
   * Verifica si un usuario tiene un plan pagado
   */
  async hasPaidPlan(userId: string): Promise<boolean> {
    const plan = await this.getUserPlan(userId);
    return this.userRepository.isPaidPlan(plan);
  }

  /**
   * Inicializa la configuración de productos por entorno
   */
  private initializeProductConfig(): ProductConfig {
    return {
      development: {
        royal: 'd889915d-bb1a-4c54-badd-de697857e624',
        majestic: '442aacda-1fa3-47cd-8fba-6ad028285218',
        imperial: '21e675ee-db9d-4cd7-9902-0fead14a85f5',
      },
      production: {
        royal: 'e02f173f-1ca5-4f7b-a900-2e5c9413d8a6',
        majestic: '149c6595-1611-477d-b0b4-61700d33c069',
        imperial: '3a85e94a-7deb-4f94-8aa4-99a972406f0f',
      },
    };
  }
}
