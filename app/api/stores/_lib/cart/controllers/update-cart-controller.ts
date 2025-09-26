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
import { cartFetcher } from '@/renderer-engine/services/fetchers/cart';
import { getCartCookieOptions } from '@/lib/cookies/cookiesOption';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const SESSION_ID_COOKIE_NAME = 'fasttify_cart_session_id';

export async function updateCart(request: NextRequest, storeId: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  const cookiesStore = await cookies();
  let sessionId = cookiesStore.get(SESSION_ID_COOKIE_NAME)?.value;
  let newSessionIdGenerated = false;

  if (!sessionId) {
    sessionId = uuidv4();
    newSessionIdGenerated = true;
  }

  try {
    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || typeof quantity === 'undefined') {
      return NextResponse.json(
        { success: false, error: 'Missing itemId or quantity' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cartResponse = await cartFetcher.updateCartItem({ storeId, itemId, quantity, sessionId });

    const response = NextResponse.json(
      {
        success: cartResponse.success,
        cart: cartResponse.cart ? cartFetcher.transformCartToContext(cartResponse.cart) : undefined,
        error: cartResponse.error,
      },
      { headers: corsHeaders }
    );

    // Si getCart creó un nuevo sessionId, asegúrate de que se establezca la cookie
    if (newSessionIdGenerated) {
      const cookieOptions = getCartCookieOptions();
      response.cookies.set(SESSION_ID_COOKIE_NAME, sessionId, cookieOptions);
    }

    return response;
  } catch (error) {
    logger.error(`[Cart API] Error in PATCH /api/stores/${storeId}/cart:`, error, 'CartAPI');
    return NextResponse.json(
      { success: false, error: 'Failed to update cart item' },
      { status: 500, headers: corsHeaders }
    );
  }
}
