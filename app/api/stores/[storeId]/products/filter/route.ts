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
import { filterProducts } from '@/api/stores/_lib/products/controllers/filter-products-controller';

/**
 * API Route para filtrar productos de forma eficiente
 * GET /api/stores/[storeId]/products/filter
 *
 * Query Parameters:
 * - price_min: número mínimo de precio
 * - price_max: número máximo de precio
 * - category: categoría específica
 * - availability: 'in_stock' para solo productos disponibles
 * - featured: 'true' para productos destacados
 * - sort_by: criterio de ordenamiento (price, name, created, etc.)
 * - nextToken: token para paginación (opcional)
 * - limit: productos por página (default: 20)
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  return filterProducts(request, storeId);
}

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  return new Response(null, { status: 204, headers: corsHeaders });
}
