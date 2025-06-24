import { NextRequest, NextResponse } from 'next/server'
import { CertificateManager } from '@/lib/services/ssl/certificate-manager'

const certificateManager = new CertificateManager()

export async function POST(req: NextRequest) {
  try {
    const { certificateArn } = await req.json()

    if (!certificateArn) {
      return NextResponse.json({ error: 'Certificate ARN is required' }, { status: 400 })
    }

    // Verificar si el certificado está listo
    const isReady = await certificateManager.isCertificateReady(certificateArn)

    // Obtener información completa del certificado
    const certificateInfo = await certificateManager.getCertificateInfo(certificateArn)

    if (!certificateInfo) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
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
