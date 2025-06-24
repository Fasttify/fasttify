import {
  ACMClient,
  ListCertificatesCommand,
  RequestCertificateCommand,
  DescribeCertificateCommand,
} from '@aws-sdk/client-acm'
import { SecureLogger } from '@/lib/utils/secure-logger'
export interface CertificateInfo {
  arn: string
  status: 'ISSUED' | 'PENDING_VALIDATION' | 'FAILED'
  validationRecords?: Array<{
    name: string
    value: string
    type: string
  }>
}

export interface CertificateResult {
  success: boolean
  certificateArn?: string
  error?: string
  needsValidation?: boolean
  validationRecords?: Array<{
    name: string
    value: string
    type: string
  }>
}

/**
 * Servicio especializado en gestión de certificados SSL en AWS ACM
 */
export class CertificateManager {
  private acmClient: ACMClient

  constructor() {
    this.acmClient = new ACMClient({ region: 'us-east-1' })
  }

  /**
   * Buscar certificado existente para un dominio
   */
  async findExistingCertificate(domain: string): Promise<string | undefined> {
    try {
      const command = new ListCertificatesCommand({
        CertificateStatuses: ['ISSUED', 'PENDING_VALIDATION'],
      })

      const response = await this.acmClient.send(command)

      const certificate = response.CertificateSummaryList?.find(
        cert => cert.DomainName === domain || cert.SubjectAlternativeNameSummaries?.includes(domain)
      )

      return certificate?.CertificateArn
    } catch (error) {
      return undefined
    }
  }

  /**
   * Solicitar nuevo certificado SSL
   */
  async requestCertificate(domain: string): Promise<string | undefined> {
    try {
      const command = new RequestCertificateCommand({
        DomainName: domain,
        ValidationMethod: 'DNS',
      })

      const response = await this.acmClient.send(command)
      return response.CertificateArn
    } catch (error) {
      return undefined
    }
  }

  /**
   * Obtener información completa de certificado
   */
  async getCertificateInfo(certificateArn: string): Promise<CertificateInfo | undefined> {
    try {
      const command = new DescribeCertificateCommand({
        CertificateArn: certificateArn,
      })

      const response = await this.acmClient.send(command)
      const cert = response.Certificate

      if (!cert) {
        return undefined
      }

      const validationRecords =
        cert.DomainValidationOptions?.map(option => ({
          name: option.ResourceRecord?.Name || '',
          value: option.ResourceRecord?.Value || '',
          type: option.ResourceRecord?.Type || 'CNAME',
        })) || []

      return {
        arn: certificateArn,
        status: cert.Status as 'ISSUED' | 'PENDING_VALIDATION' | 'FAILED',
        validationRecords,
      }
    } catch (error) {
      return undefined
    }
  }

  /**
   * Verificar si certificado está listo para uso
   */
  async isCertificateReady(certificateArn: string): Promise<boolean> {
    try {
      const info = await this.getCertificateInfo(certificateArn)
      return info?.status === 'ISSUED'
    } catch (error) {
      return false
    }
  }

  /**
   * Obtener o crear certificado para dominio
   */
  async ensureCertificate(domain: string): Promise<CertificateResult> {
    try {
      // Buscar certificado existente primero
      const existingCert = await this.findExistingCertificate(domain)

      if (existingCert) {
        const info = await this.getCertificateInfo(existingCert)

        return {
          success: true,
          certificateArn: existingCert,
          needsValidation: info?.status === 'PENDING_VALIDATION',
          validationRecords: info?.validationRecords,
        }
      }

      // Crear nuevo certificado
      const newCertArn = await this.requestCertificate(domain)

      if (!newCertArn) {
        return {
          success: false,
          error: 'Failed to request new certificate',
        }
      }

      // Obtener información del nuevo certificado
      const info = await this.getCertificateInfo(newCertArn)

      return {
        success: true,
        certificateArn: newCertArn,
        needsValidation: true,
        validationRecords: info?.validationRecords,
      }
    } catch (error) {
      SecureLogger.error('Error ensuring certificate for domain %s:', domain, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}
