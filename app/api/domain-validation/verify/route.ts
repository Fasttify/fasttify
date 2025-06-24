import { NextRequest, NextResponse } from 'next/server'
import { CustomDomainService } from '@/lib/services/custom-domain-service'
import { SecurityConfig } from '@/lib/config/security-config'
import { SecureLogger } from '@/lib/utils/secure-logger'

const customDomainService = new CustomDomainService()

export async function POST(req: NextRequest) {
  try {
    const { domain, validationToken } = await req.json()

    if (!domain || !validationToken) {
      return NextResponse.json(
        { error: 'Domain and validation token are required' },
        { status: 400 }
      )
    }

    // Validación de seguridad: verificar contra lista de dominios permitidos
    if (!SecurityConfig.isDomainAllowed(domain)) {
      SecureLogger.warn('Domain validation attempt blocked: domain not in allow-list %s', domain)
      return NextResponse.json(
        { error: SecurityConfig.getDomainNotAllowedMessage(domain) },
        { status: 400 }
      )
    }

    // Validar reglas de dominio (incluye validaciones SSRF)
    const validation = customDomainService.validateDomainRules(domain)
    if (!validation.valid) {
      SecureLogger.warn('Domain validation failed: %s for domain %s', validation.error, domain)
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Verificar formato del token
    if (!validationToken.startsWith('fasttify-validation-')) {
      SecureLogger.warn('Invalid validation token format for domain %s', domain)
      return NextResponse.json({ error: 'Invalid validation token format' }, { status: 400 })
    }

    // Verificar validación del dominio y preparar certificado SSL con reintentos de 5 segundos
    const startTime = Date.now()
    const maxDuration = 5000 // 5 segundos
    const retryInterval = 1000 // 1 segundo entre intentos

    let result
    let lastError

    // Verificar múltiples veces durante 5 segundos
    while (Date.now() - startTime < maxDuration) {
      try {
        result = await customDomainService.verifyDomainValidation(domain, validationToken)

        // Si la verificación fue exitosa, salir del loop
        if (result.success) {
          break
        }

        lastError = result.error
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error'
      }

      // Esperar antes del siguiente intento si aún hay tiempo
      if (Date.now() - startTime < maxDuration - retryInterval) {
        await new Promise(resolve => setTimeout(resolve, retryInterval))
      }
    }

    if (!result?.success) {
      SecureLogger.info(
        'Domain validation failed for %s after multiple attempts: %s',
        domain,
        lastError
      )
      return NextResponse.json(
        {
          success: false,
          error: lastError || 'Domain validation failed after multiple attempts',
          suggestions: [
            'Verifica que el registro DNS TXT esté configurado correctamente',
            'Asegúrate de que el archivo HTTP esté accesible',
            'Espera unos minutos para la propagación DNS',
          ],
        },
        { status: 400 }
      )
    }

    SecureLogger.info('Domain validation successful for %s via %s', domain, result.method)
    return NextResponse.json({
      success: true,
      domain,
      validationMethod: result.method,
      certificateArn: result.certificateArn,
      certificateStatus: result.certificateStatus,
      needsACMValidation: result.needsACMValidation,
      acmValidationRecords: result.acmValidationRecords,
      message: `Dominio ${domain} validado exitosamente mediante ${result.method === 'dns' ? 'DNS TXT' : 'archivo HTTP'}`,
    })
  } catch (error) {
    SecureLogger.error('Error verifying domain validation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
