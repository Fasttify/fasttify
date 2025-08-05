import { logger } from '@/renderer-engine/lib/logger';
import { domainResolver } from '@/renderer-engine/services/core/domain-resolver';
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
 * Solo retorna el origin si es válido; si no, retorna el dominio principal seguro.
 */
export async function getNextCorsHeaders(request: NextRequest): Promise<Record<string, string>> {
  const origin = request.headers.get('origin') ?? undefined;
  const isAllowed = await isAllowedOrigin(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed && origin ? origin : staticAllowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
