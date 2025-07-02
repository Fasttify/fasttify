import { NextRequest, NextResponse } from 'next/server';
import { CustomDomainService } from '@/lib/services/custom-domain-service';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';

const customDomainService = new CustomDomainService();

export async function OPTIONS(req: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(req);
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(req);
  try {
    const { domain } = await req.json();

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400, headers: corsHeaders });
    }

    // Validar reglas de dominio (formato y prohibiciones)
    const validation = customDomainService.validateDomainRules(domain);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400, headers: corsHeaders });
    }

    // Generar token de validación
    const result = await customDomainService.generateDomainValidationToken(domain);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json(
      {
        success: true,
        domain,
        validationToken: result.validationToken,
        instructions: result.instructions,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error generating domain validation token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
