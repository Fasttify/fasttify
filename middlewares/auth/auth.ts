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

import { runWithAmplifyServerContext } from '@/utils/client/AmplifyUtils';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { getLastVisitedStore } from '@/lib/cookies/last-store';
import { NextRequest, NextResponse } from 'next/server';
import NodeCache from 'node-cache';

export interface AuthSession {
  tokens?: {
    idToken?: {
      payload?: {
        'cognito:username'?: string;
        'custom:plan'?: string;
      };
    };
  };
}

const sessionCache = new NodeCache({
  stdTTL: 300, // 5 minutos
  checkperiod: 60, // Verifica cada minuto
  useClones: false,
});

/**
 * Limpia el caché de sesiones para un usuario específico
 * Útil cuando se detectan problemas de autenticación
 */
export function clearUserSessionCache(request: NextRequest): void {
  const cacheKey = getCacheKey(request);
  sessionCache.del(cacheKey);
}

function getCacheKey(request: NextRequest): string {
  // Usar un hash simple de las cookies principales de autenticación
  const cookies = request.headers?.get('cookie') || '';

  // Buscar el ID de usuario en las cookies para crear una clave estable
  const userIdMatch = cookies.match(/CognitoIdentityServiceProvider[^=]*=([^;]+)/);
  if (userIdMatch) {
    return `user-${userIdMatch[1]}`;
  }

  // Fallback: usar toda la cadena de cookies como clave
  return cookies ? `cookies-${cookies.length}` : 'no-auth';
}

export async function getSession(request: NextRequest, response: NextResponse, forceRefresh = true) {
  const cacheKey = getCacheKey(request);

  // Verificar cache si no es forceRefresh
  if (!forceRefresh) {
    const cached = sessionCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  return runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec, { forceRefresh });
        const result = session.tokens !== undefined ? session : null;

        // Limpiar caché si la sesión no es válida
        if (!result || !result.tokens) {
          sessionCache.del(cacheKey);
          return null;
        }

        // Guardar en cache solo si la sesión es válida
        sessionCache.set(cacheKey, result);

        return result;
      } catch (error) {
        console.error('Error fetching user session:', error);
        // Limpiar caché en caso de error
        sessionCache.del(cacheKey);
        return null;
      }
    },
  });
}

export async function handleAuthenticationMiddleware(request: NextRequest, response: NextResponse) {
  const session = await getSession(request, response);

  if (!session) {
    // Limpiar caché cuando no hay sesión válida
    clearUserSessionCache(request);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return null; // Permitir que el middleware continúe
}

export async function handleAuthenticatedRedirectMiddleware(request: NextRequest, response: NextResponse) {
  // Siempre forzar refresh para verificar la sesión actual, especialmente importante
  // cuando el usuario navega manualmente a /login
  const session = await getSession(request, response, true);

  if (session && typeof session === 'object' && 'tokens' in session && session.tokens) {
    // Verificar que la sesión tiene tokens válidos antes de redirigir
    const lastStoreId = getLastVisitedStore(request);

    if (lastStoreId) {
      return NextResponse.redirect(new URL(`/store/${lastStoreId}/home`, request.url));
    } else {
      return NextResponse.redirect(new URL('/my-store', request.url));
    }
  }

  // Si no hay sesión válida, limpiar caché y permitir continuar (mostrar login)
  clearUserSessionCache(request);
  return response;
}
