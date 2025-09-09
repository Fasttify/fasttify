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
import { TemplateProcessingController } from '@/api/stores/_lib/template/controllers/template-processing-controller';
import { ThemeValidationController } from '@/api/stores/_lib/template/controllers/theme-validation-controller';
import type { TemplateRequest, TemplateResponse } from '@/api/stores/template/types';

export async function createTemplate(request: NextRequest, storeId: string, username: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);

  try {
    // Parsear request body
    const body: TemplateRequest = await request.json();
    const { storeName, domain, storeData } = body;

    if (!storeName || !domain) {
      return NextResponse.json(
        { error: 'Missing required fields: storeName, domain' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Inicializar controladores
    const templateController = new TemplateProcessingController();
    const themeController = new ThemeValidationController();

    // Procesar plantilla: listar, copiar y generar URLs
    const { templateObjects, copyResults, templateUrls } = await templateController.processTemplate(storeId, {
      storeName,
      domain,
      storeData: storeData || {},
    });

    // Cargar archivos del tema y validar
    const themeFiles = await templateController.loadBaseTemplateAsThemeFiles(templateObjects);
    const { validation, themeInfo } = await themeController.validateAndExtractThemeInfo(themeFiles, storeId);

    // Resolver preview URL
    const previewUrl = templateController.findPreviewUrlFromTemplateUrls(templateUrls) || themeInfo.previewUrl || null;

    // Crear registro del tema en la DB
    try {
      await themeController.createThemeRecord(
        storeId,
        {
          storeName,
          domain,
          storeData: storeData || {},
        },
        themeFiles,
        validation,
        themeInfo,
        previewUrl,
        copyResults.length,
        username
      );
    } catch (dbError) {
      console.error('Failed to create theme record in DB:', dbError);
      // Continuar sin fallar la operación completa
    }

    // Preparar respuesta
    const response: TemplateResponse = {
      success: true,
      message: 'Template files copied to user store successfully',
      templateUrls,
      copiedFiles: copyResults.length,
      files: copyResults,
      validation: {
        isValid: validation.isValid,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length,
        errors: validation.errors,
        warnings: validation.warnings,
        theme: themeInfo,
      },
    };

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    console.error('Error copying template to user store:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
