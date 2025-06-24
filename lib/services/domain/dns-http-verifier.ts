import { SecureLogger } from '@/lib/utils/secure-logger'
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

  // Rangos de IP privadas/locales prohibidas para prevenir SSRF
  private readonly PROHIBITED_IP_RANGES = [
    /^127\./, // 127.0.0.0/8 - localhost
    /^10\./, // 10.0.0.0/8 - RFC 1918
    /^172\.(1[6-9]|2[0-9]|3[01])\./, // 172.16.0.0/12 - RFC 1918
    /^192\.168\./, // 192.168.0.0/16 - RFC 1918
    /^169\.254\./, // 169.254.0.0/16 - Link-local
    /^::1$/, // ::1 - IPv6 localhost
    /^fc00:/, // fc00::/7 - IPv6 Unique Local
    /^fe80:/, // fe80::/10 - IPv6 Link-local
  ]

  // Dominios explícitamente prohibidos
  private readonly PROHIBITED_DOMAINS = [
    'localhost',
    'metadata.google.internal',
    '169.254.169.254', // AWS/GCP metadata
    '100.100.100.200', // Alibaba metadata
  ]

  /**
   * Validar que un dominio sea seguro para peticiones HTTP
   */
  private async validateDomainSecurity(
    domain: string
  ): Promise<{ valid: boolean; error?: string }> {
    // Sanitizar el dominio
    const sanitizedDomain = domain.trim().toLowerCase()

    // Verificar formato básico de dominio
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
    if (!domainRegex.test(sanitizedDomain)) {
      return {
        valid: false,
        error: 'Formato de dominio inválido',
      }
    }

    // Verificar dominios explícitamente prohibidos
    if (this.PROHIBITED_DOMAINS.includes(sanitizedDomain)) {
      return {
        valid: false,
        error: 'Dominio prohibido',
      }
    }

    // Verificar que no contenga caracteres peligrosos
    if (
      sanitizedDomain.includes('..') ||
      sanitizedDomain.includes('@') ||
      sanitizedDomain.includes(' ')
    ) {
      return {
        valid: false,
        error: 'Dominio contiene caracteres no válidos',
      }
    }

    try {
      // Resolver IP del dominio
      const dns = require('dns').promises
      let resolvedIPs: string[] = []

      try {
        const ipv4Addresses = await dns.resolve4(sanitizedDomain)
        resolvedIPs.push(...ipv4Addresses)
      } catch {
        // IPv4 falló, intentar IPv6
      }

      try {
        const ipv6Addresses = await dns.resolve6(sanitizedDomain)
        resolvedIPs.push(...ipv6Addresses)
      } catch {
        // IPv6 falló también
      }

      // Si no se pudo resolver ninguna IP, es sospechoso
      if (resolvedIPs.length === 0) {
        return {
          valid: false,
          error: 'No se pudo resolver el dominio',
        }
      }

      // Verificar que ninguna IP esté en rangos prohibidos
      for (const ip of resolvedIPs) {
        for (const prohibitedRange of this.PROHIBITED_IP_RANGES) {
          if (prohibitedRange.test(ip)) {
            return {
              valid: false,
              error: 'El dominio resuelve a una IP privada o prohibida',
            }
          }
        }
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: 'Error al resolver el dominio',
      }
    }
  }

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
      // Validar seguridad del dominio antes de hacer petición
      const securityValidation = await this.validateDomainSecurity(domain)
      if (!securityValidation.valid) {
        SecureLogger.warn(
          'HTTP validation blocked for domain %s: %s',
          domain,
          securityValidation.error
        )
        return false
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.HTTP_TIMEOUT_MS)

      // Usar el dominio sanitizado
      const sanitizedDomain = domain.trim().toLowerCase()

      // Construir URL de manera segura
      const validationURL = `http://${sanitizedDomain}/.well-known/fasttify-validation.txt`

      const response = await fetch(validationURL, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Fasttify-Domain-Validator/1.0',
          'Cache-Control': 'no-cache',
        },
        // Configuraciones adicionales de seguridad
        redirect: 'manual', // No seguir redirects automáticamente
      })

      clearTimeout(timeoutId)

      // Solo aceptar respuestas 200, no redirects
      if (response.status === 200) {
        const content = await response.text()
        // Limitar tamaño de respuesta para prevenir ataques de memoria
        if (content.length > 1000) {
          return false
        }
        const isValid = content.trim() === validationToken
        return isValid
      }

      return false
    } catch (error) {
      // No logear el error completo para evitar información sensible
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
