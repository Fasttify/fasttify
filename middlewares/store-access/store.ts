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
import { NextRequest, NextResponse } from 'next/server';

const STORE_LIMITS = {
  Imperial: 5,
  Majestic: 3,
  Royal: 1,
};

async function hasValidPlan(session: AuthSession) {
  const userPlan = session.tokens?.idToken?.payload?.['custom:plan'] as string | undefined;
  const allowedPlans = ['Royal', 'Majestic', 'Imperial'];
  return userPlan && allowedPlans.includes(userPlan);
}

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
  // Verificar autenticación usando el middleware centralizado
  const authResponse = await handleAuthenticationMiddleware(request, response);
  if (authResponse) {
    return authResponse; // Si hay redirección de auth, retornarla
  }

  // Obtener la sesión del usuario (ya validada)
  const session = await getSession(request, response, false);

  const userId = (session as AuthSession).tokens?.idToken?.payload?.['cognito:username'];
  const userPlan = (session as AuthSession).tokens?.idToken?.payload?.['custom:plan'];
  const hasValidSubscription = await hasValidPlan(session as AuthSession);

  if (!hasValidSubscription) {
    return NextResponse.redirect(new URL('/pricing', request.url));
  }

  const path = request.nextUrl.pathname;
  const { hasStores, canCreateMore } = await checkStoreLimit(userId as string, userPlan as string);

  if (path === '/first-steps') {
    if (hasStores && !canCreateMore) {
      return NextResponse.redirect(new URL('/my-store', request.url));
    }
  }

  if (path === '/my-store') {
    if (!hasStores) {
      return NextResponse.redirect(new URL('/first-steps', request.url));
    }
  }

  return response;
}
