import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { cacheInvalidationService, type ChangeType } from '@/renderer-engine/services/core/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const corsHeaders = await getNextCorsHeaders(request);

  try {
    const { changeType, entityId } = await request.json();

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
    cacheInvalidationService.invalidateCache(changeType as ChangeType, storeId, entityId);

    return NextResponse.json(
      {
        success: true,
        message: 'Cache invalidated successfully',
        changeType,
        storeId,
        entityId,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error invalidating cache:', error);
    return NextResponse.json({ error: 'Error invalidating cache' }, { status: 500, headers: corsHeaders });
  }
}
