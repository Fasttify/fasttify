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

import { AuthGetCurrentUserServer, AuthFetchUserAttributesServer } from '@/utils/client/AmplifyUtils';
import { getLastVisitedStore } from '@/lib/cookies/last-store';
import { NextRequest, NextResponse } from 'next/server';
import NodeCache from 'node-cache';

export interface AuthSession {
  tokens?: {
    idToken?: {
      payload?: {
        'cognito:username'?: string;
        'custom:plan'?: string;
        email?: string;
        nickname?: string;
      };
    };
  };
}

const sessionCache = new NodeCache({
  stdTTL: 300, // 5 minutos
  checkperiod: 60, // Verifica cada minuto
  useClones: false,
});

// Cache separado para userAttributes con TTL más corto (datos críticos)
const userAttributesCache = new NodeCache({
  stdTTL: 60, // 1 minuto para userAttributes
  checkperiod: 30, // Verifica cada 30 segundos
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

/**
 * Limpia todo el caché de sesiones
 * Útil para tests
 */
export function clearAllSessionCache(): void {
  sessionCache.flushAll();
  userAttributesCache.flushAll();
}

/**
 * Invalida el cache de un usuario específico
 * Útil cuando se actualiza el plan del usuario
 */
export function invalidateUserCache(userId: string): void {
  const sessionKeys = sessionCache.keys();
  const attributeKeys = userAttributesCache.keys();

  // Buscar y eliminar todas las claves de cache para este usuario
  sessionKeys.forEach((key) => {
    if (key.includes(userId)) {
      sessionCache.del(key);
    }
  });

  attributeKeys.forEach((key) => {
    if (key.includes(userId)) {
      userAttributesCache.del(key);
    }
  });
}

function getCacheKey(request: NextRequest): string {
  const cookies = request.headers?.get('cookie') || '';

  // Buscar el ID de usuario en las cookies para crear una clave estable
  const userIdMatch = cookies.match(/CognitoIdentityServiceProvider[^=]*=([^;]+)/);
  if (userIdMatch) {
    return `user-${userIdMatch[1]}`;
  }

  // Buscar cualquier cookie de Cognito para crear una clave única
  const cognitoMatch = cookies.match(/CognitoIdentityServiceProvider[^=]*=([^;]+)/);
  if (cognitoMatch) {
    return `cognito-${cognitoMatch[1]}`;
  }

  // Buscar cookies de AWS Amplify (formato alternativo)
  const amplifyMatch = cookies.match(/aws-amplify[^=]*=([^;]+)/);
  if (amplifyMatch) {
    return `amplify-${amplifyMatch[1]}`;
  }

  // Si no hay cookies de Cognito, usar un hash de todas las cookies para evitar conflictos
  if (cookies) {
    // Crear un hash simple pero único basado en el contenido de las cookies
    let hash = 0;
    for (let i = 0; i < cookies.length; i++) {
      const char = cookies.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convertir a 32bit integer
    }
    return `cookies-${Math.abs(hash)}`;
  }

  return 'no-auth';
}

export async function getSession(request: NextRequest, _response: NextResponse) {
  const cacheKey = getCacheKey(request);

  // Verificar cache
  const cached = sessionCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const currentUser = await AuthGetCurrentUserServer();

    // Si no hay usuario, limpiar caché
    if (!currentUser) {
      sessionCache.del(cacheKey);
      userAttributesCache.del(cacheKey);
      return null;
    }

    // Verificar cache de userAttributes primero (datos críticos)
    let userAttributes: Record<string, any> | undefined = userAttributesCache.get(cacheKey);
    if (!userAttributes) {
      const fetchedAttributes = await AuthFetchUserAttributesServer();
      if (fetchedAttributes) {
        userAttributes = fetchedAttributes;
        userAttributesCache.set(cacheKey, userAttributes);
      }
    }

    // Crear objeto de sesión compatible con el formato esperado
    const result = {
      tokens: {
        idToken: {
          payload: {
            'cognito:username': currentUser.username,
            'custom:plan': userAttributes?.['custom:plan'] || 'free',
            email: userAttributes?.email || currentUser.signInDetails?.loginId || '',
            nickname: userAttributes?.nickname || currentUser.username,
          },
        },
      },
    };

    // Guardar en cache solo si la sesión es válida
    sessionCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Error fetching user session:', error);

    // En producción, ser más permisivo con errores de red/temporales
    const isProduction = process.env.NODE_ENV === 'production';
    const isNetworkError =
      error instanceof Error &&
      (error.message.includes('network') ||
        error.message.includes('timeout') ||
        error.message.includes('ECONNRESET') ||
        error.message.includes('ENOTFOUND'));

    // Si es un error de red en producción, intentar usar caché existente
    if (isProduction && isNetworkError) {
      const cached = sessionCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Limpiar caché en caso de error
    sessionCache.del(cacheKey);
    return null;
  }
}

export async function handleAuthenticationMiddleware(request: NextRequest, response: NextResponse) {
  const session = await getSession(request, response);

  if (!session) {
    // Limpiar caché cuando no hay sesión válida
    clearUserSessionCache(request);
    return NextResponse.redirect(new URL('/login', request.url), { status: 302 });
  }

  return null; // Permitir que el middleware continúe
}

export async function handleAuthenticatedRedirectMiddleware(request: NextRequest, response: NextResponse) {
  // Verificar la sesión actual cuando el usuario navega manualmente a /login
  const session = await getSession(request, response);

  if (session && typeof session === 'object' && 'tokens' in session && session.tokens) {
    // Verificar que la sesión tiene tokens válidos antes de redirigir
    const lastStoreId = getLastVisitedStore(request);

    if (lastStoreId) {
      return NextResponse.redirect(new URL(`/store/${lastStoreId}/home`, request.url), { status: 302 });
    } else {
      return NextResponse.redirect(new URL('/my-store', request.url), { status: 302 });
    }
  }

  // Si no hay sesión válida, limpiar caché y permitir continuar (mostrar login)
  clearUserSessionCache(request);
  return response;
}
