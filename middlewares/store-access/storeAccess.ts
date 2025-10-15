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

/**
 * Middleware para proteger las rutas de tienda
 * Verifica que el usuario tenga acceso a la tienda solicitada y un plan de suscripción válido
 */
export async function handleStoreAccessMiddleware(request: NextRequest) {
  // Extraer el ID de la tienda de la URL
  const path = request.nextUrl.pathname;

  // Verificar autenticación usando el middleware centralizado
  const authResponse = await handleAuthenticationMiddleware(request, NextResponse.next());
  if (authResponse) {
    return authResponse; // Si hay redirección de auth, retornarla
  }

  // Obtener la sesión del usuario (ya validada)
  const session = await getSession(request, NextResponse.next(), false);

  // Obtener el ID del usuario y plan desde la sesión
  const userId = (session as AuthSession).tokens?.idToken?.payload?.['cognito:username'];
  const userPlan = (session as AuthSession).tokens?.idToken?.payload?.['custom:plan'] as string | undefined;

  if (!userId) {
    return NextResponse.redirect(new URL('/login', request.url), { status: 302 });
  }

  // Si es ruta de checkout, verificar que el usuario tenga el perfil correcto Y sea dueño de la tienda
  if (path.includes('/access_account/checkout')) {
    // Extraer el storeId de la URL
    const storeIdMatch = path.match(/\/store\/([^\/]+)/);
    if (!storeIdMatch || !storeIdMatch[1]) {
      return NextResponse.redirect(new URL('/my-store', request.url), { status: 302 });
    }

    const requestedStoreId = storeIdMatch[1];

    // Si tiene plan válido, no debe estar aquí
    const validPlans = ['Royal', 'Majestic', 'Imperial'];
    if (userPlan && validPlans.includes(userPlan)) {
      return NextResponse.redirect(new URL(`/store/${requestedStoreId}/home`, request.url), { status: 302 });
    }

    // Verificar que la tienda pertenece al usuario (CRÍTICO para seguridad)
    try {
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

      if (!stores || stores.length === 0) {
        return NextResponse.redirect(new URL('/my-store', request.url), { status: 302 });
      }
    } catch (error) {
      console.error('Error verifying store ownership for checkout:', error);
      return NextResponse.redirect(new URL('/my-store', request.url), { status: 302 });
    }

    return NextResponse.next();
  }

  // Excluir otras rutas de checkout
  if (path.includes('/checkout')) {
    return NextResponse.next();
  }

  const storeIdMatch = path.match(/\/store\/([^\/]+)/);

  if (!storeIdMatch || !storeIdMatch[1]) {
    return NextResponse.redirect(new URL('/my-store', request.url), { status: 302 });
  }

  const requestedStoreId = storeIdMatch[1];

  // Verificar plan de suscripción
  const validPlans = ['Royal', 'Majestic', 'Imperial'];

  if (!userPlan || !validPlans.includes(userPlan)) {
    // Usuario con plan 'free' o sin plan - verificar si tiene suscripción en DB
    try {
      const { data: subscriptions } = await cookiesClient.models.UserSubscription.listUserSubscriptionByUserId({
        userId,
      });

      if (subscriptions && subscriptions.length > 0) {
        // Tiene suscripción en DB pero plan 'free' - necesita reactivar
        return NextResponse.redirect(new URL(`/store/${requestedStoreId}/access_account/checkout`, request.url), {
          status: 302,
        });
      } else {
        // No tiene suscripción - usuario nuevo - redirigir a última tienda
        const lastStoreId = getLastVisitedStore(request);
        if (lastStoreId) {
          return NextResponse.redirect(new URL(`/store/${lastStoreId}/access_account/checkout`, request.url), {
            status: 302,
          });
        } else {
          return NextResponse.redirect(new URL('/my-store', request.url), { status: 302 });
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      // En caso de error, redirigir a última tienda
      const lastStoreId = getLastVisitedStore(request);
      if (lastStoreId) {
        return NextResponse.redirect(new URL(`/store/${lastStoreId}/access_account/checkout`, request.url), {
          status: 302,
        });
      } else {
        return NextResponse.redirect(new URL('/my-store', request.url), { status: 302 });
      }
    }
  }

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
      return NextResponse.redirect(new URL('/my-store', request.url), { status: 302 });
    }

    // Si todo está bien (plan válido y tienda pertenece al usuario), permitir el acceso
    return NextResponse.next();
  } catch (error) {
    console.error('Error verifying store access:', error);
    return NextResponse.redirect(new URL('/my-store', request.url), { status: 302 });
  }
}
