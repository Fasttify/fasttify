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
import { dataFetcher } from '@/liquid-forge';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'fasttify_cart_session_id';

export async function startCheckout(request: NextRequest, storeId: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);

  // Obtener el host original de la tienda para las redirecciones
  const storeHost =
    request.headers.get('origin') ||
    request.headers.get('referer')?.split('/')[0] + '//' + request.headers.get('referer')?.split('/')[2];

  try {
    // Obtener sessionId del formulario o cookies
    const formData = await request.formData();
    let sessionId = formData.get('session_id') as string;

    // Fallback a cookies si no viene en el formulario
    if (!sessionId) {
      const cookiesStore = await cookies();
      sessionId = cookiesStore.get(SESSION_COOKIE)?.value || '';
    }

    if (!sessionId) {
      const referer = request.headers.get('referer') || `${storeHost}/cart`;
      return NextResponse.redirect(referer + '?error=no_session', { status: 303, headers: corsHeaders });
    }

    // Obtener el carrito actual
    const cart = await dataFetcher.getCart(storeId, sessionId);

    if (!cart || !cart.items || cart.items.length === 0) {
      const referer = request.headers.get('referer') || `${storeHost}/cart`;
      return NextResponse.redirect(referer + '?error=empty_cart', { status: 303, headers: corsHeaders });
    }

    console.log('Cart found for checkout:', {
      cartId: cart.id,
      itemCount: cart.items?.length || 0,
      sessionId: sessionId,
    });

    // Iniciar sesión de checkout
    const checkoutResponse = await dataFetcher.startCheckout(
      {
        storeId,
        sessionId,
        cartId: cart.id,
      },
      cart
    );

    if (!checkoutResponse.success || !checkoutResponse.session?.token) {
      const referer = request.headers.get('referer') || `${storeHost}/cart`;
      return NextResponse.redirect(referer + '?error=checkout_failed', { status: 303, headers: corsHeaders });
    }

    // Redirigir a la página de checkout con el token en el dominio de la tienda
    const checkoutUrl = `${storeHost}/checkouts/cn/${checkoutResponse.session.token}`;
    return NextResponse.redirect(checkoutUrl, { status: 303, headers: corsHeaders });
  } catch (error) {
    console.error('Error starting checkout:', error);
    const referer = request.headers.get('referer') || `${storeHost}/cart`;
    return NextResponse.redirect(referer + '?error=checkout_error', { status: 303, headers: corsHeaders });
  }
}
