import { NextRequest, NextResponse } from 'next/server'
import { handleAuthenticationMiddleware } from './middlewares/auth/auth'
import { handleStoreMiddleware } from './middlewares/store-access/store'
import { handleStoreAccessMiddleware } from './middlewares/store-access/storeAccess'
import { handleProductOwnershipMiddleware } from './middlewares/ownership/productOwnership'
import { handleAuthenticatedRedirectMiddleware } from './middlewares/auth/auth'
import { handleCollectionOwnershipMiddleware } from './middlewares/ownership/collectionOwnership'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const hostname = request.headers.get('host') || ''

  // Configuración de dominios
  const isProduction = process.env.NODE_ENV === 'production'

  // Detectar subdominios
  let subdomain = ''
  if (isProduction) {
    // En producción: verificar si hay un subdominio (ej: tienda.fasttify.com)
    const allowedDomains = ['fasttify.com', 'www.fasttify.com'];
    const parts = hostname.split('.');
    const domain = parts.slice(-2).join('.');
    if (parts.length > 2 && allowedDomains.includes(domain)) {
      subdomain = parts[0];
    }
  } else {
    // En desarrollo: usar el formato subdominio.localhost:3000 o localhost:3000
    if (hostname.includes('.localhost')) {
      subdomain = hostname.split('.')[0]
    }
  }

  // Si hay un subdominio y estamos en la raíz, reescribir a la ruta de la tienda
  if (subdomain && subdomain !== 'www' && path === '/') {
    // Reescribir la URL para mostrar la página de la tienda
    const url = request.nextUrl.clone()
    url.pathname = `/${subdomain}`
    return NextResponse.rewrite(url)
  }

  // Si hay un subdominio y la ruta no empieza con el subdominio, agregar el prefijo
  if (subdomain && subdomain !== 'www' && !path.startsWith(`/${subdomain}`)) {
    const url = request.nextUrl.clone()
    url.pathname = `/${subdomain}${path}`
    return NextResponse.rewrite(url)
  }

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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
