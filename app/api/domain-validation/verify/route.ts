import { NextRequest, NextResponse } from 'next/server'
import { CustomDomainService } from '@/lib/services/custom-domain-service'

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

    // Validar reglas de dominio
    const validation = customDomainService.validateDomainRules(domain)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Verificar formato del token
    if (!validationToken.startsWith('fasttify-validation-')) {
      return NextResponse.json({ error: 'Invalid validation token format' }, { status: 400 })
    }

    // Verificar validación del dominio y preparar certificado SSL
    const result = await customDomainService.verifyDomainValidation(domain, validationToken)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          suggestions: [
            'Verifica que el registro DNS TXT esté configurado correctamente',
            'Asegúrate de que el archivo HTTP esté accesible',
            'Espera unos minutos para la propagación DNS',
          ],
        },
        { status: 400 }
      )
    }

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
    console.error('Error verifying domain validation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
