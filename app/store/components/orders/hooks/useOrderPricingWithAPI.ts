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

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { IOrder } from '@/app/store/hooks/data/useOrders';
import type { ProcessedPricingData } from '../types/util-type';
import { usePricingCalculation } from '@/app/store/hooks/api/usePricingCalculation';
import useStoreDataStore from '@/context/core/storeDataStore';
import { useOrderFormatting } from '@/app/store/hooks/format/useOrderFormatting';

/**
 * Hook para calcular precios de órdenes usando la API del servidor
 * Mantiene fallback a cálculo local si hay errores
 */
export function useOrderPricingWithAPI(order: IOrder | null) {
  const { currentStore } = useStoreDataStore();
  const { loading: _loading, error, calculatePricing } = usePricingCalculation();
  const { formatOrderAmounts } = useOrderFormatting(order?.currency || undefined);

  const pricingInput = useMemo(
    () =>
      order
        ? {
            id: order.id,
            subtotal: order.subtotal ?? 0,
            shippingCost: order.shippingCost ?? 0,
            taxAmount: order.taxAmount ?? 0,
            compareAtPrice: order.compareAtPrice ?? 0,
            currency: order.currency ?? 'COP',
          }
        : null,
    [order]
  );

  const enabled = Boolean(currentStore?.storeId && pricingInput);

  const { data, isLoading } = useQuery({
    queryKey: [
      'pricing',
      currentStore?.storeId,
      pricingInput?.id,
      pricingInput
        ? {
            subtotal: pricingInput.subtotal,
            shippingCost: pricingInput.shippingCost,
            taxAmount: pricingInput.taxAmount,
            compareAtPrice: pricingInput.compareAtPrice,
            currency: pricingInput.currency,
          }
        : null,
    ],
    queryFn: () => calculatePricing(pricingInput as NonNullable<typeof pricingInput>, String(currentStore?.storeId)),
    enabled,
    staleTime: 60_000,
  });

  const apiPricingData: ProcessedPricingData | null = useMemo(() => {
    if (!data) return null;

    const {
      formattedSubtotal,
      formattedShippingCost,
      formattedTaxAmount,
      formattedTotalAmount,
      formattedCompareAtPrice,
      formattedSavingsAmount,
    } = formatOrderAmounts({
      subtotal: data.subtotal,
      shippingCost: data.shippingCost,
      taxAmount: data.taxAmount,
      totalAmount: data.totalAmount,
      compareAtPrice: data.compareAtPrice ?? 0,
      savingsAmount: data.savingsAmount,
    });

    return {
      subtotal: data.subtotal,
      shippingCost: data.shippingCost,
      taxAmount: data.taxAmount,
      totalAmount: data.totalAmount,
      currency: data.currency,
      compareAtPrice: data.compareAtPrice ?? 0,
      hasDiscount: data.hasDiscount,
      discountAmount: data.discountAmount,
      savingsAmount: data.savingsAmount,
      savingsPercentage: data.savingsPercentage,
      formattedSubtotal,
      formattedShippingCost,
      formattedTaxAmount,
      formattedTotalAmount,
      formattedCompareAtPrice,
      formattedSavingsAmount,
    };
  }, [data, formatOrderAmounts]);

  // Usar fallback SOLO si la API falla
  const fallbackPricingData = error && order ? calculateLocalPricing(order, formatOrderAmounts) : null;

  // Mientras la API carga, no mostrar cálculo local para evitar parpadeos
  if (isLoading && !apiPricingData && !fallbackPricingData) {
    return {
      pricingData: null,
      loading: true,
      error,
      usingAPI: false,
      usingFallback: false,
    };
  }

  return {
    pricingData: apiPricingData || fallbackPricingData,
    loading: isLoading,
    error,
    usingAPI: !!apiPricingData,
    usingFallback: !!fallbackPricingData,
  };
}

/**
 * Función helper para cálculo local de precios (fallback)
 */
function calculateLocalPricing(
  order: IOrder,
  formatOrderAmounts: ReturnType<typeof useOrderFormatting>['formatOrderAmounts']
): ProcessedPricingData {
  const {
    subtotal = 0,
    shippingCost = 0,
    taxAmount = 0,
    totalAmount = 0,
    currency = 'COP',
    compareAtPrice = 0,
  } = order;

  const hasDiscount = (compareAtPrice ?? 0) > 0 && (compareAtPrice ?? 0) > (subtotal ?? 0);
  const discountAmount = hasDiscount ? (compareAtPrice ?? 0) - (subtotal ?? 0) : 0;
  const savingsAmount = hasDiscount ? discountAmount : 0;
  const savingsPercentage =
    hasDiscount && (compareAtPrice ?? 0) > 0 ? Math.round((savingsAmount / (compareAtPrice ?? 1)) * 100) : 0;

  const {
    formattedSubtotal,
    formattedShippingCost,
    formattedTaxAmount,
    formattedTotalAmount,
    formattedCompareAtPrice,
    formattedSavingsAmount,
  } = formatOrderAmounts({
    subtotal: Number(subtotal) || 0,
    shippingCost: Number(shippingCost) || 0,
    taxAmount: Number(taxAmount) || 0,
    totalAmount: Number(totalAmount) || 0,
    compareAtPrice: Number(compareAtPrice) || 0,
    savingsAmount: Number(savingsAmount) || 0,
  });

  return {
    subtotal: Number(subtotal) || 0,
    shippingCost: Number(shippingCost) || 0,
    taxAmount: Number(taxAmount) || 0,
    totalAmount: Number(totalAmount) || 0,
    currency: currency || 'COP',
    compareAtPrice: Number(compareAtPrice) || 0,
    hasDiscount,
    discountAmount,
    savingsAmount,
    savingsPercentage,
    formattedSubtotal,
    formattedShippingCost,
    formattedTaxAmount,
    formattedTotalAmount,
    formattedCompareAtPrice,
    formattedSavingsAmount,
  };
}
