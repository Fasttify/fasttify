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

import { NextRequest, NextResponse } from 'next/server';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { logger } from '@/renderer-engine/lib/logger';
import { calculateOrderPricing } from '../services/pricing-calculation.service';

export interface PricingCalculationRequest {
  subtotal: number;
  shippingCost?: number;
  taxAmount?: number;
  compareAtPrice?: number;
  currency?: string;
}

export interface PricingCalculationResponse {
  success: boolean;
  pricing?: {
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
  };
  error?: string;
}

/**
 * Calcula el precio final de una orden incluyendo descuentos, envío e impuestos
 */
export async function calculateOrderPricingController(
  request: NextRequest,
  storeId: string
): Promise<NextResponse<PricingCalculationResponse>> {
  const corsHeaders = await getNextCorsHeaders(request);

  try {
    const body: PricingCalculationRequest = await request.json();

    // Validar datos requeridos
    if (typeof body.subtotal !== 'number' || body.subtotal < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Subtotal is required and must be a positive number',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Calcular precios usando el servicio
    const pricing = await calculateOrderPricing({
      subtotal: body.subtotal,
      shippingCost: body.shippingCost ?? 0,
      taxAmount: body.taxAmount ?? 0,
      compareAtPrice: body.compareAtPrice ?? 0,
      currency: body.currency ?? 'COP',
    });

    logger.info(`[Pricing API] Calculated pricing for store ${storeId}:`, pricing, 'PricingAPI');

    return NextResponse.json(
      {
        success: true,
        pricing,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    logger.error(`[Pricing API] Error in POST /api/stores/${storeId}/pricing:`, error, 'PricingAPI');

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate pricing',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
