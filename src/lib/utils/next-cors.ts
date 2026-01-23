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

import { logger } from '@/liquid-forge/lib/logger';
import { domainResolver } from '@/liquid-forge/services/core/domain-resolver';
import { NextRequest } from 'next/server';

const staticAllowedOrigins: string[] = ['https://www.fasttify.com', 'https://fasttify.com', 'http://localhost:3000'];

const wildcardRegexes: RegExp[] = [/\.fasttify\.com$/];

/**
 * Comprueba si un origen determinado está permitido para las solicitudes de API.
 * Solo permite orígenes explícitamente válidos.
 * @param origin - El encabezado de origen de la solicitud entrante.
 * @returns True si el origen está permitido, false en caso contrario.
 */
async function isAllowedOrigin(origin: string | undefined): Promise<boolean> {
  if (!origin) {
    // Si no hay origin, no permitir (excepto para server-to-server, que no envía origin)
    return false;
  }

  try {
    // Revisa la lista estática de dominios exactos
    if (staticAllowedOrigins.includes(origin)) {
      return true;
    }

    const url = new URL(origin);
    const hostname = url.hostname;

    // Revisa los subdominios con comodín (ej: *.fasttify.com)
    if (wildcardRegexes.some((regex) => regex.test(hostname))) {
      return true;
    }

    // Si no se encuentra en las listas estáticas, consulta la base de datos para un dominio personalizado válido
    const store = await domainResolver.resolveDomain(hostname);
    return !!store;
  } catch (error) {
    logger.error('Error checking origin', error);
    return false;
  }
}

/**
 * Genera los encabezados CORS adecuados para una ruta de API Next.js.
 * Solo retorna el origin si es válido; si no, no devuelve headers CORS (bloquea).
 */
export async function getNextCorsHeaders(request: NextRequest): Promise<Record<string, string>> {
  const origin = request.headers.get('origin') ?? undefined;
  const isAllowed = await isAllowedOrigin(origin);

  if (!isAllowed || !origin) {
    //  No devolvemos headers CORS → el navegador bloquea la request
    return {};
  }

  // Solo devolvemos headers si el origin es válido
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
  };
}
