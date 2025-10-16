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

/**
 * Tipos de planes disponibles
 */
export enum PlanType {
  ROYAL = 'Royal',
  MAJESTIC = 'Majestic',
  IMPERIAL = 'Imperial',
  FREE = 'Free',
}

/**
 * Estado de una suscripción en Polar
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
  TRIALING = 'trialing',
}

/**
 * Datos de suscripción de Polar
 */
export interface PolarSubscription {
  id: string;
  status: SubscriptionStatus;
  customerId: string;
  customerExternalId: string;
  productId: string;
  amount: number;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

/**
 * Datos de cliente de Polar
 */
export interface PolarCustomer {
  id: string;
  email: string;
  name: string;
  externalId: string;
}

/**
 * Datos de suscripción del usuario en nuestro sistema
 */
export interface UserSubscriptionData {
  id: string;
  userId: string;
  subscriptionId: string;
  planName: PlanType;
  nextPaymentDate?: string;
  lastFourDigits?: number;
  pendingPlan?: PlanType | null;
}

/**
 * Parámetros para crear checkout
 */
export interface CheckoutParams {
  productId: string;
  userId: string;
  email: string;
  name: string;
}

/**
 * Resultado de procesamiento de suscripción
 */
export interface SubscriptionProcessResult {
  success: boolean;
  userId: string;
  plan: PlanType;
  message?: string;
}

/**
 * Configuración de productos por entorno
 */
export interface ProductConfig {
  development: {
    royal: string;
    majestic: string;
    imperial: string;
  };
  production: {
    royal: string;
    majestic: string;
    imperial: string;
  };
}

/**
 * Mapeo de ID de producto a tipo de plan
 */
export interface ProductPlanMapping {
  [productId: string]: PlanType;
}
