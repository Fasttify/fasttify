// Servicios principales exportados de forma modular
export { CloudFrontTenantManager } from '@/lib/services/cloudfront/tenant-manager'
export { DNSVerifier } from '@/lib/services/cloudfront/dns-verifier'
export { CertificateManager } from '@/lib/services/ssl/certificate-manager'
export { DomainValidator } from '@/lib/services/domain/domain-validator'
export { TokenGenerator } from '@/lib/services/domain/token-generator'
export { DNSHTTPVerifier } from '@/lib/services/domain/dns-http-verifier'

// Servicio principal integrado (facade pattern)
export { CustomDomainService } from '@/lib/services/custom-domain-service'
