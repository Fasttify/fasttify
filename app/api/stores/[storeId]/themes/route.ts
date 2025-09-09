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

import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { withAuthHandler } from '@/api/_lib/auth-middleware';
import { listThemes } from '@/api/stores/_lib/themes/controllers/list-controller';
import { activateTheme } from '@/api/stores/_lib/themes/controllers/activate-controller';
import { deleteTheme } from '@/api/stores/_lib/themes/controllers/delete-controller';
import { NextRequest } from 'next/server';

/**
 * GET /api/stores/[storeId]/themes
 * Lista todos los temas de una tienda
 */
export const GET = withAuthHandler(
  async (request: NextRequest, { storeId }) => {
    return listThemes(request, storeId);
  },
  {
    requireStoreOwnership: true,
    storeIdSource: 'params',
    storeIdParamName: 'storeId',
  }
);

/**
 * PATCH /api/stores/[storeId]/themes
 * Activa o desactiva un tema
 */
export const PATCH = withAuthHandler(
  async (request: NextRequest, { storeId }) => {
    return activateTheme(request, storeId);
  },
  {
    requireStoreOwnership: true,
    storeIdSource: 'params',
    storeIdParamName: 'storeId',
  }
);

/**
 * DELETE /api/stores/[storeId]/themes
 * Elimina un tema
 */
export const DELETE = withAuthHandler(
  async (request: NextRequest, { storeId }) => {
    return deleteTheme(request, storeId);
  },
  {
    requireStoreOwnership: true,
    storeIdSource: 'params',
    storeIdParamName: 'storeId',
  }
);

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  return new Response(null, { status: 204, headers: corsHeaders });
}
