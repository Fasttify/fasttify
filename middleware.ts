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

  const allowedDomains = isProduction ? ['fasttify.com'] : ['localhost']
  const isValidHostname = allowedDomains.some(
    domain => hostname === domain || hostname.endsWith(`.${domain}`)
  )

  // Si el hostname es válido, redirigir a la landing

  if (isValidHostname) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Detectar subdominios
  const extractSubdomain = (hostname: string, isProduction: boolean): string => {
    const cleanHostname = hostname.split(':')[0] // Remove port if present
    const parts = cleanHostname.split('.')
    if (isProduction) {
      // En producción: verificar si hay un subdominio (ej: tienda.fasttify.com)
      if (parts.length > 2 && cleanHostname.endsWith('fasttify.com')) {
        return parts[0]
      }
    } else {
      // En desarrollo: usar el formato subdominio.localhost:3000
      if (parts.length > 1 && cleanHostname.endsWith('localhost')) {
        return parts[0]
      }
    }
    return ''
  }
  const subdomain = extractSubdomain(hostname, isProduction)

  // Reescribir URLs basadas en subdominios
  if (subdomain && subdomain !== 'www') {
    const url = request.nextUrl.clone()
    if (path === '/') {
      // Si estamos en la raíz, reescribir a la ruta de la tienda
      url.pathname = `/${subdomain}`
    } else if (!path.startsWith(`/${subdomain}`)) {
      // Si la ruta no empieza con el subdominio, agregar el prefijo
      url.pathname = `/${subdomain}${path}`
    } else {
      // La ruta ya tiene el prefijo correcto
      return NextResponse.next()
    }
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
