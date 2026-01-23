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
import { logger } from '@/liquid-forge';
import { trackVisitService } from '@/api/webhooks/_lib/track-visit/services/track-visit.service';
import { verifyAnalyticsWebhookJWTAuth } from '@/api/webhooks/_lib/middleware/jwt-auth.middleware';
import type { TrackVisitResponse } from '@/api/webhooks/_lib/track-visit/types/track-visit.types';

/**
 * Controlador para manejar tracking de visitas de tiendas
 */
export async function trackVisitController(request: NextRequest): Promise<NextResponse<TrackVisitResponse>> {
  const corsHeaders = await getNextCorsHeaders(request);

  // Verificar autenticación JWT
  const authResult = verifyAnalyticsWebhookJWTAuth(request);
  if (!authResult.isValid) {
    logger.warn(`[TrackVisit] JWT Authentication failed: ${authResult.error}`, 'TrackVisit');
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
    const rawData = await request.json();

    // Validar datos usando Zod
    const validation = trackVisitService.validateViewData(rawData);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const viewData = validation.data;
    if (!viewData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid view data after validation',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Procesar la visita con información de Cloudflare
    await trackVisitService.processStoreVisitWithCloudflare(viewData, request.headers as any);

    return NextResponse.json(
      {
        success: true,
        message: 'Store visit tracked successfully',
        storeId: viewData.storeId,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    logger.error('[TrackVisitController] Error processing store visit', error, 'TrackVisitController');

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process store visit',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
