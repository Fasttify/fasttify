/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/token';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';

export async function getVerifySession(request: NextRequest) {
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
