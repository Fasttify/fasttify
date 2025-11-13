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
import { TemplateLoaderAdapter } from '@/app/api/stores/_lib/dev-server/infrastructure/adapters/template-loader.adapter';
import { logger } from '@/liquid-forge';
import type { TemplateType } from '@fasttify/theme-studio';

const templateLoader = new TemplateLoaderAdapter();

/**
 * Controller: Obtener template
 * Maneja la petición HTTP para obtener un template específico
 */
export async function getTemplate(
  request: NextRequest,
  storeId: string,
  templateType: TemplateType
): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);

  try {
    const template = await templateLoader.loadTemplate(storeId, templateType);

    return NextResponse.json(template, { status: 200, headers: corsHeaders });
  } catch (error) {
    logger.error('Error loading template', error, 'GetTemplateController');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load template' },
      { status: 500, headers: corsHeaders }
    );
  }
}
