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
import { NextRequest, NextResponse } from 'next/server';

export async function getSession(request: NextRequest, response: NextResponse, forceRefresh = true) {
  console.log(
    `🛡️ Middleware getSession: forceRefresh=${forceRefresh}, path=${request.nextUrl.pathname}, env=${process.env.NODE_ENV}`
  );
  return runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec, { forceRefresh });
        console.log(`🛡️ Middleware session result: hasTokens=${!!session.tokens}, forceRefresh=${forceRefresh}`);
        return session.tokens !== undefined ? session : null;
      } catch (error) {
        console.error('Error fetching user session:', error);
        return null;
      }
    },
  });
}

export async function handleAuthenticationMiddleware(request: NextRequest, response: NextResponse) {
  const session = await getSession(request, response);

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export async function handleAuthenticationMiddlewareNoRefresh(request: NextRequest, response: NextResponse) {
  console.log('🛡️ handleAuthenticationMiddlewareNoRefresh: Procesando ruta:', request.nextUrl.pathname);
  const session = await getSession(request, response, false); // forceRefresh: false

  console.log('🛡️ handleAuthenticationMiddlewareNoRefresh: Session result:', !!session);
  if (!session) {
    console.log('🛡️ handleAuthenticationMiddlewareNoRefresh: Sin sesión, redirigiendo a login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  console.log('🛡️ handleAuthenticationMiddlewareNoRefresh: Sesión válida, continuando');
  return response;
}

export async function handleAuthenticatedRedirectMiddleware(request: NextRequest, response: NextResponse) {
  console.log('🛡️ handleAuthenticatedRedirectMiddleware: Procesando ruta:', request.nextUrl.pathname);
  const session = await getSession(request, response, false); // forceRefresh: false para evitar conflictos

  console.log('🛡️ handleAuthenticatedRedirectMiddleware: Session result:', !!session);
  if (session) {
    console.log('🛡️ handleAuthenticatedRedirectMiddleware: Usuario autenticado, redirigiendo a /');
    return NextResponse.redirect(new URL('/', request.url));
  }

  console.log('🛡️ handleAuthenticatedRedirectMiddleware: Usuario no autenticado, continuando');
  return response;
}
