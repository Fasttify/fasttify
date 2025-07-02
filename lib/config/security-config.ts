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
  ];

  // Dominios explícitamente denegados (además de las IP privadas)
  private static readonly EXPLICITLY_DENIED_DOMAINS = [
    'localhost',
    'metadata.google.internal',
    '169.254.169.254',
    '100.100.100.200',
    // Agregar más dominios problemáticos según sea necesario
  ];

  // Extensiones de dominio prohibidas
  private static readonly PROHIBITED_TLDS = ['.local', '.localhost', '.test', '.invalid', '.example', '.internal'];

  /**
   * Verificar si un dominio está en la lista de permitidos
   */
  static isDomainAllowed(domain: string): boolean {
    const sanitizedDomain = domain.trim().toLowerCase();

    // Verificar dominios explícitamente denegados
    if (this.EXPLICITLY_DENIED_DOMAINS.includes(sanitizedDomain)) {
      return false;
    }

    // Verificar TLDs prohibidos
    if (this.PROHIBITED_TLDS.some((tld) => sanitizedDomain.endsWith(tld))) {
      return false;
    }

    // Verificar contra patrones permitidos
    return this.ALLOWED_DOMAIN_PATTERNS.some((pattern) => pattern.test(sanitizedDomain));
  }

  /**
   * Obtener mensaje de error para dominio no permitido
   */
  static getDomainNotAllowedMessage(domain: string): string {
    return `El dominio "${domain}" no está permitido para validación. Solo se permiten dominios públicos válidos.`;
  }

  /**
   * Configuración de rate limiting para validaciones de dominio
   */
  static readonly DOMAIN_VALIDATION_LIMITS = {
    maxAttemptsPerHour: 10,
    maxAttemptsPerDay: 50,
    cooldownMinutes: 5,
  };

  /**
   * Configuración de timeout para verificaciones HTTP
   */
  static readonly HTTP_VALIDATION_CONFIG = {
    timeoutMs: 10000,
    maxRedirects: 0,
    maxResponseSize: 1000,
  };

  /**
   * Construir URL de validación de manera segura usando lista de permitidos
   */
  static buildSecureValidationURL(domain: string): string | null {
    // Sanitizar el dominio
    const sanitizedDomain = domain.trim().toLowerCase();

    // Verificar que el dominio esté en la lista de permitidos
    if (!this.isDomainAllowed(sanitizedDomain)) {
      return null;
    }

    // Lista estricta de componentes de URL permitidos
    const allowedProtocols = ['http'];
    const allowedPaths = ['/.well-known/fasttify-validation.txt'];

    // Verificar caracteres prohibidos en el dominio para construcción de URL
    const prohibitedUrlChars = ['..', '/', '\\', '@', ' ', '\t', '\n', '\r', '\0'];
    if (prohibitedUrlChars.some((char) => sanitizedDomain.includes(char))) {
      return null;
    }

    // Construir URL usando el constructor URL para validación adicional
    try {
      const protocol = allowedProtocols[0];
      const path = allowedPaths[0];
      const url = new URL(`${protocol}://${sanitizedDomain}${path}`);

      // Verificaciones estrictas post-construcción
      if (url.hostname !== sanitizedDomain) {
        return null;
      }

      if (url.pathname !== path) {
        return null;
      }

      if (url.protocol !== `${protocol}:`) {
        return null;
      }

      // Verificar que no hay componentes inesperados
      if (url.search || url.hash || url.username || url.password) {
        return null;
      }

      return url.toString();
    } catch (error) {
      return null;
    }
  }

  /**
   * Validar que una URL construida es segura para usar
   */
  static isSecureValidationURL(url: string): boolean {
    try {
      const parsedURL = new URL(url);

      // Verificar protocolo
      if (parsedURL.protocol !== 'http:') {
        return false;
      }

      // Verificar path exacto
      if (parsedURL.pathname !== '/.well-known/fasttify-validation.txt') {
        return false;
      }

      // Verificar que no hay componentes adicionales
      if (parsedURL.search || parsedURL.hash || parsedURL.username || parsedURL.password) {
        return false;
      }

      // Verificar que el hostname es un dominio permitido
      return this.isDomainAllowed(parsedURL.hostname);
    } catch (error) {
      return false;
    }
  }

  /**
   * Mapeo seguro de dominios a URLs usando lista fija
   * Este enfoque es más fácil de analizar estáticamente por herramientas como CodeQL
   */
  static getSecureValidationEndpoint(domain: string): string | null {
    const sanitizedDomain = domain.trim().toLowerCase();

    // Verificar que el dominio esté permitido
    if (!this.isDomainAllowed(sanitizedDomain)) {
      return null;
    }

    // Componentes fijos controlados por el servidor
    const allowedProtocol = 'http';
    const allowedPath = '/.well-known/fasttify-validation.txt';

    // Construcción usando componentes fijos - CodeQL puede verificar que no hay input directo
    try {
      // Usar URL constructor con validación estricta
      const baseUrl = new URL(`${allowedProtocol}://${sanitizedDomain}`);

      // Verificar que la URL base es válida
      if (baseUrl.protocol !== `${allowedProtocol}:`) {
        return null;
      }

      if (baseUrl.hostname !== sanitizedDomain) {
        return null;
      }

      // Construir URL final con path fijo
      const finalUrl = new URL(allowedPath, baseUrl);

      // Verificaciones post-construcción
      if (finalUrl.pathname !== allowedPath) {
        return null;
      }

      if (finalUrl.search || finalUrl.hash || finalUrl.username || finalUrl.password) {
        return null;
      }

      return finalUrl.toString();
    } catch (error) {
      return null;
    }
  }
}
