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
import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { AuthGetCurrentUserServer, cookiesClient } from '@/utils/client/AmplifyUtils';

export interface AuthContext {
  session: any;
  storeId: string;
  userStore: any;
  corsHeaders: Record<string, string>;
}

export interface AuthMiddlewareOptions {
  requireStoreOwnership?: boolean;
  storeIdSource?: 'params' | 'query' | 'body';
  storeIdParamName?: string;
}

function errorResponse(code: number, message: string, corsHeaders: Record<string, string>) {
  return NextResponse.json({ error: { code, message } }, { status: code, headers: corsHeaders });
}

/**
 * Middleware de autenticación que valida:
 * 1. Usuario autenticado
 * 2. Store existe
 * 3. Usuario es propietario del store (opcional)
 */
export async function withAuth(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<NextResponse | AuthContext> {
  const { requireStoreOwnership = true, storeIdSource = 'params', storeIdParamName = 'storeId' } = options;

  const corsHeaders = await getNextCorsHeaders(request);

  try {
    // 1. Verificar autenticación
    const session = await AuthGetCurrentUserServer();
    if (!session) {
      return errorResponse(401, 'Unauthorized', corsHeaders);
    }

    // 2. Extraer storeId según la fuente especificada
    let storeId: string;

    if (storeIdSource === 'params') {
      const params = (await (request as any).params) || {};
      storeId = params[storeIdParamName];
    } else if (storeIdSource === 'query') {
      const { searchParams } = new URL(request.url);
      storeId = searchParams.get(storeIdParamName) || '';
    } else if (storeIdSource === 'body') {
      const body = await request.clone().json();
      storeId = body[storeIdParamName];
    } else {
      return errorResponse(400, 'Invalid storeIdSource', corsHeaders);
    }

    if (!storeId) {
      return errorResponse(400, `${storeIdParamName} is required`, corsHeaders);
    }

    // 3. Verificar que el store existe
    const { data: userStore } = await cookiesClient.models.UserStore.get({ storeId });
    if (!userStore) {
      return errorResponse(404, 'Store not found', corsHeaders);
    }

    // 4. Verificar ownership (si es requerido)
    if (requireStoreOwnership && userStore.userId !== session.username) {
      return errorResponse(403, 'Forbidden - Store ownership required', corsHeaders);
    }

    return {
      session,
      storeId,
      userStore,
      corsHeaders,
    };
  } catch (error: any) {
    return errorResponse(500, error?.message || 'Authentication error', corsHeaders);
  }
}

/**
 * Wrapper para handlers que requieren autenticación
 */
export function withAuthHandler(
  handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>,
  options?: AuthMiddlewareOptions
) {
  return async (request: NextRequest, nextContext?: { params?: Record<string, string> }): Promise<NextResponse> => {
    // Inyectar params de Next.js en el request para que withAuth pueda leerlos
    if (nextContext && nextContext.params) {
      (request as any).params = nextContext.params;
    }

    const authResult = await withAuth(request, options);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    return handler(request, authResult);
  };
}
