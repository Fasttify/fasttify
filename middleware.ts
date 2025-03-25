import { NextRequest, NextResponse } from 'next/server'
import { handleAuthenticationMiddleware } from './middlewares/auth'
import { handleSubscriptionMiddleware } from './middlewares/subscription'
import { handleStoreMiddleware } from './middlewares/store'
import { handleStoreAccessMiddleware } from './middlewares/storeAccess'
import { handleProductOwnershipMiddleware } from './middlewares/productOwnership'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Verificar propiedad de productos específicos - Corregido el patrón de URL
  if (path.includes('/products/') && path.match(/\/products\/([^\/]+)/)) {
    return handleProductOwnershipMiddleware(request)
  }

  // Proteger todas las rutas de tienda
  if (path.match(/^\/store\/[^\/]+/)) {
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

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/subscription-success',
    '/account-settings',
    '/first-steps',
    '/my-store',
    '/store/:path*',
  ],
}
