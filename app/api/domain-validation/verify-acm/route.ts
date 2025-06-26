import { NextRequest, NextResponse } from 'next/server'
import { CertificateManager } from '@/lib/services/ssl/certificate-manager'
import { getNextCorsHeaders } from '@/lib/utils/next-cors'

const certificateManager = new CertificateManager()

export async function OPTIONS(req: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(req)
  return new Response(null, { status: 204, headers: corsHeaders })
}

export async function POST(req: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(req)
  try {
    const { certificateArn } = await req.json()

    if (!certificateArn) {
      return NextResponse.json(
        { error: 'Certificate ARN is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Verificar si el certificado está listo
    const isReady = await certificateManager.isCertificateReady(certificateArn)

    // Obtener información completa del certificado
    const certificateInfo = await certificateManager.getCertificateInfo(certificateArn)

    if (!certificateInfo) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      {
        success: true,
        isReady,
        certificateArn,
        status: certificateInfo.status,
        validationRecords: certificateInfo.validationRecords,
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Error verifying ACM certificate:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
