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

import { AuthGetCurrentUserServer } from '@/utils/client/AmplifyUtils';
import { getLastVisitedStore } from '@/lib/cookies/last-store';
import { debugAuthIssues, validateAmplifyConfig } from '@/lib/debug/auth-debug';
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

/**
 * Limpia el caché de sesiones para un usuario específico
 * Útil cuando se detectan problemas de autenticación
 */
export function clearUserSessionCache(request: NextRequest): void {
  const cacheKey = getCacheKey(request);
  sessionCache.del(cacheKey);
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

export async function getSession(request: NextRequest, response: NextResponse, forceRefresh = true) {
  const cacheKey = getCacheKey(request);
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    console.log('getSession called:', {
      cacheKey,
      forceRefresh,
      path: request.nextUrl.pathname,
    });
  }

  // Verificar cache si no es forceRefresh
  if (!forceRefresh) {
    const cached = sessionCache.get(cacheKey);
    if (cached) {
      if (isProduction) {
        console.log('Using cached session');
      }
      return cached;
    }
  }

  try {
    if (isProduction) {
      console.log('Getting current user from Cognito...');
    }

    const currentUser = await AuthGetCurrentUserServer();

    if (isProduction) {
      console.log('AuthGetCurrentUserServer result:', {
        hasUser: !!currentUser,
        username: currentUser?.username,
        userId: currentUser?.userId,
        signInDetails: currentUser?.signInDetails?.loginId,
      });
    }

    // Si no hay usuario, limpiar caché
    if (!currentUser) {
      if (isProduction) {
        console.log('No current user found, clearing cache');
      }
      sessionCache.del(cacheKey);
      return null;
    }

    // Crear objeto de sesión compatible con el formato esperado
    const result = {
      tokens: {
        idToken: {
          payload: {
            'cognito:username': currentUser.username,
            'custom:plan': currentUser.signInDetails?.loginId ? 'free' : undefined,
            email: currentUser.signInDetails?.loginId || '',
            nickname: currentUser.username,
          },
        },
      },
    };

    // Guardar en cache solo si la sesión es válida
    sessionCache.set(cacheKey, result);

    if (isProduction) {
      console.log('User session cached successfully');
    }

    return result;
  } catch (error) {
    console.error('Error fetching user session:', error);

    // En producción, ser más permisivo con errores de red/temporales
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
        console.log('Using cached session due to network error');
        return cached;
      }
    }

    // Limpiar caché en caso de error
    sessionCache.del(cacheKey);
    return null;
  }
}

export async function handleAuthenticationMiddleware(request: NextRequest, response: NextResponse) {
  const isProduction = process.env.NODE_ENV === 'production';

  // Log de entrada para debugging
  if (isProduction) {
    console.log('Auth middleware called:', {
      path: request.nextUrl.pathname,
      method: request.method,
      timestamp: new Date().toISOString(),
    });
  }

  // Validar configuración de Amplify en producción
  if (isProduction && !validateAmplifyConfig()) {
    console.error('Invalid Amplify configuration detected');
  }

  const session = await getSession(request, response);

  if (!session) {
    // Debug detallado en producción
    if (isProduction) {
      console.log('No session found, running debug...');
      debugAuthIssues(request);
    }

    // Limpiar caché cuando no hay sesión válida
    clearUserSessionCache(request);
    return NextResponse.redirect(new URL('/login', request.url), { status: 302 });
  }

  if (isProduction) {
    console.log('Session found, continuing...');
  }

  return null; // Permitir que el middleware continúe
}

export async function handleAuthenticatedRedirectMiddleware(request: NextRequest, response: NextResponse) {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    console.log('Authenticated redirect middleware called:', {
      path: request.nextUrl.pathname,
      timestamp: new Date().toISOString(),
    });
  }

  // Siempre forzar refresh para verificar la sesión actual, especialmente importante
  // cuando el usuario navega manualmente a /login
  const session = await getSession(request, response, true);

  if (session && typeof session === 'object' && 'tokens' in session && session.tokens) {
    if (isProduction) {
      console.log('User has valid session, redirecting...');
    }

    // Verificar que la sesión tiene tokens válidos antes de redirigir
    const lastStoreId = getLastVisitedStore(request);

    if (lastStoreId) {
      return NextResponse.redirect(new URL(`/store/${lastStoreId}/home`, request.url), { status: 302 });
    } else {
      return NextResponse.redirect(new URL('/my-store', request.url), { status: 302 });
    }
  }

  if (isProduction) {
    console.log('No valid session found, allowing login page');
  }

  // Si no hay sesión válida, limpiar caché y permitir continuar (mostrar login)
  clearUserSessionCache(request);
  return response;
}
