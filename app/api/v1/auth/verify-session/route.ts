import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/token';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    // Obtener token de cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 401, headers: corsHeaders });
    }

    // Verificar y decodificar el token
    const decoded = verifyAuthToken(token);

    if (!decoded || !decoded.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401, headers: corsHeaders });
    }

    // Retornar información del usuario
    return NextResponse.json(
      {
        success: true,
        user: {
          email: decoded.email,
          storeId: decoded.storeId || null,
        },
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('Error verifying session:', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
