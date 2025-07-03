import { NextRequest, NextResponse } from 'next/server';

export interface DomainConfig {
  isProduction: boolean;
  allowedDomains: string[];
}

export interface DomainAnalysis {
  hostname: string;
  cleanHostname: string;
  isMainDomain: boolean;
  subdomain: string;
  isCustomDomain: boolean;
  isFasttifyDomain: boolean;
  isLocalhost: boolean;
}

/**
 * Analiza el hostname de la request y determina el tipo de dominio
 */
export function analyzeDomain(request: NextRequest): DomainAnalysis {
  // Primero verificar si hay un dominio original de CloudFront Multi-Tenant
  const xOriginalHost = request.headers.get('x-original-host');

  // Obtener el hostname real, priorizando x-original-host para dominios personalizados
  const hostname =
    xOriginalHost ||
    (request.headers.get('cf-connecting-ip')
      ? request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
      : request.headers.get('host') || '');

  const cleanHostname = hostname.split(':')[0];

  // Detectar automáticamente el tipo de dominio basándose en la estructura
  const isFasttifyDomain = cleanHostname === 'fasttify.com' || cleanHostname.endsWith('.fasttify.com');
  const isLocalhost = cleanHostname === 'localhost' || cleanHostname.startsWith('localhost:');

  // Configuración de dominios
  const isProduction = process.env.APP_ENV === 'production';
  const allowedDomains = isFasttifyDomain ? ['fasttify.com'] : isProduction ? ['fasttify.com'] : ['localhost'];

  const isMainDomain = allowedDomains.some((domain) => {
    return cleanHostname === domain || cleanHostname === `www.${domain}`;
  });

  const subdomain = extractSubdomain(hostname, isProduction);
  const isCustomDomain = !isFasttifyDomain && !isLocalhost && !isMainDomain;

  return {
    hostname,
    cleanHostname,
    isMainDomain,
    subdomain,
    isCustomDomain,
    isFasttifyDomain,
    isLocalhost,
  };
}

/**
 * Extrae el subdominio del hostname
 */
function extractSubdomain(hostname: string, isProduction: boolean): string {
  const cleanHostname = hostname.split(':')[0];
  const parts = cleanHostname.split('.');

  // Detectar automáticamente si es un dominio de fasttify.com
  const isFasttifyDomain = cleanHostname === 'fasttify.com' || cleanHostname.endsWith('.fasttify.com');

  if (isFasttifyDomain || isProduction) {
    // Lista blanca de dominios permitidos en producción
    const allowedDomains = ['fasttify.com'];
    const domain = parts.slice(-2).join('.'); // Obtener los últimos 2 segmentos (ej: fasttify.com)

    // Verificar si hay exactamente un subdominio y el dominio está en la lista blanca
    if (parts.length === 3 && allowedDomains.includes(domain)) {
      return parts[0];
    }
  } else {
    // Lista blanca de dominios permitidos en desarrollo
    const allowedDomains = ['localhost'];
    const domain = parts[parts.length - 1]; // Último segmento (ej: localhost)

    // Verificar si hay exactamente un subdominio y el dominio está en la lista blanca
    if (parts.length === 2 && allowedDomains.includes(domain)) {
      return parts[0];
    }
  }
  return '';
}

/**
 * Maneja las reescrituras de URL para subdominios
 */
function handleSubdomainRewrite(request: NextRequest, subdomain: string): NextResponse | null {
  const path = request.nextUrl.pathname;

  // NO reescribir rutas de assets - dejar que la API las maneje
  if (path.startsWith('/assets/')) {
    return null;
  }

  const url = request.nextUrl.clone();

  if (path === '/') {
    // Si estamos en la raíz, reescribir a la ruta de la tienda
    url.pathname = `/${subdomain}`;
  } else if (!path.startsWith(`/${subdomain}`)) {
    // Si la ruta no empieza con el subdominio, agregar el prefijo y pasar el path original
    url.pathname = `/${subdomain}`;
    url.searchParams.set('path', path);
  } else {
    // La ruta ya tiene el prefijo correcto
    return null;
  }

  return NextResponse.rewrite(url);
}

/**
 * Maneja las reescrituras de URL para dominios personalizados
 */
function handleCustomDomainRewrite(request: NextRequest, cleanHostname: string): NextResponse | null {
  const path = request.nextUrl.pathname;

  // NO reescribir rutas de assets - dejar que la API las maneje
  if (path.startsWith('/assets/')) {
    return null;
  }

  const url = request.nextUrl.clone();

  // Para dominios personalizados, usar el dominio completo como identificador
  url.pathname = `/${cleanHostname}`;
  if (path !== '/') {
    url.searchParams.set('path', path);
  }

  return NextResponse.rewrite(url);
}

/**
 * Función principal que maneja todos los tipos de dominios
 */
export function handleDomainRouting(request: NextRequest): NextResponse | null {
  const domainAnalysis = analyzeDomain(request);

  // Si es el dominio principal, no hacer nada
  if (domainAnalysis.isMainDomain) {
    return null;
  }

  // Manejar subdominios de fasttify.com
  if (domainAnalysis.subdomain && domainAnalysis.subdomain !== 'www') {
    return handleSubdomainRewrite(request, domainAnalysis.subdomain);
  }

  // Manejar dominios personalizados
  if (domainAnalysis.isCustomDomain) {
    return handleCustomDomainRewrite(request, domainAnalysis.cleanHostname);
  }

  return null;
}
