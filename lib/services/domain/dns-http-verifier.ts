import { SecureLogger } from '@/lib/utils/secure-logger'
import { SecurityConfig } from '@/lib/config/security-config'

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
   * Resolver dominio a dirección IP
   */
  private async resolveDomainToIP(domain: string): Promise<string[]> {
    try {
      const dns = require('dns').promises
      const addresses = await dns.resolve4(domain)
      return addresses
    } catch (error) {
      // Intentar IPv6 si IPv4 falla
      try {
        const dns = require('dns').promises
        const addresses = await dns.resolve6(domain)
        return addresses
      } catch (ipv6Error) {
        throw new Error(`Cannot resolve domain ${domain}`)
      }
    }
  }

  /**
   * Verificar si una IP está en rangos prohibidos
   */
  private isProhibitedIP(ip: string): boolean {
    return this.PROHIBITED_IP_RANGES.some(range => range.test(ip))
  }

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
      // Resolver IP del dominio usando el nuevo método
      const resolvedIPs = await this.resolveDomainToIP(sanitizedDomain)

      // Verificar que ninguna IP esté en rangos prohibidos
      for (const ip of resolvedIPs) {
        if (this.isProhibitedIP(ip)) {
          return {
            valid: false,
            error: `El dominio resuelve a una IP privada o prohibida: ${ip}`,
          }
        }
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Error al resolver el dominio',
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

      // Verificación adicional de IP en tiempo real antes de la petición
      try {
        const resolvedIPs = await this.resolveDomainToIP(domain)
        for (const ip of resolvedIPs) {
          if (this.isProhibitedIP(ip)) {
            SecureLogger.warn(
              'HTTP validation blocked for domain %s: resolved IP %s is prohibited',
              domain,
              ip
            )
            return false
          }
        }
      } catch (error) {
        SecureLogger.warn('Cannot resolve domain %s for HTTP validation: %s', domain, error)
        return false
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.HTTP_TIMEOUT_MS)

      // Usar el dominio sanitizado
      const sanitizedDomain = domain.trim().toLowerCase()

      // Construir URL de manera segura usando SecurityConfig
      const validationURL = SecurityConfig.buildSecureValidationURL(sanitizedDomain)
      if (!validationURL) {
        SecureLogger.warn('Failed to build secure validation URL for domain %s', sanitizedDomain)
        return false
      }

      // Verificación adicional de que la URL es segura
      if (!SecurityConfig.isSecureValidationURL(validationURL)) {
        SecureLogger.warn('Built URL failed security validation for domain %s', sanitizedDomain)
        return false
      }

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
