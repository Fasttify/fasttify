/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

  // NO reescribir rutas de sitemap y robots - dejar que los handlers las manejen
  if (path === '/sitemap.xml' || path === '/robots.txt') {
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

  // NO reescribir rutas de sitemap y robots - dejar que los handlers las manejen
  if (path === '/sitemap.xml' || path === '/robots.txt') {
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
 * Maneja las reescrituras de URL para el subdominio orders
 */
function handleOrdersSubdomainRewrite(request: NextRequest): NextResponse | null {
  const path = request.nextUrl.pathname;
  const url = request.nextUrl.clone();

  // Reescribir todas las rutas del subdominio orders hacia /orders
  if (path === '/') {
    url.pathname = '/orders';
  } else {
    url.pathname = `/orders${path}`;
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

  // Manejar el subdominio orders específicamente
  if (domainAnalysis.subdomain === 'orders') {
    return handleOrdersSubdomainRewrite(request);
  }

  // Lista de otros subdominios del sistema (no son tiendas)
  const systemSubdomains = ['orders-domain'];

  // Si es un subdominio del sistema, no reescribir (dejar que Next.js lo maneje)
  if (domainAnalysis.subdomain && systemSubdomains.includes(domainAnalysis.subdomain)) {
    return null;
  }

  // Manejar subdominios de fasttify.com (tiendas)
  if (domainAnalysis.subdomain && domainAnalysis.subdomain !== 'www') {
    return handleSubdomainRewrite(request, domainAnalysis.subdomain);
  }

  // Manejar dominios personalizados
  if (domainAnalysis.isCustomDomain) {
    return handleCustomDomainRewrite(request, domainAnalysis.cleanHostname);
  }

  return null;
}
