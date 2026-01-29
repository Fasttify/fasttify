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
import { PlanType, SubscriptionProcessResult } from '@/app/api/_lib/polar/types';
import { extractPlanPrice } from '@/app/api/_lib/polar/utils/price-extractor.util';

/**
 * Servicio para procesar datos de webhooks de Polar
 * Implementa Clean Architecture separando lógica de procesamiento de datos
 */
export class PolarWebhookProcessorService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly mapProductIdToPlan: (productId: string) => PlanType
  ) {}

  /**
   * Procesa una suscripción usando datos del webhook de Polar
   */
  async processSubscriptionWithData(subscriptionId: string, polarData: any): Promise<SubscriptionProcessResult> {
    try {
      // Manejar tanto el campo antiguo como el nuevo
      const userId =
        polarData.customerExternalId ||
        polarData.customer?.externalId ||
        polarData.customer?.external_customer_id ||
        polarData.customer_external_id ||
        polarData.external_customer_id;

      // Si no encontramos el external_id, intentar obtenerlo del customer_id
      let finalUserId = userId;
      if (!finalUserId && polarData.customer_id) {
        console.log(`external_id not found in webhook payload, fetching from customer_id: ${polarData.customer_id}`);
        try {
          const polarService = new PolarService(process.env.POLAR_ACCESS_TOKEN || '');
          const customer = await polarService.getCustomer(polarData.customer_id);
          finalUserId = customer?.externalId || '';
        } catch (error) {
          console.error(`Error fetching customer ${polarData.customer_id}:`, error);
        }
      }

      if (!finalUserId) {
        return {
          success: false,
          userId: '',
          plan: PlanType.FREE,
          message: 'No user ID found in subscription data',
        };
      }

      // Determinar acción basada en el estado de la suscripción
      if (this.isSubscriptionActiveFromData(polarData)) {
        return await this.activateSubscriptionWithData(finalUserId, polarData);
      } else if (this.isSubscriptionCanceledFromData(polarData)) {
        return await this.cancelSubscriptionWithData(finalUserId, polarData);
      }

      return {
        success: true,
        userId: finalUserId,
        plan: PlanType.FREE,
        message: 'Subscription processed successfully',
      };
    } catch (error) {
      console.error(`Error processing subscription with data ${subscriptionId}:`, error);
      return {
        success: false,
        userId: '',
        plan: PlanType.FREE,
        message: `Error processing subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Determina si una suscripción está activa basándose en datos del webhook
   */
  private isSubscriptionActiveFromData(polarData: any): boolean {
    return polarData.status === 'active' || polarData.status === 'trialing';
  }

  /**
   * Determina si una suscripción está cancelada basándose en datos del webhook
   */
  private isSubscriptionCanceledFromData(polarData: any): boolean {
    return (
      polarData.status === 'canceled' || polarData.status === 'incomplete_expired' || polarData.status === 'unpaid'
    );
  }

  /**
   * Activa una suscripción usando datos del webhook de Polar
   */
  private async activateSubscriptionWithData(userId: string, polarData: any): Promise<SubscriptionProcessResult> {
    try {
      const plan = this.mapProductIdToPlan(polarData.productId);

      if (plan === PlanType.FREE) {
        return {
          success: false,
          userId,
          plan: PlanType.FREE,
          message: `Invalid product ID: ${polarData.productId}`,
        };
      }

      // Verificar si es una renovación o activación inicial
      const existingSubscription = await this.subscriptionRepository.findByUserId(userId);
      const isRenewal = existingSubscription && existingSubscription.planName === plan;

      if (isRenewal) {
        // RENOVACIÓN: Actualizar nextPaymentDate, planPrice y limpiar campos pendientes
        const nextPaymentDate = polarData.currentPeriodEnd
          ? new Date(polarData.currentPeriodEnd).toISOString()
          : undefined;
        const planPrice = extractPlanPrice(polarData);

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

        // Extraer datos necesarios para el planScheduler
        const subscriptionData = this.extractSubscriptionDataFromPolar(userId, polarData, plan);

        // Crear o actualizar registro de suscripción
        await this.subscriptionRepository.upsert(subscriptionData);

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
   * Cancela una suscripción usando datos del webhook de Polar
   */
  private async cancelSubscriptionWithData(userId: string, polarData: any): Promise<SubscriptionProcessResult> {
    try {
      const cancelAtPeriodEnd = polarData.cancelAtPeriodEnd || false;
      const currentPeriodEnd = polarData.currentPeriodEnd ? new Date(polarData.currentPeriodEnd) : null;

      if (cancelAtPeriodEnd && currentPeriodEnd) {
        return await this.scheduleSubscriptionCancellation(userId, currentPeriodEnd);
      } else {
        return await this.immediateSubscriptionCancellation(userId);
      }
    } catch (error) {
      console.error(`Error canceling subscription with data for user ${userId}:`, error);
      return {
        success: false,
        userId,
        plan: PlanType.FREE,
        message: `Error canceling subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Programa la cancelación de suscripción para el final del período
   */
  private async scheduleSubscriptionCancellation(userId: string, periodEnd: Date): Promise<SubscriptionProcessResult> {
    const existingSubscription = await this.subscriptionRepository.findByUserId(userId);
    if (existingSubscription) {
      await this.subscriptionRepository.update(userId, {
        pendingPlan: PlanType.FREE,
        pendingStartDate: periodEnd.toISOString(),
      });
    }

    console.log(`Successfully scheduled subscription cancellation for user ${userId} at ${periodEnd.toISOString()}`);

    return {
      success: true,
      userId,
      plan: PlanType.FREE,
      message: 'Subscription cancellation scheduled',
    };
  }

  /**
   * Cancela la suscripción inmediatamente
   */
  private async immediateSubscriptionCancellation(userId: string): Promise<SubscriptionProcessResult> {
    await this.userRepository.updateUserPlan(userId, PlanType.FREE);
    await this.userRepository.updateStoresStatus(userId, false);

    const existingSubscription = await this.subscriptionRepository.findByUserId(userId);
    if (existingSubscription) {
      await this.subscriptionRepository.update(userId, {
        planName: PlanType.FREE,
        pendingPlan: null,
        pendingStartDate: undefined,
        nextPaymentDate: undefined,
        planPrice: undefined,
      });
    }

    console.log(`Successfully canceled subscription immediately for user ${userId}`);

    return {
      success: true,
      userId,
      plan: PlanType.FREE,
      message: 'Subscription canceled successfully',
    };
  }

  /**
   * Extrae datos de suscripción de la respuesta de Polar
   */
  private extractSubscriptionDataFromPolar(userId: string, polarData: any, plan: PlanType): any {
    const nextPaymentDate = polarData.currentPeriodEnd ? new Date(polarData.currentPeriodEnd).toISOString() : undefined;
    const planPrice = extractPlanPrice(polarData); // Convertir de centavos a dólares

    return {
      id: userId,
      userId,
      subscriptionId: polarData.id || '',
      planName: plan,
      nextPaymentDate,
      planPrice,
      pendingPlan: null,
      pendingStartDate: null,
    };
  }
}
