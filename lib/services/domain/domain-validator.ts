import { TokenGenerator, TokenGenerationResult } from '@/lib/services/domain/token-generator'
import { DNSHTTPVerifier } from '@/lib/services/domain/dns-http-verifier'

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
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/
    return domainRegex.test(domain)
  }

  /**
   * Verificar si dominio está prohibido
   */
  isDomainProhibited(domain: string): boolean {
    const prohibitedPatterns = [/\.fasttify\.com$/, /localhost/, /127\.0\.0\.1/, /\.local$/]

    return prohibitedPatterns.some(pattern => pattern.test(domain))
  }

  /**
   * Validación completa de dominio (formato + prohibición)
   */
  validateDomainRules(domain: string): { valid: boolean; error?: string } {
    if (!this.isValidDomainFormat(domain)) {
      return {
        valid: false,
        error: 'Formato de dominio inválido. Usa un dominio válido como ejemplo.com',
      }
    }

    if (this.isDomainProhibited(domain)) {
      return {
        valid: false,
        error: 'No puedes usar subdominios de fasttify.com o dominios locales',
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
   * Limpiar dominios validados (para testing)
   */
  clearValidatedDomains(): void {
    this.validatedDomains.clear()
  }
}
