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
import { logger } from '@/liquid-forge/lib/logger';
import { analyticsUpdateService } from '@/api/webhooks/_lib/analytics/services/analytics-update.service';
import { verifyAnalyticsWebhookJWTAuth } from '@/app/api/webhooks/_lib/middleware/jwt-auth.middleware';
import type { AnalyticsWebhookResponse } from '@/api/webhooks/_lib/analytics/types/analytics-webhook.types';

/**
 * Controlador para manejar webhooks de analíticas
 * Procesa eventos del motor y actualiza las métricas en tiempo real
 */
export async function analyticsWebhookController(
  request: NextRequest
): Promise<NextResponse<AnalyticsWebhookResponse>> {
  const corsHeaders = await getNextCorsHeaders(request);

  // Verificar autenticación JWT
  const authResult = verifyAnalyticsWebhookJWTAuth(request);
  if (!authResult.isValid) {
    logger.warn(`[Analytics Webhook] JWT Authentication failed: ${authResult.error}`, 'AnalyticsWebhook');
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication failed',
        message: authResult.error,
      },
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    const rawEvent = await request.json();

    // Validar datos usando Zod
    const validation = analyticsUpdateService.validateWebhookEvent(rawEvent);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const event = validation.data;

    // Procesar evento según su tipo
    switch (event.type) {
      case 'ORDER_CREATED':
        await analyticsUpdateService.updateOrderMetrics(event.storeId, event.data);

        break;

      case 'ORDER_CANCELLED':
        await analyticsUpdateService.updateOrderCancelledMetrics(event.storeId, event.data);

        break;

      case 'ORDER_REFUNDED':
        await analyticsUpdateService.updateOrderRefundedMetrics(event.storeId, event.data);

        break;

      case 'INVENTORY_LOW':
        await analyticsUpdateService.updateInventoryLowMetrics(event.storeId, event.data);

        break;

      case 'INVENTORY_OUT':
        await analyticsUpdateService.updateInventoryOutMetrics(event.storeId, event.data);

        break;

      case 'NEW_CUSTOMER':
        await analyticsUpdateService.updateNewCustomerMetrics(event.storeId, event.data);

        break;

      case 'CUSTOMER_LOGIN':
        await analyticsUpdateService.updateCustomerLoginMetrics(event.storeId, event.data);

        break;

      case 'STORE_VIEW':
        await analyticsUpdateService.updateStoreViewMetrics(event.storeId, event.data);

        break;

      default:
        logger.warn(`[Analytics Webhook] Unknown event type: ${event.type}`, 'AnalyticsWebhook');
        return NextResponse.json(
          {
            success: false,
            error: `Unknown event type: ${event.type}`,
          },
          { status: 400, headers: corsHeaders }
        );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Event ${event.type} processed successfully`,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    logger.error('[Analytics Webhook] Error processing webhook:', error, 'AnalyticsWebhook');

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process analytics webhook',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
