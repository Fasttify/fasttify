import { NextRequest, NextResponse } from 'next/server'
import { handleAuthenticationMiddleware } from '@/middlewares/auth/auth'
import { handleStoreMiddleware } from '@/middlewares/store-access/store'
import { handleStoreAccessMiddleware } from '@/middlewares/store-access/storeAccess'
import { handleProductOwnershipMiddleware } from '@/middlewares/ownership/productOwnership'
import { handleAuthenticatedRedirectMiddleware } from '@/middlewares/auth/auth'
import { handleCollectionOwnershipMiddleware } from '@/middlewares/ownership/collectionOwnership'
import { handlePagesOwnershipMiddleware } from '@/middlewares/ownership/pagesOwnership'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Primero verificar si hay un dominio original de CloudFront Multi-Tenant
  const xOriginalHost = request.headers.get('x-original-host')

  // Obtener el hostname real, priorizando x-original-host para dominios personalizados
  const hostname =
    xOriginalHost ||
    (request.headers.get('cf-connecting-ip')
      ? request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
      : request.headers.get('host') || '')

  // Configuración de dominios
  const isProduction = process.env.APP_ENV === 'production'

  // Detectar automáticamente el tipo de dominio basándose en la estructura
  const cleanHostnameForDetection = hostname.split(':')[0]
  const isFasttifyDomain =
    cleanHostnameForDetection === 'fasttify.com' ||
    cleanHostnameForDetection.endsWith('.fasttify.com')

  const allowedDomains = isFasttifyDomain
    ? ['fasttify.com']
    : isProduction
      ? ['fasttify.com']
      : ['localhost']

  const isMainDomain = allowedDomains.some(domain => {
    const cleanHostname = hostname.split(':')[0]
    return cleanHostname === domain || cleanHostname === `www.${domain}`
  })

  // Detectar subdominios solo si NO es el dominio principal
  if (!isMainDomain) {
    const extractSubdomain = (hostname: string, isProduction: boolean): string => {
      const cleanHostname = hostname.split(':')[0]
      const parts = cleanHostname.split('.')

      // Detectar automáticamente si es un dominio de fasttify.com
      const isFasttifyDomain =
        cleanHostname === 'fasttify.com' || cleanHostname.endsWith('.fasttify.com')

      if (isFasttifyDomain || isProduction) {
        // Lista blanca de dominios permitidos en producción
        const allowedDomains = ['fasttify.com']
        const domain = parts.slice(-2).join('.') // Obtener los últimos 2 segmentos (ej: fasttify.com)

        // Verificar si hay exactamente un subdominio y el dominio está en la lista blanca
        if (parts.length === 3 && allowedDomains.includes(domain)) {
          return parts[0]
        }
      } else {
        // Lista blanca de dominios permitidos en desarrollo
        const allowedDomains = ['localhost']
        const domain = parts[parts.length - 1] // Último segmento (ej: localhost)

        // Verificar si hay exactamente un subdominio y el dominio está en la lista blanca
        if (parts.length === 2 && allowedDomains.includes(domain)) {
          return parts[0]
        }
      }
      return ''
    }
    const subdomain = extractSubdomain(hostname, isProduction)

    // Reescribir URLs basadas en subdominios
    if (subdomain && subdomain !== 'www') {
      // NO reescribir rutas de assets - dejar que la API las maneje
      if (path.startsWith('/assets/')) {
        return NextResponse.next()
      }

      const url = request.nextUrl.clone()
      if (path === '/') {
        // Si estamos en la raíz, reescribir a la ruta de la tienda
        url.pathname = `/${subdomain}`
      } else if (!path.startsWith(`/${subdomain}`)) {
        // Si la ruta no empieza con el subdominio, agregar el prefijo y pasar el path original
        url.pathname = `/${subdomain}`
        url.searchParams.set('path', path)
      } else {
        // La ruta ya tiene el prefijo correcto
        return NextResponse.next()
      }
      return NextResponse.rewrite(url)
    }

    // Manejar dominios personalizados (que no son subdominios de fasttify.com)
    const cleanHostname = hostname.split(':')[0]

    // Validación segura para detectar dominios personalizados
    const isFasttifyDomain =
      cleanHostname === 'fasttify.com' || cleanHostname.endsWith('.fasttify.com')
    const isLocalhost =
      cleanHostname === 'localhost' || cleanHostname.startsWith('localhost:')

    if (!isFasttifyDomain && !isLocalhost) {
      // Es un dominio personalizado
      // NO reescribir rutas de assets - dejar que la API las maneje
      if (path.startsWith('/assets/')) {
        return NextResponse.next()
      }

      const url = request.nextUrl.clone()

      // Para dominios personalizados, usar el dominio completo como identificador
      url.pathname = `/${cleanHostname}`
      if (path !== '/') {
        url.searchParams.set('path', path)
      }

      return NextResponse.rewrite(url)
    }
  }

  // Verificar propiedad de productos específicos
  if (
    path.match(/^\/store\/[^\/]+\/products\/[^\/]+$/) &&
    !path.includes('/products/inventory') &&
    !path.includes('/products/collections')
  ) {
    return handleProductOwnershipMiddleware(request)
  }

  if (path.match(/^\/store\/[^\/]+\/setup\/pages\/[^\/]+$/)) {
    return handlePagesOwnershipMiddleware(request)
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
