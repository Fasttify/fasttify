import { handleAuthenticatedRedirectMiddleware, handleAuthenticationMiddleware } from '@/middlewares/auth/auth';
import { handleDomainRouting, analyzeDomain } from '@/middlewares/domain-handling/domainHandler';
import { handleCollectionOwnershipMiddleware } from '@/middlewares/ownership/collectionOwnership';
import { handlePagesOwnershipMiddleware } from '@/middlewares/ownership/pagesOwnership';
import { handleProductOwnershipMiddleware } from '@/middlewares/ownership/productOwnership';
import { handleStoreMiddleware } from '@/middlewares/store-access/store';
import { handleStoreAccessMiddleware } from '@/middlewares/store-access/storeAccess';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Bloquear acceso directo a /orders si no se está usando el subdominio orders
  if (path.startsWith('/orders')) {
    const domainAnalysis = analyzeDomain(request);
    if (domainAnalysis.subdomain !== 'orders') {
      // Redirigir a 404 o página principal
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Manejar el enrutamiento basado en dominios (subdominios y dominios personalizados)
  const domainResponse = handleDomainRouting(request);
  if (domainResponse) {
    return domainResponse;
  }

  // Verificar propiedad de productos específicos
  if (
    path.match(/^\/store\/[^\/]+\/products\/[^\/]+$/) &&
    !path.includes('/products/inventory') &&
    !path.includes('/products/collections')
  ) {
    return handleProductOwnershipMiddleware(request);
  }

  if (path.match(/^\/store\/[^\/]+\/setup\/pages\/[^\/]+$/)) {
    return handlePagesOwnershipMiddleware(request);
  }

  // verificar propiedad de coleccione especifica
  if (path.match(/^\/store\/[^\/]+\/products\/collections\/[^\/]+$/) && !path.includes('/collections/new')) {
    return handleCollectionOwnershipMiddleware(request);
  }

  if (path.match(/^\/store\/[^\/]+/)) {
    // Proteger todas las rutas de tienda
    return handleStoreAccessMiddleware(request);
  }

  if (path === '/account-settings') {
    return handleAuthenticationMiddleware(request, NextResponse.next());
  }

  if (['/first-steps', '/my-store'].includes(path)) {
    return handleStoreMiddleware(request, NextResponse.next());
  }
  if (path === '/login') {
    return handleAuthenticatedRedirectMiddleware(request, NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons).*)'],
};
