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
import { cacheManager, getSearchProductsCacheKey, searchProductsByTerm } from '@/liquid-forge';

export async function searchProducts(request: NextRequest, storeId: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
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
  } catch (_error) {
    return NextResponse.json({ error: 'Internal error searching products.' }, { status: 500, headers: corsHeaders });
  }
}
