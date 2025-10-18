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

import { getSession, handleAuthenticationMiddleware, type AuthSession } from '@/middlewares/auth/auth';
import { cookiesClient } from '@/utils/client/AmplifyUtils';
import { getLastVisitedStore } from '@/lib/cookies/last-store';
import { NextRequest, NextResponse } from 'next/server';

const STORE_LIMITS = {
  Imperial: 5,
  Majestic: 3,
  Royal: 1,
};

async function checkStoreLimit(userId: string, plan: string) {
  try {
    const { data: stores } = await cookiesClient.models.UserStore.listUserStoreByUserId({
      userId: userId,
    });

    const storeCount = stores?.length || 0;
    const limit = STORE_LIMITS[plan as keyof typeof STORE_LIMITS] || 0;

    return {
      hasStores: storeCount > 0,
      canCreateMore: storeCount < limit,
      storeCount,
      limit,
    };
  } catch (error) {
    console.error('Error checking stores:', error);
    return { hasStores: false, canCreateMore: false, storeCount: 0, limit: 0 };
  }
}

export async function handleStoreMiddleware(request: NextRequest, response: NextResponse) {
  const path = request.nextUrl.pathname;

  // Excluir rutas de checkout completamente - no validar nada
  if (path.includes('/access_account/checkout') || path.includes('/suscribe/select-plan')) {
    return response;
  }

  // Verificar autenticación usando el middleware centralizado
  const authResponse = await handleAuthenticationMiddleware(request, response);
  if (authResponse) {
    return authResponse; // Si hay redirección de auth, retornarla
  }

  // Obtener la sesión del usuario (ya validada) - sin refresh para rutas específicas
  const session = await getSession(request, response);

  const userId = (session as AuthSession).tokens?.idToken?.payload?.['cognito:username'];
  const userPlan = (session as AuthSession).tokens?.idToken?.payload?.['custom:plan'];

  if (!userId) {
    return NextResponse.redirect(new URL('/login', request.url), { status: 302 });
  }

  // Verificar plan de suscripción - misma lógica que storeAccess.ts
  const validPlans = ['Royal', 'Majestic', 'Imperial'];

  if (!userPlan || !validPlans.includes(userPlan)) {
    // Usuario con plan 'free' o sin plan - permitir acceso a /my-store para selección de planes
    if (path === '/my-store') {
      // Permitir acceso a /my-store para usuarios con plan free
      return response;
    }

    // Para otras rutas, verificar si tiene suscripción en DB
    try {
      const { data: subscriptions } = await cookiesClient.models.UserSubscription.listUserSubscriptionByUserId({
        userId,
      });

      if (subscriptions && subscriptions.length > 0) {
        // Tiene suscripción en DB pero plan 'free' - necesita reactivar
        const lastStoreId = getLastVisitedStore(request);
        if (lastStoreId) {
          return NextResponse.redirect(new URL(`/store/${lastStoreId}/access_account/checkout`, request.url), {
            status: 302,
          });
        } else {
          return NextResponse.redirect(new URL('/my-store', request.url), { status: 302 });
        }
      } else {
        // No tiene suscripción - redirigir a /my-store para selección de planes
        return NextResponse.redirect(new URL('/my-store', request.url), { status: 302 });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      // En caso de error, redirigir a /my-store
      return NextResponse.redirect(new URL('/my-store', request.url), { status: 302 });
    }
  }

  const { hasStores, canCreateMore } = await checkStoreLimit(userId as string, userPlan as string);

  if (path === '/first-steps') {
    if (hasStores && !canCreateMore) {
      return NextResponse.redirect(new URL('/my-store', request.url), { status: 302 });
    }
  }

  if (path === '/my-store') {
    if (!hasStores) {
      return NextResponse.redirect(new URL('/first-steps', request.url), { status: 302 });
    }
  }

  return response;
}
