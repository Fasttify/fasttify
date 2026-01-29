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
import { getSession, handleAuthenticationMiddleware, type AuthSession } from '@/middlewares/auth/auth';

export async function handleSubscriptionMiddleware(request: NextRequest, response: NextResponse) {
  // Verificar autenticación usando el middleware centralizado
  const authResponse = await handleAuthenticationMiddleware(request, response);
  if (authResponse) {
    return authResponse; // Si hay redirección de auth, retornarla
  }

  // Obtener la sesión del usuario (ya validada)
  const session = await getSession(request, response);

  const userPlan: string | undefined = (session as AuthSession).tokens?.idToken?.payload?.['custom:plan'] as
    | string
    | undefined;
  const allowedPlans = ['Royal', 'Majestic', 'Imperial'];

  if (!userPlan || !allowedPlans.includes(userPlan)) {
    return NextResponse.redirect(new URL('/checkout', request.url), { status: 302 });
  }

  return response;
}
