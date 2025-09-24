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

import { useState, useCallback } from 'react';

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

export interface UsePricingCalculationReturn {
  pricing: PricingCalculationResult | null;
  loading: boolean;
  error: string | null;
  calculatePricing: (input: PricingCalculationInput, storeId: string) => Promise<PricingCalculationResult | null>;
  clearError: () => void;
}

/**
 * Hook para calcular precios de órdenes usando la API del servidor
 */
export function usePricingCalculation(): UsePricingCalculationReturn {
  const [pricing, setPricing] = useState<PricingCalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatePricing = useCallback(
    async (input: PricingCalculationInput, storeId: string): Promise<PricingCalculationResult | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/stores/${storeId}/pricing`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to calculate pricing');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to calculate pricing');
        }

        setPricing(data.pricing);
        return data.pricing;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        console.error('Error calculating pricing:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    pricing,
    loading,
    error,
    calculatePricing,
    clearError,
  };
}
