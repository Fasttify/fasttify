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

export interface PricingCalculationInput {
  subtotal: number;
  shippingCost?: number;
  taxAmount?: number;
  compareAtPrice?: number;
  currency?: string;
}

export interface PricingCalculationResult {
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  compareAtPrice?: number;
  hasDiscount: boolean;
  discountAmount: number;
  savingsAmount: number;
  savingsPercentage: number;
}

/**
 * Servicio para calcular precios de órdenes
 * Centraliza toda la lógica de cálculo de precios, descuentos e impuestos
 */
export class PricingCalculationService {
  /**
   * Calcula el precio final de una orden
   */
  async calculateOrderPricing(input: PricingCalculationInput): Promise<PricingCalculationResult> {
    const { subtotal = 0, shippingCost = 0, taxAmount = 0, compareAtPrice = 0, currency = 'COP' } = input;

    // Validar que el subtotal sea válido
    if (subtotal < 0) {
      throw new Error('Subtotal cannot be negative');
    }

    // Calcular descuentos basados en compareAtPrice vs subtotal
    const hasDiscount = compareAtPrice > 0 && compareAtPrice > subtotal;
    const discountAmount = hasDiscount ? compareAtPrice - subtotal : 0;

    // Calcular el ahorro total
    const savingsAmount = discountAmount;
    const savingsPercentage =
      hasDiscount && compareAtPrice > 0 ? Math.round((savingsAmount / compareAtPrice) * 100) : 0;

    // Calcular el total final
    const totalAmount = subtotal + shippingCost + taxAmount;

    return {
      subtotal,
      shippingCost,
      taxAmount,
      totalAmount,
      currency,
      compareAtPrice: compareAtPrice > 0 ? compareAtPrice : undefined,
      hasDiscount,
      discountAmount,
      savingsAmount,
      savingsPercentage,
    };
  }

  /**
   * Calcula precios para múltiples órdenes
   */
  async calculateMultipleOrderPricing(inputs: PricingCalculationInput[]): Promise<PricingCalculationResult[]> {
    const results = await Promise.all(inputs.map((input) => this.calculateOrderPricing(input)));

    return results;
  }

  /**
   * Valida si los datos de entrada son válidos
   */
  validatePricingInput(input: PricingCalculationInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof input.subtotal !== 'number' || input.subtotal < 0) {
      errors.push('Subtotal must be a non-negative number');
    }

    if (input.shippingCost !== undefined && (typeof input.shippingCost !== 'number' || input.shippingCost < 0)) {
      errors.push('Shipping cost must be a non-negative number');
    }

    if (input.taxAmount !== undefined && (typeof input.taxAmount !== 'number' || input.taxAmount < 0)) {
      errors.push('Tax amount must be a non-negative number');
    }

    if (input.compareAtPrice !== undefined && (typeof input.compareAtPrice !== 'number' || input.compareAtPrice < 0)) {
      errors.push('Compare at price must be a non-negative number');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Instancia singleton del servicio
export const pricingCalculationService = new PricingCalculationService();

/**
 * Función helper para usar el servicio
 */
export async function calculateOrderPricing(input: PricingCalculationInput): Promise<PricingCalculationResult> {
  return pricingCalculationService.calculateOrderPricing(input);
}
