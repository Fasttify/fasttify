export interface VerificationResult {
  success: boolean
  method?: 'dns' | 'http'
  error?: string
}

/**
 * Servicio especializado en verificación de propiedad de dominios vía DNS TXT y HTTP
 */
export class DNSHTTPVerifier {
  private readonly HTTP_TIMEOUT_MS = 10000
  private readonly DNS_CACHE_TTL = 60000 // 1 minuto

  /**
   * Verificar propiedad de dominio vía DNS TXT
   */
  async verifyDNSValidation(domain: string, validationToken: string): Promise<boolean> {
    try {
      const dns = require('dns').promises
      const txtRecords = await dns.resolveTxt(`_fasttify-validation.${domain}`)
      const allRecords = txtRecords.flat()

      const isValid = allRecords.includes(validationToken)
      return isValid
    } catch (error) {
      return false
    }
  }

  /**
   * Verificar propiedad de dominio vía archivo HTTP
   */
  async verifyHTTPValidation(domain: string, validationToken: string): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.HTTP_TIMEOUT_MS)

      const response = await fetch(`http://${domain}/.well-known/fasttify-validation.txt`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Fasttify-Domain-Validator/1.0',
          'Cache-Control': 'no-cache',
        },
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const content = await response.text()
        const isValid = content.trim() === validationToken
        return isValid
      }

      return false
    } catch (error) {
      return false
    }
  }

  /**
   * Verificar dominio usando ambos métodos (DNS primero, HTTP como fallback)
   */
  async verifyDomainOwnership(
    domain: string,
    validationToken: string
  ): Promise<VerificationResult> {
    try {
      // Intentar verificación DNS primero (más confiable)
      const dnsValid = await this.verifyDNSValidation(domain, validationToken)
      if (dnsValid) {
        return {
          success: true,
          method: 'dns',
        }
      }

      // Si DNS falla, intentar HTTP
      const httpValid = await this.verifyHTTPValidation(domain, validationToken)
      if (httpValid) {
        return {
          success: true,
          method: 'http',
        }
      }

      // Ambos métodos fallaron
      return {
        success: false,
        error: `No se pudo validar el dominio ${domain}. Verifica que hayas configurado correctamente el registro DNS TXT o el archivo HTTP. Los cambios DNS pueden tardar hasta 48 horas en propagarse.`,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error verificando dominio',
      }
    }
  }

  /**
   * Verificar resolución básica de dominio
   */
  async canResolveDomain(domain: string): Promise<boolean> {
    try {
      const dns = require('dns').promises

      // Intentar resolución A o AAAA
      try {
        await dns.resolve4(domain)
        return true
      } catch {
        try {
          await dns.resolve6(domain)
          return true
        } catch {
          return false
        }
      }
    } catch {
      return false
    }
  }

  /**
   * Generar instrucciones específicas de error
   */
  generateErrorInstructions(domain: string, validationToken: string): string {
    return `
 No se pudo validar el dominio ${domain}

Para resolver este problema:

 OPCIÓN DNS TXT:
   1. Verifica que el registro TXT esté configurado correctamente:
      • Nombre: _fasttify-validation.${domain}
      • Valor: ${validationToken}
   2. Los cambios DNS pueden tardar hasta 48 horas en propagarse
   3. Usa herramientas como "dig" o "nslookup" para verificar:
      dig TXT _fasttify-validation.${domain}

 OPCIÓN HTTP:
   1. Verifica que el archivo esté accesible:
      http://${domain}/.well-known/fasttify-validation.txt
   2. El contenido debe ser exactamente: ${validationToken}
   3. Asegúrate de que no haya espacios extra o saltos de línea

 Consejos:
   • DNS TXT es más confiable que HTTP
   • Verifica que tu dominio esté funcionando correctamente
   • Contacta a tu proveedor de DNS si tienes problemas
    `.trim()
  }
}
