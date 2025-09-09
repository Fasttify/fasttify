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
import { render } from '@react-email/render';
import { OrderAuthEmail } from '@/emails/templates/OrderAuthEmail';
import { generateOrderAccessToken } from '@/lib/auth/token';
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { sendEmail } from '@/lib/email/sendEmail';
import { z } from 'zod';

// Schema de validación
const sendTokenSchema = z.object({
  email: z.string().email('Email inválido'),
  storeId: z.string().optional(), // Para personalizar el email
});

export async function postSendToken(request: NextRequest) {
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
