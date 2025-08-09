import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { logger } from '@/renderer-engine/lib/logger';
import {
  S3StorageService,
  type ThemeStorageResult,
} from '@/renderer-engine/services/themes/storage/s3-storage-service';
import { AuthGetCurrentUserServer, cookiesClient } from '@/utils/client/AmplifyUtils';
import { getCdnUrlForKey } from '@/utils/server';
import { GetObjectCommand, HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';

type ProcessStatus = {
  status: 'processing' | 'completed' | 'error';
  message?: string;
  themeId?: string;
  updatedAt: number;
};

const themeProcessStatus: Map<string, ProcessStatus> = new Map();

/**
 * POST /api/stores/[storeId]/themes/confirm
 * Confirma y almacena un tema procesado - responde inmediatamente con 202
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

    // Generar ID único para el proceso
    const processId = `theme-confirm-${storeId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Crear placeholder en DB antes de responder (para garantizar registro aun si el background se corta)
    let themeId: string | undefined;
    const cdnUrl = getCdnUrlForKey(`templates/${storeId}/theme.zip`);
    try {
      const { data: placeholder, errors: placeholderErrors } = await cookiesClient.models.UserTheme.create({
        storeId,
        name: themeData?.theme?.name || 'Untitled Theme',
        version: themeData?.theme?.version || '1.0.0',
        author: themeData?.theme?.author || 'Unknown',
        description: themeData?.theme?.description || '',
        s3Key: '',
        cdnUrl: cdnUrl,
        fileCount: themeData?.theme?.fileCount || 0,
        totalSize: themeData?.theme?.totalSize || 0,
        isActive: false,
        settings: JSON.stringify(themeData?.theme?.settings || {}),
        validation: JSON.stringify(themeData?.validation || {}),
        analysis: JSON.stringify(themeData?.analysis || {}),
        preview: themeData?.theme?.preview || null,
        owner: session.username,
      } as any);
      if (!placeholderErrors) {
        themeId = placeholder?.id;
      }
    } catch (e) {
      logger.warn('Failed to create placeholder theme', e, 'ThemeConfirmAPI');
    }

    // Registrar estado inicial del proceso
    themeProcessStatus.set(processId, { status: 'processing', updatedAt: Date.now(), themeId });

    // Responder inmediatamente con 202 Accepted
    const response = NextResponse.json(
      {
        success: true,
        message: 'Theme confirmation started',
        processId: processId,
        themeId,
        status: 'processing',
        estimatedTime: '30-60 seconds',
      },
      { status: 202, headers: corsHeaders }
    );

    // Iniciar procesamiento en segundo plano (no esperar)
    processThemeInBackground(processId, storeId, themeData, themeFile, session.username, themeId);

    return response;
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

/**
 * GET /api/stores/[storeId]/themes/confirm?processId=XYZ
 * Devuelve el estado del proceso de confirmación
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const { storeId } = await params;
    const processId = request.nextUrl.searchParams.get('processId');
    const themeId = request.nextUrl.searchParams.get('themeId');
    if (!processId) {
      return NextResponse.json({ error: 'processId is required' }, { status: 400, headers: corsHeaders });
    }
    // Si envían themeId, comprobar DB primero
    if (themeId) {
      try {
        const { data: theme } = await cookiesClient.models.UserTheme.get({ id: themeId });
        if (theme && theme.cdnUrl && theme.s3Key) {
          return NextResponse.json(
            { status: 'completed', themeId, updatedAt: Date.now() },
            { status: 200, headers: corsHeaders }
          );
        }
      } catch (_) {}
    }
    // Chequear metadata.json en S3 primero
    try {
      const s3 = new S3Client({ region: process.env.REGION_BUCKET || 'us-east-2' });
      const baseKey = `templates/${storeId}`;
      const metadataKey = `${baseKey}/metadata.json`;
      const metaResp = await s3.send(new GetObjectCommand({ Bucket: process.env.BUCKET_NAME, Key: metadataKey }));
      if (metaResp.Body) {
        const text = await metaResp.Body.transformToString();
        const meta = JSON.parse(text || '{}');
        if (meta.status === 'ready') {
          return NextResponse.json(
            { status: 'completed', themeId: meta.themeId, updatedAt: Date.now() },
            { status: 200, headers: corsHeaders }
          );
        }
        try {
          await s3.send(new HeadObjectCommand({ Bucket: process.env.BUCKET_NAME, Key: `${baseKey}/theme.zip` }));
          return NextResponse.json(
            { status: 'completed', themeId: meta.themeId, updatedAt: Date.now() },
            { status: 200, headers: corsHeaders }
          );
        } catch (_) {}
      }
    } catch (_) {}

    const status = themeProcessStatus.get(processId);
    if (!status) {
      return NextResponse.json({ status: 'unknown' }, { status: 200, headers: corsHeaders });
    }

    return NextResponse.json(status, { status: 200, headers: corsHeaders });
  } catch (error) {
    logger.error('Status check failed', error, 'ThemeConfirmAPI');
    return NextResponse.json(
      { error: 'Status check failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Procesa el tema en segundo plano por chunks
 */
async function processThemeInBackground(
  processId: string,
  storeId: string,
  themeData: any,
  themeFile: File,
  username: string,
  themeId?: string
) {
  try {
    logger.info('Starting background theme processing', { processId, storeId }, 'ThemeConfirmAPI');

    // Convertir ThemeUploadResult a ProcessedTheme
    const processedTheme = {
      id: themeData.theme.id,
      name: themeData.theme.name,
      version: themeData.theme.version,
      author: themeData.theme.author,
      description: themeData.theme.description,
      files: themeData.theme.files || [],
      sections: themeData.theme.sections || [],
      templates: themeData.theme.templates || [],
      assets: themeData.theme.assets || [],
      totalSize: themeData.theme.totalSize || 0,
      settings: themeData.theme.settings || {
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

    // Procesar archivo en chunks
    const storageResult = await storeThemeInChunks(processedTheme, storeId, themeFile);

    if (!storageResult.success) {
      logger.error('S3 storage failed', { processId, error: storageResult.error }, 'ThemeConfirmAPI');
      themeProcessStatus.set(processId, {
        status: 'error',
        message: storageResult.error || 'S3 storage failed',
        updatedAt: Date.now(),
      });
      return;
    }

    // Guardar/Actualizar en la base de datos
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
      owner: username,
    };

    let savedThemeId: string | undefined = themeId;
    if (themeId) {
      const { data: updated, errors: updateErrors } = await cookiesClient.models.UserTheme.update({
        id: themeId,
        ...themeRecord,
      } as any);
      if (updateErrors) {
        logger.error('Failed to update placeholder theme', { processId, errors: updateErrors }, 'ThemeConfirmAPI');
        themeProcessStatus.set(processId, {
          status: 'error',
          message: 'Failed to update theme',
          updatedAt: Date.now(),
        });
        return;
      }
      savedThemeId = updated?.id;
    } else {
      const { data: created, errors: createErrors } = await cookiesClient.models.UserTheme.create(themeRecord);
      if (createErrors) {
        logger.error('Failed to save theme to database', { processId, errors: createErrors }, 'ThemeConfirmAPI');
        themeProcessStatus.set(processId, {
          status: 'error',
          message: 'Failed to save theme to database',
          updatedAt: Date.now(),
        });
        return;
      }
      savedThemeId = created?.id;
    }

    logger.info(
      'Theme processing completed successfully',
      {
        processId,
        storeId,
        s3Key: storageResult.s3Key,
        themeId: savedThemeId,
      },
      'ThemeConfirmAPI'
    );

    // Marcar como completado
    themeProcessStatus.set(processId, {
      status: 'completed',
      themeId: savedThemeId,
      updatedAt: Date.now(),
    });
  } catch (error) {
    logger.error('Background theme processing failed', { processId, error }, 'ThemeConfirmAPI');
    themeProcessStatus.set(processId, {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      updatedAt: Date.now(),
    });
  }
}

/**
 * Almacena el tema en S3 usando procesamiento por chunks
 */
async function storeThemeInChunks(processedTheme: any, storeId: string, themeFile: File): Promise<ThemeStorageResult> {
  const s3Storage = S3StorageService.getInstance();

  logger.info(
    'Starting theme storage in chunks',
    {
      storeId,
      fileCount: processedTheme.files.length,
      totalSize: processedTheme.totalSize,
    },
    'ThemeConfirmAPI'
  );

  try {
    // Procesar archivo en chunks si es muy grande
    if (themeFile.size > 10 * 1024 * 1024) {
      // Si es mayor a 10MB
      return await storeLargeFileInChunks(s3Storage, processedTheme, storeId, themeFile);
    } else {
      // Para archivos pequeños, procesar directamente
      return await s3Storage.storeTheme(processedTheme, storeId, themeFile);
    }
  } catch (error) {
    logger.error('Error storing theme in chunks', { error }, 'ThemeConfirmAPI');
    return {
      success: false,
      storeId,
      s3Key: '',
      error: error instanceof Error ? error.message : 'Unknown storage error',
    };
  }
}

/**
 * Almacena archivos grandes en chunks
 */
async function storeLargeFileInChunks(
  s3Storage: S3StorageService,
  processedTheme: any,
  storeId: string,
  themeFile: File
): Promise<ThemeStorageResult> {
  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
  const totalSize = themeFile.size;
  const chunks = Math.ceil(totalSize / CHUNK_SIZE);

  logger.info(
    'Processing large file in chunks',
    {
      totalSize,
      chunkSize: CHUNK_SIZE,
      chunks,
    },
    'ThemeConfirmAPI'
  );

  // Procesar archivo en chunks
  const chunksData: Uint8Array[] = [];

  for (let i = 0; i < chunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, totalSize);
    const chunk = themeFile.slice(start, end);

    const arrayBuffer = await chunk.arrayBuffer();
    chunksData.push(new Uint8Array(arrayBuffer));

    // Pequeña pausa para evitar bloquear el event loop
    if (i % 3 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }

  // Combinar chunks
  const totalLength = chunksData.reduce((acc, chunk) => acc + chunk.length, 0);
  const combinedData = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunksData) {
    combinedData.set(chunk, offset);
    offset += chunk.length;
  }

  // Crear nuevo archivo con datos combinados
  const processedFile = new File([combinedData], themeFile.name, {
    type: themeFile.type,
    lastModified: themeFile.lastModified,
  });

  // Almacenar con timeout
  const storagePromise = s3Storage.storeTheme(processedTheme, storeId, processedFile);
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('S3 storage timeout')), 120000); // 120 segundos timeout
  });

  try {
    return (await Promise.race([storagePromise, timeoutPromise])) as ThemeStorageResult;
  } catch (error) {
    logger.warn('S3 storage failed or timed out', { error }, 'ThemeConfirmAPI');
    return {
      success: false,
      storeId,
      s3Key: '',
      error: error instanceof Error ? error.message : 'S3 storage timeout',
    };
  }
}
