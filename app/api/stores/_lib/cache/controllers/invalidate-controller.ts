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
import { cacheInvalidationService, type ChangeType } from '@/liquid-forge/services/core/cache';

function errorResponse(code: number, message: string, corsHeaders: Record<string, string>) {
  return NextResponse.json({ error: { code, message } }, { status: code, headers: corsHeaders });
}

export async function postInvalidateCache(
  request: NextRequest,
  storeId: string,
  corsHeaders: Record<string, string>
): Promise<NextResponse> {
  try {
    const { changeType, entityId, entityIds } = await request.json();

    if (!changeType) {
      return errorResponse(400, 'changeType is required', corsHeaders);
    }

    // Validar que el changeType sea válido
    const validChangeTypes: ChangeType[] = [
      'product_created',
      'product_updated',
      'product_deleted',
      'collection_created',
      'collection_updated',
      'collection_deleted',
      'page_created',
      'page_updated',
      'page_deleted',
      'navigation_updated',
      'template_updated',
      'store_settings_updated',
      'domain_updated',
    ];

    if (!validChangeTypes.includes(changeType)) {
      return errorResponse(400, `Invalid changeType. Must be one of: ${validChangeTypes.join(', ')}`, corsHeaders);
    }

    // Invalidar caché usando el servicio inteligente
    if (entityIds && Array.isArray(entityIds)) {
      // Invalidación por lotes
      entityIds.forEach((id: string) => {
        cacheInvalidationService.invalidateCache(changeType as ChangeType, storeId, id);
      });
    } else {
      // Invalidación individual
      cacheInvalidationService.invalidateCache(changeType as ChangeType, storeId, entityId);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Cache invalidated successfully',
        changeType,
        storeId,
        entityId,
        entityIds,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Error invalidating cache:', error);
    return errorResponse(500, error?.message || 'Error invalidating cache', corsHeaders);
  }
}
