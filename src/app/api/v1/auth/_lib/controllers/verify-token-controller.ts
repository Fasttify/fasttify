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
import { z } from 'zod';
import { verifyAuthToken, generateSessionToken } from '@/lib/auth/token';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';

// Schema de validación
const verifyTokenSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  email: z.string().email('Email inválido'),
});

export async function postVerifyToken(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);

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
        { status: 401, headers: corsHeaders }
      );
    }

    // Verificar que el email coincida
    if (tokenPayload.email !== email) {
      return NextResponse.json(
        {
          error: 'Token does not correspond to the provided email',
        },
        { status: 401, headers: corsHeaders }
      );
    }

    // Verificar que sea un token de acceso a órdenes
    if (tokenPayload.type !== 'order-access') {
      return NextResponse.json(
        {
          error: 'Invalid token type',
        },
        { status: 401, headers: corsHeaders }
      );
    }

    // Generar sesión JWT (expira en 2 horas)
    const sessionToken = generateSessionToken(email, '2h');

    // TODO: Opcional - Guardar referencia de la sesión en base de datos para tracking
    // await logSessionCreation({ email, sessionToken: jwt.decode(sessionToken)?.jti, storeId: tokenPayload.storeId });

    // Crear respuesta con cookie HttpOnly segura
    const response = NextResponse.json(
      {
        success: true,
        message: 'Token verified successfully',
        data: {
          email,
          storeId: tokenPayload.storeId,
          tokenType: 'JWT',
          expiresIn: '2h',
          redirectUrl: '/dashboard',
        },
      },
      {
        headers: corsHeaders,
      }
    );

    // Establecer cookie HttpOnly segura
    response.cookies.set('auth-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60, // 2 horas en segundos
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error in verify-token:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400, headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
