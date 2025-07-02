const exactOrigins: string[] = ['https://www.fasttify.com', 'http://localhost:3000'];

const wildcardRegexes: RegExp[] = [/\.fasttify\.com$/];

/**
 * Verifica si el origen es válido
 */
function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;

  try {
    const url = new URL(origin);
    const hostname = url.hostname;

    return exactOrigins.includes(origin) || wildcardRegexes.some((regex) => regex.test(hostname));
  } catch {
    return false;
  }
}

/**
 * Devuelve los headers CORS adecuados para una función Lambda
 */
export function getCorsHeaders(origin?: string): Record<string, string> {
  const isAllowed = isAllowedOrigin(origin);

  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': isAllowed ? origin! : 'null',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };
}
