import {
  handleAuthenticatedRedirectMiddleware,
  handleAuthenticationMiddlewareNoRefresh,
} from '@/middlewares/auth/auth';
import { handleDomainRouting, analyzeDomain } from '@/middlewares/domain-handling/domainHandler';
import { handleCollectionOwnershipMiddleware } from '@/middlewares/ownership/collectionOwnership';
import { handlePagesOwnershipMiddleware } from '@/middlewares/ownership/pagesOwnership';
import { handleProductOwnershipMiddleware } from '@/middlewares/ownership/productOwnership';
import { handleStoreMiddleware } from '@/middlewares/store-access/store';
import { handleStoreAccessMiddleware } from '@/middlewares/store-access/storeAccess';
import { setLastVisitedStore } from '@/lib/cookies/last-store';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Constantes para rutas protegidas del sistema
 */
const PROTECTED_ROUTES = {
  /** Ruta de callback OAuth */
  OAUTH_CALLBACK: '/auth/callback',
  /** Rutas de órdenes */
  ORDERS: '/orders',
  /** Configuración de cuenta */
  ACCOUNT_SETTINGS: '/account-settings',
  /** Pasos iniciales de configuración */
  FIRST_STEPS: '/first-steps',
  /** Página de selección de tienda */
  MY_STORE: '/my-store',
  /** Página de inicio de sesión */
  LOGIN: '/login',
  /** Página de precios */
  PRICING: '/pricing',
  /** Página principal */
  HOME: '/',
} as const;

/**
 * Parámetros OAuth requeridos para el callback
 */
const OAUTH_REQUIRED_PARAMS = {
  CODE: 'code',
  STATE: 'state',
} as const;

/**
 * Patrones regex para identificar tipos de rutas
 */
const ROUTE_PATTERNS = {
  /** Patrón para rutas de productos específicos */
  STORE_PRODUCT: /^\/store\/[^\/]+\/products\/[^\/]+$/,
  /** Patrón para rutas de páginas específicas */
  STORE_PAGES: /^\/store\/[^\/]+\/setup\/pages\/[^\/]+$/,
  /** Patrón para rutas de colecciones específicas */
  STORE_COLLECTION: /^\/store\/[^\/]+\/products\/collections\/[^\/]+$/,
  /** Patrón para cualquier ruta de tienda */
  STORE_ANY: /^\/store\/[^\/]+/,
  /** Patrón para extraer ID de tienda de la ruta */
  STORE_ID_EXTRACT: /\/store\/([^\/]+)/,
} as const;

/**
 * Rutas excluidas para ciertas validaciones
 */
const EXCLUDED_SUBROUTES = {
  /** Subrutas excluidas para productos */
  PRODUCT_INVENTORY: '/products/inventory',
  PRODUCT_COLLECTIONS: '/products/collections',
  /** Subrutas excluidas para colecciones */
  COLLECTION_NEW: '/collections/new',
} as const;

/**
 * Subdominios especiales del sistema
 */
const SYSTEM_SUBDOMAINS = {
  ORDERS: 'orders',
} as const;

/**
 * Rutas que requieren autenticación sin refresh
 */
const AUTHENTICATED_ROUTES = ['/first-steps', '/my-store'] as const;

/**
 * Tipo para handlers de middleware que siguen el patrón Chain of Responsibility
 */
type MiddlewareHandler = (
  request: NextRequest,
  next: () => Promise<NextResponse | null>
) => Promise<NextResponse | null>;

/**
 * Valida si una URL contiene los parámetros OAuth requeridos
 * @param url - URL a validar
 * @returns true si contiene todos los parámetros requeridos
 */
function isValidOAuthCallback(url: URL): boolean {
  return url.searchParams.has(OAUTH_REQUIRED_PARAMS.CODE) && url.searchParams.has(OAUTH_REQUIRED_PARAMS.STATE);
}

/**
 * Verifica si la ruta actual corresponde a órdenes
 * @param pathname - Ruta actual
 * @returns true si es una ruta de órdenes
 */
function isOrdersRoute(pathname: string): boolean {
  return pathname.startsWith(PROTECTED_ROUTES.ORDERS);
}

/**
 * Determina si se debe bloquear el acceso directo a rutas de órdenes
 * @param pathname - Ruta actual
 * @param subdomain - Subdominio de la petición
 * @returns true si se debe bloquear el acceso
 */
function shouldBlockOrdersAccess(pathname: string, subdomain: string): boolean {
  return isOrdersRoute(pathname) && subdomain !== SYSTEM_SUBDOMAINS.ORDERS;
}

/**
 * Extrae la coincidencia de una ruta de producto específico
 * @param pathname - Ruta a verificar
 * @returns Array de coincidencias regex o null
 */
function matchStoreProductRoute(pathname: string): RegExpMatchArray | null {
  return pathname.match(ROUTE_PATTERNS.STORE_PRODUCT);
}

/**
 * Extrae la coincidencia de una ruta de página específica
 * @param pathname - Ruta a verificar
 * @returns Array de coincidencias regex o null
 */
function matchStorePagesRoute(pathname: string): RegExpMatchArray | null {
  return pathname.match(ROUTE_PATTERNS.STORE_PAGES);
}

/**
 * Extrae la coincidencia de una ruta de colección específica
 * @param pathname - Ruta a verificar
 * @returns Array de coincidencias regex o null
 */
function matchStoreCollectionRoute(pathname: string): RegExpMatchArray | null {
  return pathname.match(ROUTE_PATTERNS.STORE_COLLECTION);
}

/**
 * Extrae la coincidencia de cualquier ruta de tienda
 * @param pathname - Ruta a verificar
 * @returns Array de coincidencias regex o null
 */
function matchStoreRoute(pathname: string): RegExpMatchArray | null {
  return pathname.match(ROUTE_PATTERNS.STORE_ANY);
}

/**
 * Extrae el ID de la tienda de una ruta
 * @param pathname - Ruta que contiene el ID de tienda
 * @returns ID de la tienda o null si no se encuentra
 */
function extractStoreId(pathname: string): string | null {
  const match = pathname.match(ROUTE_PATTERNS.STORE_ID_EXTRACT);
  return match ? match[1] : null;
}

/**
 * Verifica si una ruta de producto debe ser excluida de la validación
 * @param pathname - Ruta a verificar
 * @returns true si debe ser excluida
 */
function shouldExcludeProductRoute(pathname: string): boolean {
  return (
    pathname.includes(EXCLUDED_SUBROUTES.PRODUCT_INVENTORY) || pathname.includes(EXCLUDED_SUBROUTES.PRODUCT_COLLECTIONS)
  );
}

/**
 * Verifica si una ruta de colección debe ser excluida de la validación
 * @param pathname - Ruta a verificar
 * @returns true si debe ser excluida
 */
function shouldExcludeCollectionRoute(pathname: string): boolean {
  return pathname.includes(EXCLUDED_SUBROUTES.COLLECTION_NEW);
}

/**
 * Determina si una respuesta indica que se debe guardar la última tienda visitada
 * @param response - Respuesta del middleware
 * @returns true si se debe guardar la última tienda
 */
function shouldSaveLastStore(response: NextResponse): boolean {
  return response && !response.headers.get('location');
}

/**
 * Handler para proteger la ruta de callback OAuth
 * @param request - Petición entrante
 * @param next - Función para continuar con el siguiente handler
 * @returns Respuesta de redirección o null para continuar
 */
async function handleOAuthProtection(
  request: NextRequest,
  next: () => Promise<NextResponse | null>
): Promise<NextResponse | null> {
  if (request.nextUrl.pathname === PROTECTED_ROUTES.OAUTH_CALLBACK) {
    if (!isValidOAuthCallback(request.nextUrl)) {
      return NextResponse.redirect(new URL(PROTECTED_ROUTES.LOGIN, request.url));
    }
  }

  return await next();
}

/**
 * Handler para bloquear acceso directo a rutas de órdenes sin subdominio
 * @param request - Petición entrante
 * @param next - Función para continuar con el siguiente handler
 * @returns Respuesta de redirección o null para continuar
 */
async function handleOrdersSubdomainProtection(
  request: NextRequest,
  next: () => Promise<NextResponse | null>
): Promise<NextResponse | null> {
  const domainAnalysis = analyzeDomain(request);

  if (shouldBlockOrdersAccess(request.nextUrl.pathname, domainAnalysis.subdomain)) {
    return NextResponse.redirect(new URL(PROTECTED_ROUTES.HOME, request.url));
  }

  return await next();
}

/**
 * Handler para manejar el enrutamiento basado en dominios
 * @param request - Petición entrante
 * @param next - Función para continuar con el siguiente handler
 * @returns Respuesta de rewrite o null para continuar
 */
async function handleDomainRoutingHandler(
  request: NextRequest,
  next: () => Promise<NextResponse | null>
): Promise<NextResponse | null> {
  const domainResponse = handleDomainRouting(request);
  return domainResponse || (await next());
}

/**
 * Handler para verificar propiedad de productos específicos
 * @param request - Petición entrante
 * @param next - Función para continuar con el siguiente handler
 * @returns Respuesta del middleware de propiedad o null para continuar
 */
async function handleProductOwnership(
  request: NextRequest,
  next: () => Promise<NextResponse | null>
): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname;

  if (matchStoreProductRoute(pathname) && !shouldExcludeProductRoute(pathname)) {
    return await handleProductOwnershipMiddleware(request);
  }

  return await next();
}

/**
 * Handler para verificar propiedad de páginas específicas
 * @param request - Petición entrante
 * @param next - Función para continuar con el siguiente handler
 * @returns Respuesta del middleware de propiedad o null para continuar
 */
async function handlePagesOwnership(
  request: NextRequest,
  next: () => Promise<NextResponse | null>
): Promise<NextResponse | null> {
  if (matchStorePagesRoute(request.nextUrl.pathname)) {
    return await handlePagesOwnershipMiddleware(request);
  }

  return await next();
}

/**
 * Handler para verificar propiedad de colecciones específicas
 * @param request - Petición entrante
 * @param next - Función para continuar con el siguiente handler
 * @returns Respuesta del middleware de propiedad o null para continuar
 */
async function handleCollectionOwnership(
  request: NextRequest,
  next: () => Promise<NextResponse | null>
): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname;

  if (matchStoreCollectionRoute(pathname) && !shouldExcludeCollectionRoute(pathname)) {
    return await handleCollectionOwnershipMiddleware(request);
  }

  return await next();
}

/**
 * Handler para proteger rutas de tienda y guardar última tienda visitada
 * @param request - Petición entrante
 * @param next - Función para continuar con el siguiente handler
 * @returns Respuesta del middleware de acceso a tienda o null para continuar
 */
async function handleStoreAccess(
  request: NextRequest,
  next: () => Promise<NextResponse | null>
): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname;

  if (matchStoreRoute(pathname)) {
    const storeResponse = await handleStoreAccessMiddleware(request);

    if (shouldSaveLastStore(storeResponse)) {
      const storeId = extractStoreId(pathname);
      if (storeId) {
        setLastVisitedStore(storeResponse, storeId);
      }
    }

    return storeResponse;
  }

  return await next();
}

/**
 * Handler para proteger rutas de configuración de cuenta
 * @param request - Petición entrante
 * @param next - Función para continuar con el siguiente handler
 * @returns Respuesta del middleware de autenticación o null para continuar
 */
async function handleAccountSettings(
  request: NextRequest,
  next: () => Promise<NextResponse | null>
): Promise<NextResponse | null> {
  if (request.nextUrl.pathname.startsWith(PROTECTED_ROUTES.ACCOUNT_SETTINGS)) {
    return await handleAuthenticationMiddlewareNoRefresh(request, NextResponse.next());
  }

  return await next();
}

/**
 * Handler para manejar rutas de configuración inicial de tienda
 * @param request - Petición entrante
 * @param next - Función para continuar con el siguiente handler
 * @returns Respuesta del middleware de tienda o null para continuar
 */
async function handleStoreSetup(
  request: NextRequest,
  next: () => Promise<NextResponse | null>
): Promise<NextResponse | null> {
  if (AUTHENTICATED_ROUTES.includes(request.nextUrl.pathname as any)) {
    return await handleStoreMiddleware(request, NextResponse.next());
  }

  return await next();
}

/**
 * Handler para redirigir usuarios autenticados desde la página de login
 * @param request - Petición entrante
 * @param next - Función para continuar con el siguiente handler
 * @returns Respuesta del middleware de redirección o null para continuar
 */
async function handleLoginRedirect(
  request: NextRequest,
  next: () => Promise<NextResponse | null>
): Promise<NextResponse | null> {
  if (request.nextUrl.pathname === PROTECTED_ROUTES.LOGIN) {
    return await handleAuthenticatedRedirectMiddleware(request, NextResponse.next());
  }

  return await next();
}

/**
 * Ejecuta recursivamente una cadena de handlers de middleware
 * @param handlers - Array de handlers a ejecutar
 * @param request - Petición entrante
 * @param index - Índice actual del handler (para recursión)
 * @returns Respuesta final del middleware
 */
async function executeHandlers(
  handlers: MiddlewareHandler[],
  request: NextRequest,
  index: number = 0
): Promise<NextResponse> {
  // Caso base: si no hay más handlers, continuar con NextResponse.next()
  if (index >= handlers.length) {
    return NextResponse.next();
  }

  // Obtener el handler actual
  const currentHandler = handlers[index];

  // Crear función next para el handler actual (recursión)
  const next = async (): Promise<NextResponse | null> => {
    return await executeHandlers(handlers, request, index + 1);
  };

  // Ejecutar el handler actual
  const result = await currentHandler(request, next);

  // Si el handler retorna una respuesta, usarla; sino continuar recursivamente
  return result || (await executeHandlers(handlers, request, index + 1));
}

/**
 * Middleware principal que coordina todos los handlers de seguridad y enrutamiento
 * Utiliza el patrón Chain of Responsibility con ejecución recursiva
 * @param request - Petición entrante de Next.js
 * @returns Respuesta procesada por los middlewares
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Definir la cadena de handlers en orden de ejecución
  const handlers: MiddlewareHandler[] = [
    handleOAuthProtection,
    handleOrdersSubdomainProtection,
    handleDomainRoutingHandler,
    handleProductOwnership,
    handlePagesOwnership,
    handleCollectionOwnership,
    handleStoreAccess,
    handleAccountSettings,
    handleStoreSetup,
    handleLoginRedirect,
  ];

  // Ejecutar recursivamente todos los handlers
  return await executeHandlers(handlers, request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons).*)'],
};
