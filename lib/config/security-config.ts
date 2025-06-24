/**
 * Configuración de seguridad centralizada para validación de dominios
 */
export class SecurityConfig {
  // Lista de dominios permitidos para validación HTTP
  // En producción, esto debería venir de variables de entorno o base de datos
  private static readonly ALLOWED_DOMAIN_PATTERNS = [
    // Permitir dominios de segundo nivel válidos
    /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
    // Permitir subdominios de dominios válidos (múltiples niveles)
    /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.)*[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
  ]

  // Dominios explícitamente denegados (además de las IP privadas)
  private static readonly EXPLICITLY_DENIED_DOMAINS = [
    'localhost',
    'metadata.google.internal',
    '169.254.169.254',
    '100.100.100.200',
    // Agregar más dominios problemáticos según sea necesario
  ]

  // Extensiones de dominio prohibidas
  private static readonly PROHIBITED_TLDS = [
    '.local',
    '.localhost',
    '.test',
    '.invalid',
    '.example',
    '.internal',
  ]

  /**
   * Verificar si un dominio está en la lista de permitidos
   */
  static isDomainAllowed(domain: string): boolean {
    const sanitizedDomain = domain.trim().toLowerCase()

    // Verificar dominios explícitamente denegados
    if (this.EXPLICITLY_DENIED_DOMAINS.includes(sanitizedDomain)) {
      return false
    }

    // Verificar TLDs prohibidos
    if (this.PROHIBITED_TLDS.some(tld => sanitizedDomain.endsWith(tld))) {
      return false
    }

    // Verificar contra patrones permitidos
    return this.ALLOWED_DOMAIN_PATTERNS.some(pattern => pattern.test(sanitizedDomain))
  }

  /**
   * Obtener mensaje de error para dominio no permitido
   */
  static getDomainNotAllowedMessage(domain: string): string {
    return `El dominio "${domain}" no está permitido para validación. Solo se permiten dominios públicos válidos.`
  }

  /**
   * Configuración de rate limiting para validaciones de dominio
   */
  static readonly DOMAIN_VALIDATION_LIMITS = {
    maxAttemptsPerHour: 10,
    maxAttemptsPerDay: 50,
    cooldownMinutes: 5,
  }

  /**
   * Configuración de timeout para verificaciones HTTP
   */
  static readonly HTTP_VALIDATION_CONFIG = {
    timeoutMs: 10000,
    maxRedirects: 0,
    maxResponseSize: 1000,
  }
}
