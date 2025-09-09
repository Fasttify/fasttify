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
import { postUploadTheme, getUploadInfo } from '@/api/stores/_lib/themes/controllers/upload-controller';
import { NextRequest } from 'next/server';

/**
 * POST /api/stores/[storeId]/themes/upload
 * Sube y valida un tema personalizado
 */
export const POST = withAuthHandler(
  async (request: NextRequest, { storeId }) => {
    return postUploadTheme(request, storeId);
  },
  {
    requireStoreOwnership: true,
    storeIdSource: 'params',
    storeIdParamName: 'storeId',
  }
);

/**
 * GET /api/stores/[storeId]/themes/upload
 * Obtiene información sobre el proceso de carga
 */
export const GET = withAuthHandler(
  async (request: NextRequest, { storeId }) => {
    return getUploadInfo(request, storeId);
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
