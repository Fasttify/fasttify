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

/** Dominios principales del sistema */
const MAIN_DOMAINS = {
  PRODUCTION: 'fasttify.com',
  DEVELOPMENT: 'localhost',
} as const;

/** Subdominios del sistema que no representan tiendas */
const SYSTEM_SUBDOMAINS = ['orders', 'admin', 'orders-domain'] as const;

/** Rutas que no deben ser reescritas por el middleware */
const EXCLUDED_PATHS = ['/assets/', '/sitemap.xml', '/robots.txt'] as const;

/** Número mínimo de segmentos para considerar un subdominio válido */
const MIN_SUBDOMAIN_SEGMENTS = 2;
const MIN_CUSTOM_DOMAIN_SEGMENTS = 3;

/**
 * Configuración de dominio para el sistema
 */
export interface DomainConfig {
  /** Indica si el entorno es de producción */
  isProduction: boolean;
  /** Lista de dominios permitidos para el entorno actual */
  allowedDomains: string[];
}

/**
 * Análisis completo del dominio de la petición
 */
export interface DomainAnalysis {
  /** Hostname original de la petición */
  hostname: string;
  /** Hostname limpio sin puerto */
  cleanHostname: string;
  /** Indica si es el dominio principal */
  isMainDomain: boolean;
  /** Subdominio extraído si existe */
  subdomain: string;
  /** Indica si es un dominio personalizado */
  isCustomDomain: boolean;
  /** Indica si es un dominio de Fasttify */
  isFasttifyDomain: boolean;
  /** Indica si es localhost */
  isLocalhost: boolean;
}

/**
 * Obtiene el hostname de la petición, priorizando headers de CloudFront
 * @param request - Petición de Next.js
 * @returns El hostname real de la petición
 */
function getRequestHostname(request: NextRequest): string {
  const xOriginalHost = request.headers.get('x-original-host');

  if (xOriginalHost) {
    return xOriginalHost;
  }

  const hasCloudFront = request.headers.get('cf-connecting-ip');
  if (hasCloudFront) {
    return request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  }

  return request.headers.get('host') || '';
}

/**
 * Limpia el hostname removiendo el puerto
 * @param hostname - Hostname original
 * @returns Hostname sin puerto
 */
function cleanHostname(hostname: string): string {
  return hostname.split(':')[0];
}

/**
 * Determina si el entorno actual es de producción
 * @returns True si es producción, false en caso contrario
 */
function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Verifica si un hostname es un dominio de Fasttify
 * @param hostname - Hostname a verificar
 * @returns True si es dominio de Fasttify
 */
function isFasttifyDomain(hostname: string): boolean {
  return hostname === MAIN_DOMAINS.PRODUCTION || hostname.endsWith(`.${MAIN_DOMAINS.PRODUCTION}`);
}

/**
 * Verifica si un hostname es localhost
 * @param hostname - Hostname a verificar
 * @returns True si es localhost
 */
function isLocalhostDomain(hostname: string): boolean {
  return hostname === MAIN_DOMAINS.DEVELOPMENT || hostname.startsWith(`${MAIN_DOMAINS.DEVELOPMENT}:`);
}

/**
 * Determina si el hostname es el dominio principal
 * @param cleanHostname - Hostname limpio
 * @param allowedDomains - Lista de dominios permitidos
 * @returns True si es el dominio principal
 */
function isMainDomain(cleanHostname: string, allowedDomains: string[]): boolean {
  return allowedDomains.some((domain) => cleanHostname === domain || cleanHostname === `www.${domain}`);
}

/**
 * Obtiene la lista de dominios permitidos según el entorno
 * @param isFasttify - Si es dominio de Fasttify
 * @param isProduction - Si es entorno de producción
 * @returns Lista de dominios permitidos
 */
function getAllowedDomains(isFasttify: boolean, isProduction: boolean): string[] {
  if (isFasttify) {
    return [MAIN_DOMAINS.PRODUCTION];
  }

  return isProduction ? [MAIN_DOMAINS.PRODUCTION] : [MAIN_DOMAINS.DEVELOPMENT];
}

/**
 * Analiza el hostname de la petición y determina el tipo de dominio
 * @param request - Petición de Next.js
 * @returns Análisis completo del dominio
 */
export function analyzeDomain(request: NextRequest): DomainAnalysis {
  const hostname = getRequestHostname(request);
  const cleanHostnameValue = cleanHostname(hostname);
  const isProduction = isProductionEnvironment();
  const isFasttify = isFasttifyDomain(cleanHostnameValue);
  const isLocalhost = isLocalhostDomain(cleanHostnameValue);
  const allowedDomains = getAllowedDomains(isFasttify, isProduction);
  const isMain = isMainDomain(cleanHostnameValue, allowedDomains);
  const subdomain = extractSubdomain(hostname, isProduction);
  const isCustom = !isFasttify && !isLocalhost && !isMain;

  return {
    hostname,
    cleanHostname: cleanHostnameValue,
    isMainDomain: isMain,
    subdomain,
    isCustomDomain: isCustom,
    isFasttifyDomain: isFasttify,
    isLocalhost,
  };
}

/**
 * Extrae el subdominio del hostname usando recursividad
 * @param hostname - Hostname completo
 * @param isProduction - Si es entorno de producción
 * @returns El subdominio extraído o cadena vacía
 */
function extractSubdomain(hostname: string, isProduction: boolean): string {
  const cleanHostnameValue = cleanHostname(hostname);
  const parts = cleanHostnameValue.split('.');
  const isFasttify = isFasttifyDomain(cleanHostnameValue);

  if (isFasttify || isProduction) {
    return extractProductionSubdomain(parts);
  } else {
    return extractDevelopmentSubdomain(parts);
  }
}

/**
 * Extrae subdominio para entorno de producción (recursiva)
 * @param parts - Partes del hostname divididas por puntos
 * @param index - Índice actual para recursión (por defecto 0)
 * @returns El subdominio o cadena vacía
 */
function extractProductionSubdomain(parts: string[], index: number = 0): string {
  if (index >= parts.length) {
    return '';
  }

  const allowedDomains = [MAIN_DOMAINS.PRODUCTION];
  const domain = parts.slice(-2).join('.');

  if (parts.length === MIN_CUSTOM_DOMAIN_SEGMENTS && allowedDomains.includes(domain as any)) {
    return parts[index];
  }

  return extractProductionSubdomain(parts, index + 1);
}

/**
 * Extrae subdominio para entorno de desarrollo (recursiva)
 * @param parts - Partes del hostname divididas por puntos
 * @param index - Índice actual para recursión (por defecto 0)
 * @returns El subdominio o cadena vacía
 */
function extractDevelopmentSubdomain(parts: string[], index: number = 0): string {
  if (index >= parts.length) {
    return '';
  }

  const allowedDomains = [MAIN_DOMAINS.DEVELOPMENT];
  const domain = parts[parts.length - 1];

  if (parts.length === MIN_SUBDOMAIN_SEGMENTS && allowedDomains.includes(domain as any)) {
    return parts[index];
  }

  return extractDevelopmentSubdomain(parts, index + 1);
}

/**
 * Verifica si una ruta debe ser excluida del rewrite
 * @param path - Ruta a verificar
 * @returns True si debe ser excluida
 */
function shouldExcludePath(path: string): boolean {
  return EXCLUDED_PATHS.some((excludedPath) => path.startsWith(excludedPath) || path === excludedPath);
}

/**
 * Crea una respuesta de rewrite para una URL
 * @param request - Petición original
 * @param newPath - Nueva ruta de destino
 * @param originalPath - Ruta original (opcional)
 * @returns Respuesta de rewrite o null
 */
function createRewriteResponse(request: NextRequest, newPath: string, originalPath?: string): NextResponse | null {
  const url = request.nextUrl.clone();
  url.pathname = newPath;

  if (originalPath && originalPath !== '/') {
    url.searchParams.set('path', originalPath);
  }

  return NextResponse.rewrite(url);
}

/**
 * Maneja las reescrituras de URL para subdominios de tiendas
 * @param request - Petición de Next.js
 * @param subdomain - Subdominio de la tienda
 * @returns Respuesta de rewrite o null
 */
function handleSubdomainRewrite(request: NextRequest, subdomain: string): NextResponse | null {
  const path = request.nextUrl.pathname;

  if (shouldExcludePath(path)) {
    return null;
  }

  if (path === '/') {
    return createRewriteResponse(request, `/${subdomain}`);
  }

  if (!path.startsWith(`/${subdomain}`)) {
    return createRewriteResponse(request, `/${subdomain}`, path);
  }

  return null;
}

/**
 * Maneja las reescrituras de URL para dominios personalizados
 * @param request - Petición de Next.js
 * @param cleanHostname - Hostname limpio del dominio personalizado
 * @returns Respuesta de rewrite o null
 */
function handleCustomDomainRewrite(request: NextRequest, cleanHostname: string): NextResponse | null {
  const path = request.nextUrl.pathname;

  if (shouldExcludePath(path)) {
    return null;
  }

  return createRewriteResponse(request, `/${cleanHostname}`, path);
}

/**
 * Maneja las reescrituras de URL para el subdominio orders
 * @param request - Petición de Next.js
 * @returns Respuesta de rewrite o null
 */
function handleOrdersSubdomainRewrite(request: NextRequest): NextResponse | null {
  const path = request.nextUrl.pathname;
  const newPath = path === '/' ? '/orders' : `/orders${path}`;

  return createRewriteResponse(request, newPath);
}

/**
 * Maneja las reescrituras de URL para el subdominio admin
 * @param _request - Petición de Next.js (no utilizada)
 * @returns Respuesta de rewrite o null (siempre null para admin)
 */
function handleAdminSubdomainRewrite(_request: NextRequest): NextResponse | null {
  // Para el subdominio admin, mantener las rutas tal como están
  // Las rutas /store/[storeId]/... se mantienen igual
  return null;
}

/**
 * Verifica si un subdominio es del sistema
 * @param subdomain - Subdominio a verificar
 * @returns True si es subdominio del sistema
 */
function isSystemSubdomain(subdomain: string): boolean {
  return SYSTEM_SUBDOMAINS.includes(subdomain as any);
}

/**
 * Función principal que maneja todos los tipos de dominios de forma recursiva
 * @param request - Petición de Next.js
 * @param analysis - Análisis del dominio (opcional, para recursión)
 * @returns Respuesta de rewrite o null
 */
export function handleDomainRouting(request: NextRequest, analysis?: DomainAnalysis): NextResponse | null {
  const domainAnalysis = analysis || analyzeDomain(request);

  // Caso base: dominio principal
  if (domainAnalysis.isMainDomain) {
    return null;
  }

  // Caso específico: subdominio orders
  if (domainAnalysis.subdomain === 'orders') {
    return handleOrdersSubdomainRewrite(request);
  }

  // Caso específico: subdominio admin
  if (domainAnalysis.subdomain === 'admin') {
    return handleAdminSubdomainRewrite(request);
  }

  // Caso recursivo: otros subdominios del sistema
  if (domainAnalysis.subdomain && isSystemSubdomain(domainAnalysis.subdomain)) {
    return null;
  }

  // Caso recursivo: subdominios de tiendas
  if (domainAnalysis.subdomain && domainAnalysis.subdomain !== 'www') {
    return handleSubdomainRewrite(request, domainAnalysis.subdomain);
  }

  // Caso recursivo: dominios personalizados
  if (domainAnalysis.isCustomDomain) {
    return handleCustomDomainRewrite(request, domainAnalysis.cleanHostname);
  }

  // Caso base: no hay rewrite necesario
  return null;
}
