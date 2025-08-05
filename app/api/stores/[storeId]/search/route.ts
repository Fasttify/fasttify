import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { cacheManager, getSearchProductsCacheKey } from '@/renderer-engine/services/core/cache';
import { dataTransformer } from '@/renderer-engine/services/core/data-transformer';
import { searchProductsByTerm } from '@/renderer-engine/services/page/data-loader/search/search-data-loader';
import { NextRequest, NextResponse } from 'next/server';
export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const corsHeaders = await getNextCorsHeaders(request);
  const { storeId } = await params;
  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q')?.trim();
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  if (!storeId || !q) {
    return NextResponse.json({ error: 'Parameters required: storeId and q' }, { status: 400, headers: corsHeaders });
  }

  try {
    const cacheKey = getSearchProductsCacheKey(storeId, q, limit);
    const cached = cacheManager.getCached(cacheKey);

    if (cached) {
      return NextResponse.json(cached, { headers: corsHeaders });
    }

    const products = await searchProductsByTerm(storeId, q, limit);

    const simplifiedProducts = products.map((product) => ({
      id: product.id,
      title: product.title || product.name,
      price: product.price,
      featured_image: product.featured_image,
      url: product.url,
      variants: product.variants,
      attributes: product.attributes,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      status: product.status,
      category: product.category,
      description: product.description,
      compare_at_price: product.compare_at_price,
      quantity: product.quantity,
      slug: product.slug,
      images: product.images,
      storeId: product.storeId,
    }));

    cacheManager.setCached(cacheKey, { products: simplifiedProducts }, cacheManager.getDataTTL('search'));

    return NextResponse.json({ products: simplifiedProducts }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error searching products.' }, { status: 500, headers: corsHeaders });
  }
}
