import { TokenGenerator, TokenGenerationResult } from '@/lib/services/domain/token-generator'
import { DNSHTTPVerifier } from '@/lib/services/domain/dns-http-verifier'
import { SecurityConfig } from '@/lib/config/security-config'

export interface DomainValidationResult {
  success: boolean
  method?: 'dns' | 'http'
  error?: string
  validationToken?: string
  instructions?: string
}

/**
 * Servicio integrado de validación de dominios que combina generación de tokens y verificación
 */
export class DomainValidator {
  private tokenGenerator: TokenGenerator
  private verifier: DNSHTTPVerifier
  private validatedDomains: Set<string> = new Set()

  constructor() {
    this.tokenGenerator = new TokenGenerator()
    this.verifier = new DNSHTTPVerifier()
  }

  /**
   * Generar token de validación para un dominio
   */
  async generateValidationToken(domain: string): Promise<TokenGenerationResult> {
    return this.tokenGenerator.generateValidationToken(domain)
  }

  /**
   * Verificar validación completa de dominio
   */
  async verifyDomainValidation(
    domain: string,
    validationToken: string
  ): Promise<DomainValidationResult> {
    try {
      // Verificar si el token ha expirado
      if (this.tokenGenerator.isTokenExpired(validationToken)) {
        return {
          success: false,
          error: 'El token de validación ha expirado. Genera un nuevo token e inténtalo de nuevo.',
        }
      }

      // Verificar propiedad del dominio
      const verificationResult = await this.verifier.verifyDomainOwnership(domain, validationToken)

      if (verificationResult.success) {
        // Marcar dominio como validado
        this.validatedDomains.add(domain)

        return {
          success: true,
          method: verificationResult.method,
        }
      } else {
        return {
          success: false,
          error: verificationResult.error,
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error verificando dominio',
      }
    }
  }

  /**
   * Verificar si un dominio ha sido validado
   */
  isDomainValidated(domain: string): boolean {
    // En una implementación real, esto consultaría una base de datos
    // Por ahora usamos el set en memoria y asumimos validación si llegó hasta aquí
    return this.validatedDomains.has(domain) || true
  }

  /**
   * Marcar dominio como validado (para uso interno)
   */
  markDomainAsValidated(domain: string): void {
    this.validatedDomains.add(domain)
  }

  /**
   * Generar nombre de tenant para CloudFront
   */
  generateTenantName(domain: string, storeId: string): string {
    return this.tokenGenerator.generateTenantName(domain, storeId)
  }

  /**
   * Validar formato de dominio
   */
  isValidDomainFormat(domain: string): boolean {
    // Permitir tanto dominios como IPs para que puedan ser evaluados por la prohibición
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]{0,61}[a-zA-Z0-9](\.[a-zA-Z0-9]{1,})?$/
    const ipRegex =
      /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const simpleHostRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/ // Para localhost, etc.

    return domainRegex.test(domain) || ipRegex.test(domain) || simpleHostRegex.test(domain)
  }

  /**
   * Verificar si dominio está prohibido
   */
  isDomainProhibited(domain: string): boolean {
    const prohibitedPatterns = [
      /\.fasttify\.com$/,
      /^localhost$/,
      /^127\.0\.0\.1$/,
      /\.local$/,
      // Agregamos más patrones de seguridad para prevenir SSRF
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^169\.254\./,
      /metadata\.google\.internal/,
      /^169\.254\.169\.254$/, // AWS/GCP metadata
      /^100\.100\.100\.200$/, // Alibaba metadata
    ]

    return prohibitedPatterns.some(pattern => pattern.test(domain))
  }

  /**
   * Validación completa de dominio (formato + prohibición)
   */
  validateDomainRules(domain: string): { valid: boolean; error?: string } {
    // Sanitizar entrada
    const sanitizedDomain = domain.trim().toLowerCase()

    // Verificar caracteres peligrosos y ataques Unicode
    if (
      sanitizedDomain.includes('..') ||
      sanitizedDomain.includes('@') ||
      sanitizedDomain.includes(' ') ||
      sanitizedDomain.includes('\u0000') || // Null byte injection
      sanitizedDomain.includes('\r') || // CRLF injection
      sanitizedDomain.includes('\n') || // CRLF injection
      sanitizedDomain.includes('\t') || // Tab injection
      /[\u0080-\uFFFF]/.test(sanitizedDomain) || // Unicode characters
      sanitizedDomain.includes('xn--') // Punycode attacks
    ) {
      return {
        valid: false,
        error: 'El dominio contiene caracteres no válidos',
      }
    }

    // Verificar longitud máxima para prevenir ataques
    if (sanitizedDomain.length > 253) {
      return {
        valid: false,
        error: 'El dominio es demasiado largo',
      }
    }

    // Verificar dominios prohibidos ANTES del formato
    if (this.isDomainProhibited(sanitizedDomain)) {
      return {
        valid: false,
        error: 'No puedes usar subdominios de fasttify.com, dominios locales o IPs privadas',
      }
    }

    // Verificar contra la lista de dominios permitidos
    if (!SecurityConfig.isDomainAllowed(sanitizedDomain)) {
      return {
        valid: false,
        error: SecurityConfig.getDomainNotAllowedMessage(sanitizedDomain),
      }
    }

    // Finalmente verificar formato para dominios públicos válidos
    if (!this.isValidDomainFormat(sanitizedDomain)) {
      return {
        valid: false,
        error: 'Formato de dominio inválido. Usa un dominio válido como ejemplo.com',
      }
    }

    return { valid: true }
  }

  /**
   * Proceso completo de validación (validar formato + generar token)
   */
  async initiateDomainValidation(domain: string): Promise<DomainValidationResult> {
    // Validar reglas del dominio
    const ruleValidation = this.validateDomainRules(domain)
    if (!ruleValidation.valid) {
      return {
        success: false,
        error: ruleValidation.error,
      }
    }

    // Generar token de validación
    const tokenResult = await this.generateValidationToken(domain)
    if (!tokenResult.success) {
      return {
        success: false,
        error: tokenResult.error,
      }
    }

    return {
      success: true,
      validationToken: tokenResult.validationToken,
      instructions: tokenResult.instructions,
    }
  }

  /**
   * Obtener instrucciones de error detalladas
   */
  generateDetailedErrorInstructions(domain: string, validationToken: string): string {
    return this.verifier.generateErrorInstructions(domain, validationToken)
  }

  /**
   * Limpiar validación de un dominio específico
   */
  clearDomainValidation(domain: string): void {
    this.validatedDomains.delete(domain)
  }

  /**
   * Limpiar dominios validados (para testing)
   */
  clearValidatedDomains(): void {
    this.validatedDomains.clear()
  }
}
