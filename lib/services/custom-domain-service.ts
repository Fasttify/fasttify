import { CertificateManager } from '@/lib/services/ssl/certificate-manager'
import { DomainValidator, DomainValidationResult } from '@/lib/services/domain/domain-validator'
import {
  CloudFrontTenantManager,
  CreateTenantParams,
  TenantStatus,
} from '@/lib/services/cloudfront/tenant-manager'
import { DNSVerifier, DNSStatus } from '@/lib/services/cloudfront/dns-verifier'

export interface CustomDomainSetupResult {
  success: boolean
  error?: string
  domain?: string
  tenantId?: string
  endpoint?: string
  certificateArn?: string
  dnsInstructions?: {
    type: string
    name: string
    value: string
    instructions: string
  }
}

export interface CustomDomainVerificationResult {
  success: boolean
  error?: string
  method?: 'dns' | 'http'
  certificateArn?: string
  certificateStatus?: 'ISSUED' | 'PENDING_VALIDATION' | 'FAILED'
  needsACMValidation?: boolean
  acmValidationRecords?: Array<{
    name: string
    value: string
    type: string
  }>
}

/**
 * Servicio principal (Facade) para gestión completa de dominios personalizados
 *
 * Integra todos los servicios especializados:
 * - Validación de dominios
 * - Gestión de certificados SSL
 * - Gestión de tenants CloudFront
 * - Verificación DNS
 */
export class CustomDomainService {
  private certificateManager: CertificateManager
  private domainValidator: DomainValidator
  private tenantManager: CloudFrontTenantManager
  private dnsVerifier: DNSVerifier

  constructor() {
    this.certificateManager = new CertificateManager()
    this.domainValidator = new DomainValidator()
    this.tenantManager = new CloudFrontTenantManager()
    this.dnsVerifier = new DNSVerifier()
  }

  /**
   * Generar token de validación para un dominio
   */
  async generateDomainValidationToken(domain: string): Promise<DomainValidationResult> {
    return this.domainValidator.initiateDomainValidation(domain)
  }

  /**
   * Verificar validación completa de dominio y preparar certificado SSL
   */
  async verifyDomainValidation(
    domain: string,
    validationToken: string
  ): Promise<CustomDomainVerificationResult> {
    try {
      // Paso 1: Verificar propiedad del dominio
      const domainValidation = await this.domainValidator.verifyDomainValidation(
        domain,
        validationToken
      )

      if (!domainValidation.success) {
        return {
          success: false,
          error: domainValidation.error,
        }
      }

      // Paso 2: Obtener o crear certificado SSL
      const certificateResult = await this.certificateManager.ensureCertificate(domain)

      if (!certificateResult.success) {
        return {
          success: false,
          error: certificateResult.error || 'Failed to ensure SSL certificate',
        }
      }

      return {
        success: true,
        method: domainValidation.method,
        certificateArn: certificateResult.certificateArn,
        certificateStatus: certificateResult.needsValidation ? 'PENDING_VALIDATION' : 'ISSUED',
        needsACMValidation: certificateResult.needsValidation,
        acmValidationRecords: certificateResult.validationRecords,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error verifying domain',
      }
    }
  }

  /**
   * Configurar dominio personalizado completo (crear tenant CloudFront)
   */
  async setupCustomDomain(
    domain: string,
    storeId: string,
    origin: string = 'main.d1wc36cp4amanq.amplifyapp.com'
  ): Promise<CustomDomainSetupResult> {
    try {
      // Verificar que el dominio esté validado
      if (!this.domainValidator.isDomainValidated(domain)) {
        return {
          success: false,
          error: 'Domain must be validated before creating tenant',
        }
      }

      // Verificar certificado SSL
      const certificateResult = await this.certificateManager.ensureCertificate(domain)

      if (!certificateResult.success || !certificateResult.certificateArn) {
        return {
          success: false,
          error: 'Failed to ensure SSL certificate for domain',
        }
      }

      // Crear tenant en CloudFront
      const tenantName = this.domainValidator.generateTenantName(domain, storeId)

      const tenantParams: CreateTenantParams = {
        tenantName,
        domain,
        origin,
        certificateArn: certificateResult.certificateArn,
      }

      const tenantResult = await this.tenantManager.createTenant(tenantParams)

      if (!tenantResult.success) {
        return {
          success: false,
          error: tenantResult.error,
        }
      }

      // Generar instrucciones DNS
      const endpoint = tenantResult.endpoint?.[0]?.Domain || ''
      const dnsInstructions = this.dnsVerifier.generateDNSInstructions(domain, endpoint)

      return {
        success: true,
        domain,
        tenantId: tenantResult.tenantId,
        endpoint,
        certificateArn: certificateResult.certificateArn,
        dnsInstructions: {
          type: 'CNAME',
          name: domain,
          value: endpoint,
          instructions: dnsInstructions,
        },
      }
    } catch (error) {
      console.error(` Error setting up custom domain for ${domain}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Obtener estado de dominio personalizado
   */
  async getCustomDomainStatus(tenantId: string): Promise<TenantStatus> {
    return this.tenantManager.getTenantStatus(tenantId)
  }

  /**
   * Verificar configuración DNS de dominio
   */
  async verifyDNSConfiguration(domain: string, expectedEndpoint?: string): Promise<DNSStatus> {
    return this.dnsVerifier.verifyDNS(domain, expectedEndpoint)
  }

  /**
   * Eliminar dominio personalizado
   */
  async deleteCustomDomain(tenantId: string): Promise<boolean> {
    return this.tenantManager.deleteTenant(tenantId)
  }

  /**
   * Listar todos los dominios personalizados
   */
  async listCustomDomains() {
    return this.tenantManager.listTenants()
  }

  /**
   * Verificar si certificado está listo
   */
  async isCertificateReady(certificateArn: string): Promise<boolean> {
    return this.certificateManager.isCertificateReady(certificateArn)
  }

  /**
   * Generar diagnóstico completo de dominio
   */
  async generateDomainDiagnostic(domain: string, expectedEndpoint?: string): Promise<string> {
    return this.dnsVerifier.generateDNSDiagnostic(domain, expectedEndpoint)
  }

  /**
   * Validar reglas de dominio (formato, prohibiciones)
   */
  validateDomainRules(domain: string): { valid: boolean; error?: string } {
    return this.domainValidator.validateDomainRules(domain)
  }

  /**
   * Verificar si el sistema está configurado correctamente
   */
  async isSystemConfigured(): Promise<boolean> {
    return this.tenantManager.isMultiTenantConfigured()
  }
}
