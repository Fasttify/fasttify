export interface DNSStatus {
  isConfigured: boolean;
  hasError: boolean;
  currentValue?: string;
  expectedValue: string;
  error?: string;
  recordType?: 'CNAME' | 'A' | 'NONE';
}

/**
 * Servicio especializado en verificación de configuración DNS para CloudFront
 */
export class DNSVerifier {
  private readonly CLOUDFRONT_IP_PATTERNS = [
    /^108\.139\./,
    /^18\.244\./,
    /^143\.204\./,
    /^13\.32\./,
    /^13\.35\./,
    /^13\.224\./,
    /^13\.249\./,
    /^52\.84\./,
    /^54\.230\./,
    /^54\.239\./,
    /^99\.86\./,
    /^204\.246\./,
    /^205\.251\./,
  ];

  /**
   * Verificar configuración DNS de un dominio para CloudFront
   */
  async verifyDNS(domain: string, expectedEndpoint?: string): Promise<DNSStatus> {
    try {
      const dns = require('dns').promises;

      // Primero intentar resolver CNAME
      try {
        const cnameRecords = await dns.resolveCname(domain);
        const currentValue = cnameRecords[0];

        if (expectedEndpoint) {
          // Verificar si apunta al endpoint específico
          const isConfigured = currentValue === expectedEndpoint;
          return {
            isConfigured,
            hasError: false,
            currentValue,
            expectedValue: expectedEndpoint,
            recordType: 'CNAME',
          };
        } else {
          // Verificar si apunta a cualquier endpoint de CloudFront
          const isCloudFrontEndpoint = /\.cloudfront\.net$/.test(currentValue);
          return {
            isConfigured: isCloudFrontEndpoint,
            hasError: false,
            currentValue,
            expectedValue: 'TENANT_ENDPOINT.cloudfront.net',
            recordType: 'CNAME',
          };
        }
      } catch (cnameError) {
        // Si no hay CNAME, verificar registros A
        try {
          const aRecords = await dns.resolve4(domain);
          const pointsToCloudFront = aRecords.some((ip: string) =>
            this.CLOUDFRONT_IP_PATTERNS.some((pattern) => pattern.test(ip))
          );

          return {
            isConfigured: pointsToCloudFront,
            hasError: false,
            currentValue: aRecords.join(', '),
            expectedValue: expectedEndpoint || 'CNAME to TENANT_ENDPOINT.cloudfront.net',
            recordType: 'A',
          };
        } catch (aError) {
          return {
            isConfigured: false,
            hasError: true,
            expectedValue: expectedEndpoint || 'CNAME to TENANT_ENDPOINT.cloudfront.net',
            error: 'Domain does not resolve',
            recordType: 'NONE',
          };
        }
      }
    } catch (error) {
      console.error('Error verifying DNS:', error);
      return {
        isConfigured: false,
        hasError: true,
        expectedValue: expectedEndpoint || 'CNAME to TENANT_ENDPOINT.cloudfront.net',
        error: error instanceof Error ? error.message : 'Unknown DNS error',
        recordType: 'NONE',
      };
    }
  }

  /**
   * Generar instrucciones de configuración DNS
   */
  generateDNSInstructions(domain: string, endpoint: string): string {
    return `
 Configuración DNS requerida para ${domain}:

 OPCIÓN RECOMENDADA - Registro CNAME:
   • Tipo: CNAME
   • Nombre: ${domain} (o @ si es dominio raíz)
   • Valor: ${endpoint}
   • TTL: 300 (5 minutos)

 IMPORTANTE:
   • Si usas un dominio raíz (ej: midominio.com), algunos proveedores no permiten CNAME
   • En ese caso, consulta con tu proveedor sobre alias/ANAME records
   • Los cambios DNS pueden tardar hasta 48 horas en propagarse completamente

 Verificar configuración:
   • Comando: dig CNAME ${domain}
   • Resultado esperado: ${endpoint}
    `.trim();
  }

  /**
   * Verificar múltiples dominios en paralelo
   */
  async verifyMultipleDomains(
    domains: Array<{ domain: string; expectedEndpoint?: string }>
  ): Promise<Record<string, DNSStatus>> {
    const results: Record<string, DNSStatus> = {};

    const verificationPromises = domains.map(async ({ domain, expectedEndpoint }) => {
      const result = await this.verifyDNS(domain, expectedEndpoint);
      results[domain] = result;
    });

    await Promise.all(verificationPromises);
    return results;
  }

  /**
   * Verificar si dominio está listo para CloudFront
   */
  async isDomainReadyForCloudFront(domain: string): Promise<boolean> {
    try {
      const status = await this.verifyDNS(domain);
      return status.isConfigured && !status.hasError;
    } catch {
      return false;
    }
  }

  /**
   * Obtener tipo de registro DNS actual
   */
  async getDNSRecordType(domain: string): Promise<'CNAME' | 'A' | 'NONE'> {
    try {
      const dns = require('dns').promises;

      try {
        await dns.resolveCname(domain);
        return 'CNAME';
      } catch {
        try {
          await dns.resolve4(domain);
          return 'A';
        } catch {
          return 'NONE';
        }
      }
    } catch {
      return 'NONE';
    }
  }

  /**
   * Generar diagnóstico completo de DNS
   */
  async generateDNSDiagnostic(domain: string, expectedEndpoint?: string): Promise<string> {
    const status = await this.verifyDNS(domain, expectedEndpoint);
    const recordType = await this.getDNSRecordType(domain);

    let diagnostic = ` Diagnóstico DNS para ${domain}:\n\n`;

    diagnostic += ` Estado actual:\n`;
    diagnostic += `   • Configurado correctamente: ${status.isConfigured ? ' Sí' : ' No'}\n`;
    diagnostic += `   • Tipo de registro: ${recordType}\n`;
    diagnostic += `   • Valor actual: ${status.currentValue || 'No encontrado'}\n`;
    diagnostic += `   • Valor esperado: ${status.expectedValue}\n\n`;

    if (status.hasError) {
      diagnostic += ` Error: ${status.error}\n\n`;
    }

    if (!status.isConfigured) {
      diagnostic += this.generateDNSInstructions(domain, expectedEndpoint || 'ENDPOINT.cloudfront.net');
    }

    return diagnostic;
  }
}
