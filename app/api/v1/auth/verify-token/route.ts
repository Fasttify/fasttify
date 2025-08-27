import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuthToken, generateSessionToken } from '@/lib/auth/token';

// Schema de validación
const verifyTokenSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  email: z.string().email('Email inválido'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email } = verifyTokenSchema.parse(body);

    // Verificar JWT
    const tokenPayload = verifyAuthToken(token);

    if (!tokenPayload) {
      return NextResponse.json(
        {
          error: 'Invalid token or expired token',
        },
        { status: 401 }
      );
    }

    // Verificar que el email coincida
    if (tokenPayload.email !== email) {
      return NextResponse.json(
        {
          error: 'Token does not correspond to the provided email',
        },
        { status: 401 }
      );
    }

    // Verificar que sea un token de acceso a órdenes
    if (tokenPayload.type !== 'order-access') {
      return NextResponse.json(
        {
          error: 'Invalid token type',
        },
        { status: 401 }
      );
    }

    // Generar sesión JWT (expira en 2 horas)
    const sessionToken = generateSessionToken(email, '2h');

    // TODO: Opcional - Guardar referencia de la sesión en base de datos para tracking
    // await logSessionCreation({ email, sessionToken: jwt.decode(sessionToken)?.jti, storeId: tokenPayload.storeId });

    // Construir URL de redirección
    const redirectUrl = tokenPayload.storeId
      ? `/dashboard?email=${encodeURIComponent(email)}&store=${encodeURIComponent(tokenPayload.storeId)}`
      : `/dashboard?email=${encodeURIComponent(email)}`;

    return NextResponse.json({
      success: true,
      message: 'Token verified successfully',
      data: {
        sessionToken,
        email,
        storeId: tokenPayload.storeId,
        tokenType: 'JWT',
        expiresIn: '2h',
        redirectUrl,
      },
    });
  } catch (error) {
    console.error('Error in verify-token:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
