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
import { postConfirmTheme, getConfirmStatus } from '@/api/stores/_lib/themes/controllers/confirm-controller';
import { NextRequest } from 'next/server';

/**
 * POST /api/stores/[storeId]/themes/confirm
 * Confirma y almacena un tema procesado - responde inmediatamente con 202
 */
export const POST = withAuthHandler(
  async (request: NextRequest, { storeId }) => {
    return postConfirmTheme(request, storeId);
  },
  {
    requireStoreOwnership: true,
    storeIdSource: 'params',
    storeIdParamName: 'storeId',
  }
);

/**
 * GET /api/stores/[storeId]/themes/confirm?processId=XYZ
 * Devuelve el estado del proceso de confirmación
 */
export const GET = withAuthHandler(
  async (request: NextRequest, { storeId }) => {
    return getConfirmStatus(request, storeId);
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
