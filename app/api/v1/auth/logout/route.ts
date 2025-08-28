import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    // Eliminar la cookie HttpOnly usando el método recomendado de Next.js
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');

    return NextResponse.json(
      {
        success: true,
        message: 'Logout successful',
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('Error during logout:', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
