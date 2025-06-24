import { NextRequest, NextResponse } from 'next/server'
import { CertificateManager } from '@/lib/services/ssl/certificate-manager'

const certificateManager = new CertificateManager()

export async function POST(req: NextRequest) {
  try {
    const { certificateArn } = await req.json()

    if (!certificateArn) {
      return NextResponse.json({ error: 'Certificate ARN is required' }, { status: 400 })
    }

    // Verificar si el certificado está listo con reintentos de 5 segundos
    const startTime = Date.now()
    const maxDuration = 5000 // 5 segundos
    const retryInterval = 1000 // 1 segundo entre intentos

    let isReady = false
    let certificateInfo
    let lastError

    // Verificar múltiples veces durante 5 segundos
    while (Date.now() - startTime < maxDuration) {
      try {
        isReady = await certificateManager.isCertificateReady(certificateArn)
        certificateInfo = await certificateManager.getCertificateInfo(certificateArn)

        // Si el certificado está listo o encontramos la información, salir del loop
        if (isReady || certificateInfo) {
          break
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error'
      }

      // Esperar antes del siguiente intento si aún hay tiempo
      if (Date.now() - startTime < maxDuration - retryInterval) {
        await new Promise(resolve => setTimeout(resolve, retryInterval))
      }
    }

    if (!certificateInfo) {
      return NextResponse.json(
        {
          error: lastError || 'Certificate not found after multiple attempts',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      isReady,
      certificateArn,
      status: certificateInfo.status,
      validationRecords: certificateInfo.validationRecords,
    })
  } catch (error) {
    console.error('Error verifying ACM certificate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
