import { getNextCorsHeaders } from '@/lib/utils/next-cors';
import { logger } from '@/renderer-engine/lib/logger';
import {
  S3StorageService,
  type ThemeStorageResult,
} from '@/renderer-engine/services/themes/storage/s3-storage-service';
import { AuthGetCurrentUserServer, cookiesClient } from '@/utils/client/AmplifyUtils';
import { NextRequest, NextResponse } from 'next/server';

// Estado de procesos de confirmación en memoria (best-effort)
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

    // Registrar estado inicial del proceso
    themeProcessStatus.set(processId, { status: 'processing', updatedAt: Date.now() });

    // Responder inmediatamente con 202 Accepted
    const response = NextResponse.json(
      {
        success: true,
        message: 'Theme confirmation started',
        processId: processId,
        status: 'processing',
        estimatedTime: '30-60 seconds',
      },
      { status: 202, headers: corsHeaders }
    );

    // Iniciar procesamiento en segundo plano (no esperar)
    processThemeInBackground(processId, storeId, themeData, themeFile, session.username);

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
export async function GET(request: NextRequest) {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const processId = request.nextUrl.searchParams.get('processId');
    if (!processId) {
      return NextResponse.json({ error: 'processId is required' }, { status: 400, headers: corsHeaders });
    }

    const status = themeProcessStatus.get(processId);
    if (!status) {
      // Instancias serverless pueden no compartir memoria; si no existe, devolver 'unknown'
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
  username: string
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

    // Guardar en la base de datos
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

    const { data: savedTheme, errors } = await cookiesClient.models.UserTheme.create(themeRecord);

    if (errors) {
      logger.error('Failed to save theme to database', { processId, errors }, 'ThemeConfirmAPI');
      themeProcessStatus.set(processId, {
        status: 'error',
        message: 'Failed to save theme to database',
        updatedAt: Date.now(),
      });
      return;
    }

    logger.info(
      'Theme processing completed successfully',
      {
        processId,
        storeId,
        s3Key: storageResult.s3Key,
        themeId: savedTheme?.id,
      },
      'ThemeConfirmAPI'
    );

    // Marcar como completado
    themeProcessStatus.set(processId, {
      status: 'completed',
      themeId: savedTheme?.id,
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
    setTimeout(() => reject(new Error('S3 storage timeout')), 25000); // 25 segundos timeout
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
