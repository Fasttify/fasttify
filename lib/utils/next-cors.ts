import { NextRequest } from 'next/server'
import { domainResolver } from '@/renderer-engine/services/core/domain-resolver'

const staticAllowedOrigins: string[] = [
  'https://www.fasttify.com',
  'https://fasttify.com',
  'http://localhost:3000',
]

const wildcardRegexes: RegExp[] = [/\.fasttify\.com$/]

/**
 * Comprueba si un origen determinado está permitido para las solicitudes de API.
 * Primero revisa una lista estática de dominios y subdominios,
 * luego consulta la base de datos para encontrar dominios de tienda personalizados válidos.
 * @param origin - El encabezado de origen de la solicitud entrante.
 * @returns True si el origen está permitido, false en caso contrario.
 */
async function isAllowedOrigin(origin: string | undefined): Promise<boolean> {
  if (!origin) {
    // Permite solicitudes con origen nulo (ej: servidor a servidor, Postman)
    // Para seguridad del navegador, los navegadores siempre envían un encabezado Origin para solicitudes de origen cruzado.
    return true
  }

  try {
    // Revisa la lista estática de dominios exactos
    if (staticAllowedOrigins.includes(origin)) {
      return true
    }

    const url = new URL(origin)
    const hostname = url.hostname

    // Revisa los subdominios con comodín (ej: *.fasttify.com)
    if (wildcardRegexes.some(regex => regex.test(hostname))) {
      return true
    }

    // Si no se encuentra en las listas estáticas, consulta la base de datos para un dominio personalizado válido
    const store = await domainResolver.resolveDomain(hostname)
    return !!store // Si se encuentra una tienda para el dominio, está permitido.
  } catch (error) {
    // Formato de origen inválido o otro error
    return false
  }
}

/**
 * Genera los encabezados CORS adecuados para una ruta de API Next.js.
 * @param request - La solicitud entrante NextRequest.
 * @returns Un registro de encabezados CORS.
 */
export async function getNextCorsHeaders(request: NextRequest): Promise<Record<string, string>> {
  const origin = request.headers.get('origin') ?? undefined
  const isAllowed = await isAllowedOrigin(origin)

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin! : staticAllowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}
