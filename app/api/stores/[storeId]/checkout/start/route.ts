import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { cartFetcher } from '@/renderer-engine/services/fetchers/cart-fetcher';
import { checkoutFetcher } from '@/renderer-engine/services/fetchers/checkout-fetcher';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'fasttify_cart_session_id';

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const corsHeaders = await getNextCorsHeaders(request);

  // Obtener el host original de la tienda para las redirecciones
  const storeHost =
    request.headers.get('origin') ||
    request.headers.get('referer')?.split('/')[0] + '//' + request.headers.get('referer')?.split('/')[2];

  try {
    const { storeId } = await params;

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
    const cart = await cartFetcher.getCart(storeId, sessionId);

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
    const checkoutResponse = await checkoutFetcher.startCheckout(
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
