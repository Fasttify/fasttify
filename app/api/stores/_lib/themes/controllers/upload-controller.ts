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
import { logger } from '@/liquid-forge/lib/logger';
import { TemplateAnalysis } from '@/liquid-forge/services/templates/analysis/template-analyzer';
import { ThemeProcessor, ThemeValidator } from '@/liquid-forge/services/themes';
import { AuthGetCurrentUserServer, cookiesClient } from '@/utils/client/AmplifyUtils';

export async function postUploadTheme(request: NextRequest, storeId: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const session = await AuthGetCurrentUserServer();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400, headers: corsHeaders });
    }

    const { data: userStore } = await cookiesClient.models.UserStore.get({ storeId });
    if (!userStore) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404, headers: corsHeaders });
    }
    if (userStore.userId !== session.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders });
    }

    const formData = await request.formData();
    const themeFile = formData.get('theme') as File;

    if (!themeFile) {
      return NextResponse.json({ error: 'Theme file is required' }, { status: 400, headers: corsHeaders });
    }
    if (!themeFile.name.endsWith('.zip')) {
      return NextResponse.json(
        { error: 'Theme must be uploaded as a ZIP file' },
        { status: 400, headers: corsHeaders }
      );
    }

    const maxSize = 50 * 1024 * 1024;
    if (themeFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Theme file too large', details: `Maximum size is ${maxSize / 1024 / 1024}MB` },
        { status: 400, headers: corsHeaders }
      );
    }

    const processor = ThemeProcessor.getInstance();
    const processedTheme = await processor.processThemeFile(themeFile, storeId);

    const validator = ThemeValidator.getInstance();
    const validation = await validator.validateThemeFiles(processedTheme.files, storeId);

    processedTheme.validation = validation;
    processedTheme.analysis = validation.analysis as TemplateAnalysis;

    if (validation.isValid && !processedTheme.preview) {
      processedTheme.preview = await processor.generatePreview(processedTheme);
    }

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

    const criticalErrors = validation.errors.filter((e) => (e as any).severity === 'critical');
    if (criticalErrors.length > 0) {
      return NextResponse.json(
        { error: 'Theme validation failed', details: response },
        { status: 400, headers: corsHeaders }
      );
    }

    if (validation.errors.length > 0) {
      return NextResponse.json(
        { warning: 'Theme uploaded with issues', details: response },
        { status: 200, headers: corsHeaders }
      );
    }

    return NextResponse.json(response, { status: 200, headers: corsHeaders });
  } catch (error) {
    logger.error('Theme upload failed', error, 'ThemeUploadAPI');
    return NextResponse.json(
      { error: 'Theme upload failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function getUploadInfo(request: NextRequest, storeId: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    return NextResponse.json(
      {
        message: 'Theme upload endpoint',
        storeId: storeId,
        supportedFormats: ['ZIP'],
        maxFileSize: '50MB',
        requiredFiles: ['layout/theme.liquid', 'templates/index.json', 'config/settings_schema.json'],
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to get upload info' }, { status: 500, headers: corsHeaders });
  }
}
