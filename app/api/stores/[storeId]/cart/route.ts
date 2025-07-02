import { NextResponse, NextRequest } from 'next/server';
import { dataFetcher } from '@/renderer-engine/services/fetchers/data-fetcher';
import { domainResolver } from '@/renderer-engine/services/core/domain-resolver';
import { logger } from '@/renderer-engine/lib/logger';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const host = request.headers.get('host');
    if (!host) {
      return NextResponse.json({ message: 'Host header is missing' }, { status: 400, headers: corsHeaders });
    }

    const store = await domainResolver.resolveStoreByDomain(host);
    if (!store) {
      return NextResponse.json({ message: 'Store not found' }, { status: 404, headers: corsHeaders });
    }

    const cart = await dataFetcher.getCart(store.storeId);
    const cartContext = dataFetcher.transformCartToContext(cart);

    return NextResponse.json(cartContext, { status: 200, headers: corsHeaders });
  } catch (error) {
    logger.error('Error in /api/cart GET', error, 'CartAPI');
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { message: 'Internal Server Error', error: errorMessage },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const host = request.headers.get('host');
    if (!host) {
      return NextResponse.json({ message: 'Host header is missing' }, { status: 400, headers: corsHeaders });
    }

    const store = await domainResolver.resolveStoreByDomain(host);
    if (!store) {
      return NextResponse.json({ message: 'Store not found' }, { status: 404, headers: corsHeaders });
    }

    const body = await request.json();
    const { productId, variantId, quantity, properties } = body;

    if (!productId || typeof quantity === 'undefined') {
      return NextResponse.json(
        { message: 'Missing required parameters: productId and quantity' },
        { status: 400, headers: corsHeaders }
      );
    }

    const result = await dataFetcher.addToCart({
      storeId: store.storeId,
      productId,
      variantId,
      quantity: Number(quantity),
      properties,
    });

    if (!result.success) {
      return NextResponse.json(
        { message: result.error || 'Failed to add item to cart' },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(result.cart, { status: 200, headers: corsHeaders });
  } catch (error) {
    logger.error('Error in /api/cart POST', error, 'CartAPI');
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { message: 'Internal Server Error', error: errorMessage },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const host = request.headers.get('host');
    if (!host) {
      return NextResponse.json({ message: 'Host header is missing' }, { status: 400, headers: corsHeaders });
    }

    const store = await domainResolver.resolveStoreByDomain(host);
    if (!store) {
      return NextResponse.json({ message: 'Store not found' }, { status: 404, headers: corsHeaders });
    }

    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || typeof quantity === 'undefined') {
      return NextResponse.json(
        { message: 'Missing required parameters: itemId and quantity' },
        { status: 400, headers: corsHeaders }
      );
    }

    const result = await dataFetcher.updateCartItem({
      storeId: store.storeId,
      itemId,
      quantity: Number(quantity),
    });

    if (!result.success) {
      return NextResponse.json(
        { message: result.error || 'Failed to update item' },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(result.cart, { status: 200, headers: corsHeaders });
  } catch (error) {
    logger.error('Error in /api/cart PATCH', error, 'CartAPI');
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { message: 'Internal Server Error', error: errorMessage },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const host = request.headers.get('host');
    if (!host) {
      return NextResponse.json({ message: 'Host header is missing' }, { status: 400, headers: corsHeaders });
    }

    const store = await domainResolver.resolveStoreByDomain(host);
    if (!store) {
      return NextResponse.json({ message: 'Store not found' }, { status: 404, headers: corsHeaders });
    }

    const result = await dataFetcher.clearCart(store.storeId);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error || 'Failed to clear cart' },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(result.cart, { status: 200, headers: corsHeaders });
  } catch (error) {
    logger.error('Error in /api/cart DELETE', error, 'CartAPI');
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { message: 'Internal Server Error', error: errorMessage },
      { status: 500, headers: corsHeaders }
    );
  }
}
