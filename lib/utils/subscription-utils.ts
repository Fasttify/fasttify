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
 * Verifica si el plan del usuario está expirado o inactivo
 * @param plan - Nombre del plan del usuario
 * @param nextPaymentDate - Fecha del próximo pago en formato ISO string
 * @returns true si el plan requiere renovación, false si está activo
 */
export function isPlanExpiredOrInactive(plan?: string, nextPaymentDate?: string): boolean {
  // Planes activos que no requieren renovación
  const activePlans = ['Royal', 'Majestic', 'Imperial'];

  // Si no hay plan o es plan gratuito, requiere renovación
  if (!plan || plan === 'free' || !activePlans.includes(plan)) {
    return true;
  }

  // Si no hay fecha de próximo pago, el plan está expirado
  if (!nextPaymentDate) {
    return true;
  }

  // Verificar si la fecha de próximo pago ya pasó
  const paymentDate = new Date(nextPaymentDate);
  const currentDate = new Date();

  // Si la fecha de pago ya pasó, el plan está expirado
  return paymentDate <= currentDate;
}

/**
 * Verifica si el usuario tiene un plan activo válido
 * @param plan - Nombre del plan del usuario
 * @param nextPaymentDate - Fecha del próximo pago en formato ISO string
 * @returns true si el plan está activo, false si requiere renovación
 */
export function hasActivePlan(plan?: string, nextPaymentDate?: string): boolean {
  return !isPlanExpiredOrInactive(plan, nextPaymentDate);
}

/**
 * Obtiene el estado de suscripción del usuario basado en los datos de Cognito
 * @param userPlan - Plan del usuario desde Cognito
 * @param subscriptionData - Datos de suscripción desde DynamoDB
 * @returns objeto con el estado de la suscripción
 */
export function getSubscriptionStatus(userPlan?: string, subscriptionData?: { nextPaymentDate?: string }) {
  const nextPaymentDate = subscriptionData?.nextPaymentDate;
  const isExpired = isPlanExpiredOrInactive(userPlan, nextPaymentDate);
  const isActive = hasActivePlan(userPlan, nextPaymentDate);

  return {
    isExpired,
    isActive,
    plan: userPlan,
    nextPaymentDate,
    requiresCheckout: isExpired,
  };
}
