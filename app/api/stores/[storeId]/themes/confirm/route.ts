import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { logger } from '@/renderer-engine/lib/logger';
import { S3StorageService } from '@/renderer-engine/services/themes/storage/s3-storage-service';
import { AuthGetCurrentUserServer, cookiesClient } from '@/utils/client/AmplifyUtils';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/stores/[storeId]/themes/confirm
 * Confirma y almacena un tema procesado en S3
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const { storeId } = await params;
    logger.info('Theme confirmation request received', { storeId }, 'ThemeConfirmAPI');

    // Verificar autenticación
    const session = await AuthGetCurrentUserServer();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    // Verificar que el store existe
    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400, headers: corsHeaders });
    }

    // Buscar la tienda para verificación de propiedad
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

    // Obtener datos del FormData
    const formData = await request.formData();
    const themeFile = formData.get('theme') as File;
    const themeDataString = formData.get('themeData') as string;

    if (!themeFile || !themeDataString) {
      return NextResponse.json(
        { error: 'Theme file and theme data are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const themeData = JSON.parse(themeDataString);

    // Convertir ThemeUploadResult a ProcessedTheme para S3StorageService
    const processedTheme = {
      id: themeData.theme.id,
      name: themeData.theme.name,
      version: themeData.theme.version,
      author: themeData.theme.author,
      description: themeData.theme.description,
      files: [],
      sections: [],
      templates: [],
      assets: [],
      totalSize: themeData.theme.totalSize || 0,
      settings: {
        name: themeData.theme.name,
        version: themeData.theme.version,
        settings_schema: [],
        settings_defaults: {},
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      validation: themeData.validation,
      analysis: themeData.analysis,
      preview: themeData.theme.preview,
    };

    // Almacenar en S3
    const s3Storage = S3StorageService.getInstance();
    const storageResult = await s3Storage.storeTheme(processedTheme, storeId, themeFile);

    if (!storageResult.success) {
      return NextResponse.json(
        {
          error: 'Failed to store theme',
          details: storageResult.error,
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // 6. Guardar en la base de datos
    const themeRecord = {
      storeId,
      name: processedTheme.name,
      version: processedTheme.version,
      author: processedTheme.author || 'Unknown',
      description: processedTheme.description || '',
      s3Key: storageResult.s3Key,
      cdnUrl: storageResult.cdnUrl,
      fileCount: themeData.theme.fileCount || 0,
      totalSize: processedTheme.totalSize,
      isActive: false,
      settings: JSON.stringify(processedTheme.settings),
      validation: JSON.stringify(themeData.validation),
      analysis: JSON.stringify(themeData.analysis),
      preview: themeData.theme.preview,
      owner: session.username,
    };

    const { data: savedTheme, errors } = await cookiesClient.models.UserTheme.create(themeRecord);

    if (errors) {
      logger.error('Failed to save theme to database', { errors }, 'ThemeConfirmAPI');
      return NextResponse.json(
        {
          error: 'Failed to save theme to database',
          details: errors,
        },
        { status: 500, headers: corsHeaders }
      );
    }

    logger.info(
      'Theme confirmed and stored successfully',
      {
        storeId,
        s3Key: storageResult.s3Key,
        themeId: savedTheme?.id,
      },
      'ThemeConfirmAPI'
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Theme confirmed and stored successfully',
        storage: storageResult,
        theme: {
          id: savedTheme?.id,
          name: savedTheme?.name,
          version: savedTheme?.version,
          isActive: savedTheme?.isActive,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Theme confirmation failed', error, 'ThemeConfirmAPI');

    return NextResponse.json(
      {
        error: 'Theme confirmation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
