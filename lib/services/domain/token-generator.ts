export interface ValidationToken {
  token: string
  expiresAt: number
  instructions: {
    dns: {
      name: string
      value: string
      ttl: number
    }
    http: {
      url: string
      content: string
    }
  }
}

export interface TokenGenerationResult {
  success: boolean
  validationToken?: string
  instructions?: string
  error?: string
}

/**
 * Servicio especializado en generación de tokens de validación de dominios
 */
export class TokenGenerator {
  private readonly TOKEN_EXPIRY_HOURS = 24

  /**
   * Generar token único de validación
   */
  generateToken(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    return `fasttify-validation-${timestamp}-${random}`
  }

  /**
   * Generar token completo con instrucciones
   */
  async generateValidationToken(domain: string): Promise<TokenGenerationResult> {
    try {
      const validationToken = this.generateToken()
      const expiresAt = Date.now() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000

      const tokenData: ValidationToken = {
        token: validationToken,
        expiresAt,
        instructions: {
          dns: {
            name: `_fasttify-validation.${domain}`,
            value: validationToken,
            ttl: 300,
          },
          http: {
            url: `http://${domain}/.well-known/fasttify-validation.txt`,
            content: validationToken,
          },
        },
      }

      const instructions = this.formatInstructions(domain, tokenData)

      return {
        success: true,
        validationToken,
        instructions,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error generating validation token',
      }
    }
  }

  /**
   * Formatear instrucciones legibles para el usuario
   */
  private formatInstructions(domain: string, tokenData: ValidationToken): string {
    const expiryDate = new Date(tokenData.expiresAt).toLocaleString('es-ES')

    return `
Para validar tu dominio ${domain}, necesitas demostrar que tienes control sobre él.

Elige UNA de estas opciones:

OPCIÓN 1 - Registro DNS TXT:
   • Nombre: ${tokenData.instructions.dns.name}
   • Valor: ${tokenData.instructions.dns.value}
   • TTL: ${tokenData.instructions.dns.ttl} (5 minutos)

 OPCIÓN 2 - Archivo HTTP:
   • URL: ${tokenData.instructions.http.url}
   • Contenido: ${tokenData.instructions.http.content}

 El token expira el: ${expiryDate}

Una vez configurado, haz clic en "Verificar Dominio" para completar la validación.
    `.trim()
  }

  /**
   * Verificar si token ha expirado
   */
  isTokenExpired(token: string): boolean {
    try {
      // Extraer timestamp del token
      const parts = token.split('-')
      if (parts.length < 3) return true

      const timestamp = parseInt(parts[2])
      if (isNaN(timestamp)) return true

      const expiresAt = timestamp + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
      return Date.now() > expiresAt
    } catch {
      return true
    }
  }

  /**
   * Generar nombre de tenant único
   */
  generateTenantName(domain: string, storeId: string): string {
    const sanitizedDomain = domain.replace(/\./g, '-').replace(/[^a-zA-Z0-9-]/g, '')
    return `${storeId}-${sanitizedDomain}`
  }
}
