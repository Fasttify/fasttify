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

import { NextRequest } from 'next/server';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { getCart } from '@/api/stores/_lib/cart/controllers/get-cart-controller';
import { addToCart } from '@/api/stores/_lib/cart/controllers/add-to-cart-controller';
import { updateCart } from '@/api/stores/_lib/cart/controllers/update-cart-controller';
import { clearCart } from '@/api/stores/_lib/cart/controllers/clear-cart-controller';

interface RouteContext {
  params: Promise<{ storeId: string }>;
}

/**
 * GET /api/stores/[storeId]/cart
 * Obtiene el carrito actual para una tienda, incluyendo sus ítems.
 * SIN CACHE - siempre fresco desde la base de datos.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const storeId = (await params).storeId;
  return getCart(request, storeId);
}

/**
 * POST /api/stores/[storeId]/cart
 * Agrega un producto al carrito.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const storeId = (await params).storeId;
  return addToCart(request, storeId);
}

/**
 * PATCH /api/stores/[storeId]/cart
 * Actualiza la cantidad de un item en el carrito o lo elimina si la cantidad es <= 0.
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const storeId = (await params).storeId;
  return updateCart(request, storeId);
}

/**
 * DELETE /api/stores/[storeId]/cart
 * Limpia completamente el carrito (elimina todos los ítems).
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const storeId = (await params).storeId;
  return clearCart(request, storeId);
}

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  return new Response(null, { status: 204, headers: corsHeaders });
}
