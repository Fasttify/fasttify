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

/**
 * Middleware para verificar que un usuario solo pueda acceder a páginas
 * que pertenecen a la tienda que está visualizando actualmente.
 *
 * Este middleware realiza las siguientes verificaciones:
 * 1. Comprueba si el usuario está autenticado
 * 2. Verifica que el usuario tenga acceso a la tienda (como propietario o colaborador)
 * 3. Para páginas existentes, verifica que pertenezcan a la tienda actual
 * 4. Permite acceso a la ruta "new" si el usuario tiene acceso a la tienda
 *
 * @param request - La solicitud HTTP entrante
 * @returns Respuesta HTTP apropiada según la verificación de propiedad
 */
export async function handlePagesOwnershipMiddleware(request: NextRequest) {
  // Verificar si esta es una redirección para evitar bucles
  const isRedirect = request.headers.get('x-redirect-check') === 'true';
  if (isRedirect) {
    return NextResponse.next();
  }

  // Verificar autenticación usando el middleware centralizado
  const authResponse = await handleAuthenticationMiddleware(request, NextResponse.next());
  if (authResponse) {
    return authResponse; // Si hay redirección de auth, retornarla
  }

  // Obtener la sesión del usuario (ya validada)
  const session = await getSession(request, NextResponse.next());

  const userId = (session as AuthSession).tokens?.idToken?.payload?.['cognito:username'];

  if (!userId || typeof userId !== 'string') {
    return NextResponse.redirect(new URL('/login', request.url), { status: 302 });
  }

  // Extraer información de la URL
  const path = request.nextUrl.pathname;
  const storeIdMatch = path.match(/\/store\/([^\/]+)/);
  const storeIdFromUrl = storeIdMatch ? storeIdMatch[1] : null;
  const currentStoreId = request.cookies.get('currentStore')?.value || storeIdFromUrl;

  if (!currentStoreId) {
    const redirectUrl = new URL('/my-store', request.url);
    const response = NextResponse.redirect(redirectUrl, { status: 302 });
    response.headers.set('x-redirect-check', 'true');
    return response;
  }

  try {
    // Verificar que el usuario tenga acceso a la tienda
    const storeResult = await cookiesClient.models.UserStore.get({
      storeId: currentStoreId,
    });

    // Si la tienda no existe o no pertenece al usuario, verificar si es colaborador
    if (!storeResult.data || storeResult.data.userId !== userId) {
      const userStoreResult = await cookiesClient.models.UserStore.listUserStoreByUserId(
        {
          userId: userId,
        },
        {
          filter: {
            storeId: { eq: currentStoreId },
          },
        }
      );

      if (!userStoreResult.data || userStoreResult.data.length === 0) {
        const redirectUrl = new URL('/my-store', request.url);
        const response = NextResponse.redirect(redirectUrl, { status: 302 });
        response.headers.set('x-redirect-check', 'true');
        return response;
      }
    }

    // Extraer el ID de la página de la URL
    const pageMatches = path.match(/\/pages\/([^\/]+)$/);
    const pageId = pageMatches ? pageMatches[1] : null;

    // Si es la ruta "new", permitir el acceso
    if (pageId === 'new') {
      return NextResponse.next();
    }

    // Si no hay ID de página o es una ruta especial, permitir el acceso
    if (!pageId) {
      return NextResponse.next();
    }

    // Para páginas existentes, verificar que pertenezcan a la tienda actual
    const { data: page } = await cookiesClient.models.Page.get({
      id: pageId,
    });

    if (!page) {
      const redirectUrl = new URL(`/store/${currentStoreId}/setup/pages`, request.url);
      const response = NextResponse.redirect(redirectUrl, { status: 302 });
      response.headers.set('x-redirect-check', 'true');
      return response;
    }

    if (page.storeId !== currentStoreId) {
      const redirectUrl = new URL(`/store/${currentStoreId}/setup/pages/${pageId}`, request.url);
      const response = NextResponse.redirect(redirectUrl, { status: 302 });
      response.headers.set('x-redirect-check', 'true');
      return response;
    }

    return NextResponse.next();
  } catch (_error) {
    const redirectUrl = new URL(`/my-store`, request.url);
    const response = NextResponse.redirect(redirectUrl, { status: 302 });
    response.headers.set('x-redirect-check', 'true');
    return response;
  }
}
