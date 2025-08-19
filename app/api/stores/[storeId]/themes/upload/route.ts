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
import { logger } from '@/renderer-engine/lib/logger';
import { TemplateAnalysis } from '@/renderer-engine/services/templates/analysis/template-analyzer';
import { ThemeProcessor, ThemeValidator } from '@/renderer-engine/services/themes';
import { AuthGetCurrentUserServer, cookiesClient } from '@/utils/client/AmplifyUtils';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/stores/[storeId]/themes/upload
 * Sube y valida un tema personalizado
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const { storeId } = await params;
    logger.info('Theme upload request received', { storeId }, 'ThemeUploadAPI');

    // Verificar autenticación
    const session = await AuthGetCurrentUserServer();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    // 1. Verificar que el store existe
    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400, headers: corsHeaders });
    }

    // Buscar la tienda (UserStore) para verificación de propiedad
    const { data: userStore } = await cookiesClient.models.UserStore.get({
      storeId,
    });
    if (!userStore) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404, headers: corsHeaders });
    }

    // Verificar propiedad
    if (userStore.userId !== session.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders });
    }

    // 2. Obtener datos del formulario
    const formData = await request.formData();
    const themeFile = formData.get('theme') as File;
    const themeName = formData.get('name') as string;
    const themeDescription = formData.get('description') as string;

    // 3. Validar archivo
    if (!themeFile) {
      return NextResponse.json({ error: 'Theme file is required' }, { status: 400, headers: corsHeaders });
    }

    // Validar tipo de archivo
    if (!themeFile.name.endsWith('.zip')) {
      return NextResponse.json(
        { error: 'Theme must be uploaded as a ZIP file' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validar tamaño
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (themeFile.size > maxSize) {
      return NextResponse.json(
        {
          error: 'Theme file too large',
          details: `Maximum size is ${maxSize / 1024 / 1024}MB`,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    logger.info(
      'Theme file validated',
      {
        fileName: themeFile.name,
        fileSize: themeFile.size,
      },
      'ThemeUploadAPI'
    );

    // 4. Procesar tema
    const processor = ThemeProcessor.getInstance();
    const processedTheme = await processor.processThemeFile(themeFile, storeId);

    // 5. Validar tema usando el motor
    const validator = ThemeValidator.getInstance();
    const validation = await validator.validateThemeFiles(processedTheme.files, storeId);

    // 6. Actualizar tema con resultados de validación
    processedTheme.validation = validation;
    processedTheme.analysis = validation.analysis as TemplateAnalysis;

    // 7. Generar preview solo si no existe y la validación es exitosa
    if (validation.isValid && !processedTheme.preview) {
      processedTheme.preview = await processor.generatePreview(processedTheme);
    }

    // 8. Solo validar y procesar, no almacenar automáticamente
    // El almacenamiento se hará cuando el usuario confirme en la UI
    const storageResult = null;

    // 9. Preparar respuesta
    const response = {
      success: validation.isValid,
      theme: {
        id: processedTheme.id,
        name: processedTheme.name,
        version: processedTheme.version,
        author: processedTheme.author,
        description: processedTheme.description,
        fileCount: processedTheme.files.length,
        totalSize: processedTheme.totalSize,
        assetCount: processedTheme.assets.length,
        sectionCount: processedTheme.sections.length,
        templateCount: processedTheme.templates.length,
        preview: processedTheme.preview,
        // Incluir los archivos extraídos para el almacenamiento
        files: processedTheme.files,
        sections: processedTheme.sections,
        templates: processedTheme.templates,
        assets: processedTheme.assets,
        settings: processedTheme.settings,
        validation: processedTheme.validation,
        analysis: processedTheme.analysis,
        previewUrl: processedTheme.preview,
      },
      validation: {
        isValid: validation.isValid,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length,
        errors: validation.errors,
        warnings: validation.warnings,
      },
      analysis: processedTheme.analysis,
      storage: null,
    };

    logger.info(
      'Theme processing completed',
      {
        themeId: processedTheme.id,
        isValid: validation.isValid,
        errorCount: validation.errors.length,
      },
      'ThemeUploadAPI'
    );

    // 9. Si hay errores críticos, devolver error
    const criticalErrors = validation.errors.filter((e) => e.severity === 'critical');
    if (criticalErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Theme validation failed',
          details: response,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // 10. Si hay errores pero no críticos, devolver con advertencias
    if (validation.errors.length > 0) {
      return NextResponse.json(
        {
          warning: 'Theme uploaded with issues',
          details: response,
        },
        { status: 200, headers: corsHeaders }
      );
    }

    // 11. Éxito completo
    return NextResponse.json(response, { status: 200, headers: corsHeaders });
  } catch (error) {
    logger.error('Theme upload failed', error, 'ThemeUploadAPI');

    return NextResponse.json(
      {
        error: 'Theme upload failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * GET /api/stores/[storeId]/themes/upload
 * Obtiene información sobre el proceso de carga
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const { storeId } = await params;
    return NextResponse.json({
      message: 'Theme upload endpoint',
      storeId: storeId,
      supportedFormats: ['ZIP'],
      maxFileSize: '50MB',
      requiredFiles: ['layout/theme.liquid', 'templates/index.json', 'config/settings_schema.json'],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get upload info' }, { status: 500, headers: corsHeaders });
  }
}
