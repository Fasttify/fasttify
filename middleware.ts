import { NextRequest, NextResponse } from 'next/server'
import { handleAuthenticationMiddleware } from './middlewares/auth/auth'
import { handleSubscriptionMiddleware } from './middlewares/subscription/subscription'
import { handleStoreMiddleware } from './middlewares/store-access/store'
import { handleStoreAccessMiddleware } from './middlewares/store-access/storeAccess'
import { handleProductOwnershipMiddleware } from './middlewares/ownership/productOwnership'
import { handleAuthenticatedRedirectMiddleware } from './middlewares/auth/auth'
import { handleCollectionOwnershipMiddleware } from './middlewares/ownership/collectionOwnership'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Verificar propiedad de productos específicos
  if (
    path.match(/^\/store\/[^\/]+\/products\/[^\/]+$/) &&
    !path.includes('/products/inventory') &&
    !path.includes('/products/collections')
  ) {
    return handleProductOwnershipMiddleware(request)
  }
  // verificar propiedad de coleccione especifica
  if (
    path.match(/^\/store\/[^\/]+\/products\/collections\/[^\/]+$/) &&
    !path.includes('/collections/new')
  ) {
    return handleCollectionOwnershipMiddleware(request)
  }

  if (path.match(/^\/store\/[^\/]+/)) {
    // Proteger todas las rutas de tienda
    return handleStoreAccessMiddleware(request)
  }

  if (path === '/subscription-success') {
    return handleSubscriptionMiddleware(request, NextResponse.next())
  }

  if (path === '/account-settings') {
    return handleAuthenticationMiddleware(request, NextResponse.next())
  }

  if (['/first-steps', '/my-store'].includes(path)) {
    return handleStoreMiddleware(request, NextResponse.next())
  }
  if (path === '/login') {
    return handleAuthenticatedRedirectMiddleware(request, NextResponse.next())
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/subscription-success',
    '/account-settings',
    '/first-steps',
    '/my-store',
    '/login',
    '/store/:path*',
  ],
}
