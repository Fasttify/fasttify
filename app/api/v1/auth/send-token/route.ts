import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { OrderAuthEmail } from '@/emails/OrderAuthEmail';
import { generateOrderAccessToken } from '@/lib/auth/token';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { sendEmail } from '@/lib/email/sendEmail';
import { z } from 'zod';

// Schema de validación
const sendTokenSchema = z.object({
  email: z.string().email('Email inválido'),
  storeId: z.string().optional(), // Para personalizar el email
});

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const body = await request.json();
    const { email, storeId } = sendTokenSchema.parse(body);

    // Generar JWT para acceso a órdenes (expira en 24 horas)
    const token = generateOrderAccessToken(email, storeId, '24h');

    // TODO: Opcional - Guardar referencia del token en base de datos para tracking
    // await logTokenGeneration({ email, tokenId: jwt.decode(token)?.jti, storeId });

    // Renderizar email con React Email
    const emailHtml = render(
      OrderAuthEmail({
        token,
        email,
        storeName: storeId ? 'Tu Tienda' : 'Fasttify',
      }) as React.ReactElement
    );

    // Enviar email
    await sendEmail({
      to: email,
      subject: 'Acceso a tus Órdenes - Fasttify',
      html: emailHtml,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Token sent successfully',
        data: {
          email,
          tokenType: 'JWT',
          expiresIn: '24h',
        },
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('Error in send-token:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400, headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
