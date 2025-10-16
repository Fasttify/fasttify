import { Checkout } from '@polar-sh/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { AuthGetCurrentUserServer } from '@/utils/client/AmplifyUtils';

/**
 * API Route para checkout usando adaptador de Polar
 * Requiere autenticación para acceder al checkout
 */

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación directamente
    const session = await AuthGetCurrentUserServer();
    if (!session) {
      const corsHeaders = await getNextCorsHeaders(request);
      return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders });
    }

    // Crear el adaptador de checkout con autenticación verificada
    const checkoutHandler = Checkout({
      accessToken: process.env.POLAR_ACCESS_TOKEN || '',
      successUrl: process.env.SUCCESS_URL || 'https://fasttify.com/first-steps',
      server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
      theme: 'dark',
    });

    // Ejecutar el handler del adaptador
    return await checkoutHandler(request);
  } catch (error) {
    console.error('Error in checkout route:', error);
    const corsHeaders = await getNextCorsHeaders(request);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
