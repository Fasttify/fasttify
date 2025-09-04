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

import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { cacheInvalidationService, type ChangeType } from '@/renderer-engine/services/core/cache';
import { AuthGetCurrentUserServer, cookiesClient } from '@/utils/client/AmplifyUtils';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const corsHeaders = await getNextCorsHeaders(request);
  const session = await AuthGetCurrentUserServer();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }
  const { storeId } = await params;
  const { data: userStore } = await cookiesClient.models.UserStore.get({
    storeId,
  });
  if (!userStore) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404, headers: corsHeaders });
  }
  if (userStore.userId !== session.username) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders });
  }

  try {
    const { changeType, entityId, entityIds } = await request.json();

    if (!changeType) {
      return NextResponse.json({ error: 'changeType is required' }, { status: 400, headers: corsHeaders });
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
      return NextResponse.json(
        { error: `Invalid changeType. Must be one of: ${validChangeTypes.join(', ')}` },
        { status: 400, headers: corsHeaders }
      );
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
  } catch (error) {
    console.error('Error invalidating cache:', error);
    return NextResponse.json({ error: 'Error invalidating cache' }, { status: 500, headers: corsHeaders });
  }
}
