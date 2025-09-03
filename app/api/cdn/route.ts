import { NextRequest, NextResponse } from 'next/server';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { AuthGetCurrentUserServer } from '@/utils/client/AmplifyUtils';
import { generateSignedUrl } from '@/utils/server/cloudfront-signed-urls';

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);

  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400, headers: corsHeaders });
    }

    // Determinar tipo y expiración según la carpeta
    let expiresInMinutes: number;
    let requiresAuth = false;

    if (path.startsWith('templates/')) {
      expiresInMinutes = 7 * 24 * 60; // 7 días
      requiresAuth = false; // Público firmado por la app
    } else if (path.startsWith('profile-pictures/')) {
      expiresInMinutes = 30 * 24 * 60; // 30 días
      requiresAuth = true; // Privado firmado por el usuario
    } else if (path.startsWith('store-logos/') || path.startsWith('products/') || path.startsWith('assets/')) {
      expiresInMinutes = 30 * 24 * 60; // 30 días
      requiresAuth = false; // Público firmado por la app
    } else if (path.startsWith('base-templates/')) {
      expiresInMinutes = 7 * 24 * 60; // 7 días
      requiresAuth = false; // Privado firmado por el usuario
    } else {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400, headers: corsHeaders });
    }

    // Verificar autenticación si es requerida
    if (requiresAuth) {
      const session = await AuthGetCurrentUserServer();
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }
    }

    // Generar URL firmada
    const signedUrl = await generateSignedUrl(path, expiresInMinutes);

    return NextResponse.json({ url: signedUrl }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error generating secure URL:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
