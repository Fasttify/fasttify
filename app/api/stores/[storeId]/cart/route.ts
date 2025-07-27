import { getCartCookieOptions } from '@/lib/cookies/cookiesOption';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { logger } from '@/renderer-engine/lib/logger';
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
 * SIN CACHE - siempre fresco desde la base de datos.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const corsHeaders = await getNextCorsHeaders(request);
  const storeId = (await params).storeId;
  const cookiesStore = await cookies();

  let sessionId = cookiesStore.get(SESSION_ID_COOKIE_NAME)?.value;
  let newSessionIdGenerated = false;

  // Log para debugging en producción
  logger.info(`[Cart API] GET request - storeId: ${storeId}, sessionId: ${sessionId || 'NOT_FOUND'}`, null, 'CartAPI');

  if (!sessionId) {
    sessionId = uuidv4();
    newSessionIdGenerated = true;
    logger.info(`[Cart API] Generated new sessionId: ${sessionId}`, null, 'CartAPI');
  }

  try {
    logger.info(`[Cart API] Fetching fresh cart from database for sessionId: ${sessionId}`, null, 'CartAPI');

    const cart = await cartFetcher.getCart(storeId, sessionId);
    const transformedCart = cartFetcher.transformCartToContext(cart);

    logger.info(
      `[Cart API] Fresh cart data retrieved for sessionId: ${sessionId}, items: ${transformedCart?.item_count || 0}`,
      null,
      'CartAPI'
    );

    const response = NextResponse.json({ success: true, cart: transformedCart }, { headers: corsHeaders });

    if (newSessionIdGenerated) {
      const cookieOptions = getCartCookieOptions();
      response.cookies.set(SESSION_ID_COOKIE_NAME, sessionId, cookieOptions);
      logger.info(`[Cart API] Set new cookie for sessionId: ${sessionId}`, null, 'CartAPI');
    }

    return response;
  } catch (error) {
    logger.error(`[Cart API] Error in GET /api/stores/${storeId}/cart:`, error, 'CartAPI');
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

  logger.info(`[Cart API] POST request - storeId: ${storeId}, sessionId: ${sessionId || 'NOT_FOUND'}`, null, 'CartAPI');

  if (!sessionId) {
    sessionId = uuidv4();
    newSessionIdGenerated = true;
    logger.info(`[Cart API] Generated new sessionId for POST: ${sessionId}`, null, 'CartAPI');
  }

  try {
    const body = await request.json();
    const { productId, variantId, quantity, selectedAttributes } = body;

    logger.info(
      `[Cart API] Adding to cart - productId: ${productId}, variantId: ${variantId}, quantity: ${quantity}, selectedAttributes: ${JSON.stringify(selectedAttributes)}`,
      null,
      'CartAPI'
    );

    if (!productId || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Missing productId or quantity' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cartResponse = await cartFetcher.addToCart({
      storeId,
      productId,
      variantId,
      quantity,
      selectedAttributes,
      sessionId,
    });

    logger.info(`[Cart API] Item added to cart for sessionId: ${sessionId}`, null, 'CartAPI');

    const response = NextResponse.json(
      {
        success: cartResponse.success,
        cart: cartResponse.cart ? cartFetcher.transformCartToContext(cartResponse.cart) : undefined,
        error: cartResponse.error,
      },
      { headers: corsHeaders }
    );

    if (newSessionIdGenerated) {
      const cookieOptions = getCartCookieOptions();
      response.cookies.set(SESSION_ID_COOKIE_NAME, sessionId, cookieOptions);
      logger.info(`[Cart API] Set new cookie for POST sessionId: ${sessionId}`, null, 'CartAPI');
    }

    return response;
  } catch (error) {
    logger.error(`[Cart API] Error in POST /api/stores/${storeId}/cart:`, error, 'CartAPI');
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

  logger.info(
    `[Cart API] PATCH request - storeId: ${storeId}, sessionId: ${sessionId || 'NOT_FOUND'}`,
    null,
    'CartAPI'
  );

  if (!sessionId) {
    sessionId = uuidv4();
    newSessionIdGenerated = true;
    logger.info(`[Cart API] Generated new sessionId for PATCH: ${sessionId}`, null, 'CartAPI');
  }

  try {
    const body = await request.json();
    const { itemId, quantity } = body;

    logger.info(`[Cart API] Updating cart item - itemId: ${itemId}, quantity: ${quantity}`, null, 'CartAPI');

    if (!itemId || typeof quantity === 'undefined') {
      return NextResponse.json(
        { success: false, error: 'Missing itemId or quantity' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cartResponse = await cartFetcher.updateCartItem({ storeId, itemId, quantity, sessionId });

    logger.info(`[Cart API] Cart item updated for sessionId: ${sessionId}`, null, 'CartAPI');

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
      logger.info(`[Cart API] Set new cookie for PATCH sessionId: ${sessionId}`, null, 'CartAPI');
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

  logger.info(
    `[Cart API] DELETE request - storeId: ${storeId}, sessionId: ${sessionId || 'NOT_FOUND'}`,
    null,
    'CartAPI'
  );

  if (!sessionId) {
    sessionId = uuidv4();
    newSessionIdGenerated = true;
    logger.info(`[Cart API] Generated new sessionId for DELETE: ${sessionId}`, null, 'CartAPI');
  }

  try {
    const cartResponse = await cartFetcher.clearCart(storeId, sessionId);

    logger.info(`[Cart API] Cart cleared for sessionId: ${sessionId}`, null, 'CartAPI');

    const response = NextResponse.json(
      {
        success: cartResponse.success,
        cart: cartResponse.cart ? cartFetcher.transformCartToContext(cartResponse.cart) : undefined,
        error: cartResponse.error,
      },
      { headers: corsHeaders }
    );

    if (newSessionIdGenerated) {
      const cookieOptions = getCartCookieOptions();
      response.cookies.set(SESSION_ID_COOKIE_NAME, sessionId, cookieOptions);
      logger.info(`[Cart API] Set new cookie for DELETE sessionId: ${sessionId}`, null, 'CartAPI');
    }

    return response;
  } catch (error) {
    logger.error(`[Cart API] Error in DELETE /api/stores/${storeId}/cart:`, error, 'CartAPI');
    return NextResponse.json({ success: false, error: 'Failed to clear cart' }, { status: 500, headers: corsHeaders });
  }
}
