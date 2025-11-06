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
import { saveTemplate } from '@/api/stores/_lib/themes/controllers/save-template-controller';
import { NextRequest, NextResponse } from 'next/server';
import type { TemplateType } from '@fasttify/theme-studio';

interface RouteParams {
  storeId: string;
  templateType: string;
}

interface RequestWithParams extends NextRequest {
  params?: RouteParams;
}

/**
 * PUT /api/stores/[storeId]/themes/templates/[templateType]
 * Guarda un template específico en S3
 */
export const PUT = withAuthHandler(
  async (request: NextRequest, { storeId }) => {
    // Los params ya están inyectados en el request por withAuthHandler
    const requestWithParams = request as RequestWithParams;
    const params = requestWithParams.params;

    if (!params || !params.templateType) {
      const corsHeaders = await getNextCorsHeaders(request);
      return NextResponse.json({ error: 'Missing templateType parameter' }, { status: 400, headers: corsHeaders });
    }

    const templateType = params.templateType as TemplateType;
    return saveTemplate(request, storeId, templateType);
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
