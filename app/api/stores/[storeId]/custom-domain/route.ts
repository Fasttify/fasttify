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
import { getCustomDomainStatus } from '@/api/stores/_lib/custom-domain/controllers/get-controller';
import { postCustomDomain } from '@/api/stores/_lib/custom-domain/controllers/post-controller';
import { deleteCustomDomain } from '@/api/stores/_lib/custom-domain/controllers/delete-controller';
import { patchVerifyCustomDomain } from '@/api/stores/_lib/custom-domain/controllers/patch-controller';
import { NextRequest } from 'next/server';

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  return new Response(null, { status: 204, headers: corsHeaders });
}

// GET - Obtener estado del dominio personalizado
export const GET = withAuthHandler(
  async (request: NextRequest, { storeId }) => {
    return getCustomDomainStatus(request, storeId);
  },
  { requireStoreOwnership: true, storeIdSource: 'params', storeIdParamName: 'storeId' }
);

// POST - Configurar nuevo dominio personalizado
export const POST = withAuthHandler(
  async (request: NextRequest, { storeId }) => {
    return postCustomDomain(request, storeId);
  },
  { requireStoreOwnership: true, storeIdSource: 'params', storeIdParamName: 'storeId' }
);

// DELETE - Eliminar dominio personalizado
export const DELETE = withAuthHandler(
  async (request: NextRequest, { storeId }) => {
    return deleteCustomDomain(request, storeId);
  },
  { requireStoreOwnership: true, storeIdSource: 'params', storeIdParamName: 'storeId' }
);

// PATCH - Verificar estado del dominio
export const PATCH = withAuthHandler(
  async (request: NextRequest, { storeId }) => {
    return patchVerifyCustomDomain(request, storeId);
  },
  { requireStoreOwnership: true, storeIdSource: 'params', storeIdParamName: 'storeId' }
);
