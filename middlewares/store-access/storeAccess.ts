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

import { getSession, type AuthSession } from '@/middlewares/auth/auth';
import { cookiesClient } from '@/utils/client/AmplifyUtils';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware para proteger las rutas de tienda
 * Verifica que el usuario tenga acceso a la tienda solicitada y un plan de suscripción válido
 */
export async function handleStoreAccessMiddleware(request: NextRequest) {
  // Obtener la sesión del usuario
  const session = await getSession(request, NextResponse.next(), false);
  // Verificar autenticación
  if (!session || !(session as AuthSession).tokens) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verificar plan de suscripción válido ANTES de verificar acceso a tienda
  const userPlan: string | undefined = (session as AuthSession).tokens?.idToken?.payload?.['custom:plan'] as
    | string
    | undefined;
  const allowedPlans = ['Royal', 'Majestic', 'Imperial'];

  if (!userPlan || !allowedPlans.includes(userPlan)) {
    return NextResponse.redirect(new URL('/pricing', request.url));
  }

  // Obtener el ID del usuario desde la sesión
  const userId = (session as AuthSession).tokens?.idToken?.payload?.['cognito:username'];

  if (!userId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Extraer el ID de la tienda de la URL
  const path = request.nextUrl.pathname;
  const storeIdMatch = path.match(/\/store\/([^\/]+)/);

  if (!storeIdMatch || !storeIdMatch[1]) {
    return NextResponse.redirect(new URL('/my-store', request.url));
  }

  const requestedStoreId = storeIdMatch[1];

  try {
    // Verificar si la tienda pertenece al usuario
    const { data: stores } = await cookiesClient.models.UserStore.listUserStoreByUserId(
      {
        userId: userId as string,
      },
      {
        filter: {
          storeId: { eq: requestedStoreId },
        },
        selectionSet: ['storeId'],
      }
    );

    // Si la tienda no pertenece al usuario, redirigir a my-store
    if (!stores || stores.length === 0) {
      return NextResponse.redirect(new URL('/my-store', request.url));
    }

    // Si todo está bien (plan válido y tienda pertenece al usuario), permitir el acceso
    return NextResponse.next();
  } catch (error) {
    console.error('Error verifying store access:', error);
    return NextResponse.redirect(new URL('/my-store', request.url));
  }
}
