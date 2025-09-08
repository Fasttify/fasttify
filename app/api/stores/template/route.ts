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
import { AuthGetCurrentUserServer } from '@/utils/client/AmplifyUtils';
import { NextRequest, NextResponse } from 'next/server';
import { TemplateService } from './services/template-service';
import { ThemeService } from './services/theme-service';
import type { TemplateRequest, TemplateResponse } from './types';

export async function POST(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);

  try {
    // 1. Validar autenticación
    const user = await AuthGetCurrentUserServer();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders });
    }

    // 2. Parsear request body
    const body: TemplateRequest = await request.json();
    const { storeId, storeName, domain, storeData } = body;

    if (!storeId || !storeName || !domain) {
      return NextResponse.json(
        { error: 'Missing required fields: storeId, storeName, domain' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Inicializar servicios
    const templateService = new TemplateService();
    const themeService = new ThemeService();

    // 4. Procesar plantilla: listar, copiar y generar URLs
    const { templateObjects, copyResults, templateUrls } = await templateService.processTemplate(storeId, {
      storeName,
      domain,
      storeData: storeData || {},
    });

    // 5. Cargar archivos del tema y validar
    const themeFiles = await templateService.loadBaseTemplateAsThemeFiles(templateObjects);
    const { validation, themeInfo } = await themeService.validateAndExtractThemeInfo(themeFiles, storeId);

    // 6. Resolver preview URL
    const previewUrl = templateService.findPreviewUrlFromTemplateUrls(templateUrls) || themeInfo.previewUrl || null;

    // 7. Crear registro del tema en la DB
    try {
      await themeService.createThemeRecord(
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
        user.username
      );
    } catch (dbError) {
      console.error('Failed to create theme record in DB:', dbError);
      // Continuar sin fallar la operación completa
    }

    // 8. Preparar respuesta
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
