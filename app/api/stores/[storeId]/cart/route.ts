import { getCookieOptions } from '@/lib/cookies/cookiesOption';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { logger } from '@/renderer-engine/lib/logger';
import { cacheManager, getCartCacheKey } from '@/renderer-engine/services/core/cache';
import { cacheInvalidationService } from '@/renderer-engine/services/core/cache/cache-invalidation-service';
import { cartFetcher } from '@/renderer-engine/services/fetchers/cart-fetcher';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const SESSION_ID_COOKIE_NAME = 'fasttify_cart_session_id';

interface RouteContext {
  params: Promise<{ storeId: string }>;
}

/**
 * GET /api/stores/[storeId]/cart
 * Obtiene el carrito actual para una tienda, incluyendo sus ítems.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const corsHeaders = await getNextCorsHeaders(request);
  const storeId = (await params).storeId;
  const cookiesStore = await cookies();

  let sessionId = cookiesStore.get(SESSION_ID_COOKIE_NAME)?.value;
  let newSessionIdGenerated = false;

  if (!sessionId) {
    sessionId = uuidv4();
    newSessionIdGenerated = true;
  }

  try {
    const cacheKey = getCartCacheKey(storeId, sessionId);
    const cached = cacheManager.getCached(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, cart: cached }, { headers: corsHeaders });
    }

    const cart = await cartFetcher.getCart(storeId, sessionId);
    const transformedCart = cartFetcher.transformCartToContext(cart);
    cacheManager.setCached(cacheKey, transformedCart, cacheManager.getDataTTL('cart'));

    const response = NextResponse.json({ success: true, cart: transformedCart }, { headers: corsHeaders });

    if (newSessionIdGenerated) {
      const cookieOptions = getCookieOptions();
      response.cookies.set(SESSION_ID_COOKIE_NAME, sessionId, cookieOptions);
    }

    return response;
  } catch (error) {
    logger.error('Error en GET /api/stores/[storeId]/cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve cart' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/stores/[storeId]/cart
 * Agrega un producto al carrito.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const corsHeaders = await getNextCorsHeaders(request);
  const storeId = (await params).storeId;
  const cookiesStore = await cookies();
  let sessionId = cookiesStore.get(SESSION_ID_COOKIE_NAME)?.value;
  let newSessionIdGenerated = false;

  if (!sessionId) {
    sessionId = uuidv4();
    newSessionIdGenerated = true;
  }

  try {
    const body = await request.json();
    const { productId, variantId, quantity } = body;

    if (!productId || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Missing productId or quantity' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cartResponse = await cartFetcher.addToCart({ storeId, productId, variantId, quantity, sessionId });

    if (cartResponse.success) {
      cacheInvalidationService.invalidateCache('cart_updated', storeId, sessionId);
    }

    const response = NextResponse.json(
      {
        success: cartResponse.success,
        cart: cartResponse.cart ? cartFetcher.transformCartToContext(cartResponse.cart) : undefined,
        error: cartResponse.error,
      },
      { headers: corsHeaders }
    );

    if (newSessionIdGenerated) {
      const cookieOptions = getCookieOptions();
      response.cookies.set(SESSION_ID_COOKIE_NAME, sessionId, cookieOptions);
    }

    return response;
  } catch (error) {
    logger.error('Error en POST /api/stores/[storeId]/cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add item to cart' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * PATCH /api/stores/[storeId]/cart
 * Actualiza la cantidad de un item en el carrito o lo elimina si la cantidad es <= 0.
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const corsHeaders = await getNextCorsHeaders(request);
  const storeId = (await params).storeId;
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

    if (cartResponse.success) {
      cacheInvalidationService.invalidateCache('cart_updated', storeId, sessionId);
    }

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
      const cookieOptions = getCookieOptions();
      response.cookies.set(SESSION_ID_COOKIE_NAME, sessionId, cookieOptions);
    }

    return response;
  } catch (error) {
    logger.error('Error en PATCH /api/stores/[storeId]/cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cart item' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * DELETE /api/stores/[storeId]/cart
 * Limpia completamente el carrito (elimina todos los ítems).
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const corsHeaders = await getNextCorsHeaders(request);
  const storeId = (await params).storeId;
  const cookiesStore = await cookies();
  let sessionId = cookiesStore.get(SESSION_ID_COOKIE_NAME)?.value;
  let newSessionIdGenerated = false;

  if (!sessionId) {
    sessionId = uuidv4();
    newSessionIdGenerated = true;
  }

  try {
    const cartResponse = await cartFetcher.clearCart(storeId, sessionId);

    if (cartResponse.success) {
      cacheInvalidationService.invalidateCache('cart_updated', storeId, sessionId);
    }

    const response = NextResponse.json(
      {
        success: cartResponse.success,
        cart: cartResponse.cart ? cartFetcher.transformCartToContext(cartResponse.cart) : undefined,
        error: cartResponse.error,
      },
      { headers: corsHeaders }
    );

    if (newSessionIdGenerated) {
      const cookieOptions = getCookieOptions();
      response.cookies.set(SESSION_ID_COOKIE_NAME, sessionId, cookieOptions);
    }

    return response;
  } catch (error) {
    logger.error('Error en DELETE /api/stores/[storeId]/cart:', error);
    return NextResponse.json({ success: false, error: 'Failed to clear cart' }, { status: 500, headers: corsHeaders });
  }
}
