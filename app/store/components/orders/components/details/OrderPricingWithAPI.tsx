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

import { memo } from 'react';
import type { IOrder } from '@/app/store/hooks/data/useOrders';
import { useOrderPricingWithAPI } from '../../hooks/useOrderPricingWithAPI';
import { OrderPricingOptimized } from './OrderPricingOptimized';
import type { ProcessedPricingData } from '../../types/util-type';

interface OrderPricingWithAPIProps {
  order: IOrder;
}

/**
 * Componente wrapper que integra la API de cálculo de precios
 * con el componente OrderPricingOptimized existente
 */
export const OrderPricingWithAPI = memo(function OrderPricingWithAPI({ order }: OrderPricingWithAPIProps) {
  const { pricingData, loading, error } = useOrderPricingWithAPI(order);
  const isLoading = loading || !pricingData;

  const loadingPricingData: ProcessedPricingData = {
    subtotal: 0,
    shippingCost: 0,
    taxAmount: 0,
    totalAmount: 0,
    currency: order.currency || 'COP',
    compareAtPrice: 0,
    hasDiscount: false,
    discountAmount: 0,
    savingsAmount: 0,
    savingsPercentage: 0,
    formattedSubtotal: '',
    formattedShippingCost: '',
    formattedTaxAmount: '',
    formattedTotalAmount: '',
    formattedCompareAtPrice: '',
    formattedSavingsAmount: '',
  };

  return <OrderPricingOptimized pricingData={pricingData ?? loadingPricingData} loading={isLoading} error={error} />;
});
