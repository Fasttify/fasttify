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
import { logger } from '@/liquid-forge';
import { SaveTemplateUseCase } from '@/api/stores/_lib/dev-server/application/use-cases/save-template.use-case';
import { TemplateLoaderAdapter } from '@/api/stores/_lib/dev-server/infrastructure/adapters/template-loader.adapter';
import type { TemplateType, Template } from '@fasttify/theme-studio';

interface SaveTemplateRequest {
  sections: Record<string, any>;
  order: string[];
}

/**
 * Controller: Guardar template
 * Maneja la petición HTTP para guardar un template
 */
export async function saveTemplate(
  request: NextRequest,
  storeId: string,
  templateType: TemplateType
): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);

  try {
    // 1. Parsear request body
    const body: SaveTemplateRequest = await request.json();
    const { sections, order } = body;

    if (!sections || typeof sections !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request: sections must be an object' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!Array.isArray(order)) {
      return NextResponse.json(
        { error: 'Invalid request: order must be an array' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 2. Construir template object
    const template: Template = {
      type: templateType,
      sections,
      order,
    };

    // 3. Inicializar use case
    const templateLoader = new TemplateLoaderAdapter();
    const saveTemplateUseCase = new SaveTemplateUseCase(templateLoader);

    // 4. Ejecutar caso de uso
    await saveTemplateUseCase.execute(storeId, templateType, template);

    // 5. Retornar respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: 'Template saved successfully',
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    logger.error('Error saving template', error, 'SaveTemplateController');

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Manejar errores de validación
    if (error instanceof Error && (error.message.includes('required') || error.message.includes('must be'))) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: errorMessage,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Manejar otros errores
    return NextResponse.json(
      {
        error: 'Failed to save template',
        message: errorMessage,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
