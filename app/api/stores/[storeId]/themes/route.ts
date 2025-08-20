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
import { AuthGetCurrentUserServer, cookiesClient } from '@/utils/client/AmplifyUtils';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/stores/[storeId]/themes
 * Lista todos los temas de una tienda
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const { storeId } = await params;
    logger.info('Theme list request received', { storeId }, 'ThemeListAPI');

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

    // Listar temas de la tienda
    const { data: themes, errors } = await cookiesClient.models.UserTheme.listUserThemeByStoreId({
      storeId,
    });

    if (errors) {
      logger.error('Failed to list themes', { errors }, 'ThemeListAPI');
      return NextResponse.json(
        {
          error: 'Failed to list themes',
          details: errors,
        },
        { status: 500, headers: corsHeaders }
      );
    }

    logger.info('Themes listed successfully', { storeId, count: themes.length }, 'ThemeListAPI');

    return NextResponse.json(
      {
        success: true,
        themes: themes.map((theme) => ({
          id: theme.id,
          name: theme.name,
          version: theme.version,
          author: theme.author,
          description: theme.description,
          previewUrl: theme.preview,
          fileCount: theme.fileCount,
          totalSize: theme.totalSize,
          isActive: theme.isActive,
          cdnUrl: theme.cdnUrl,
          createdAt: theme.createdAt,
          updatedAt: theme.updatedAt,
        })),
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Theme list failed', error, 'ThemeListAPI');

    return NextResponse.json(
      {
        error: 'Theme list failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * PATCH /api/stores/[storeId]/themes
 * Activa o desactiva un tema
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const { storeId } = await params;
    const body = await request.json();
    const { themeId, isActive } = body;

    logger.info('Theme activation request received', { storeId, themeId, isActive }, 'ThemeActivationAPI');

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

    // Si se está activando un tema, desactivar todos los demás
    if (isActive) {
      const { data: existingThemes, errors: listErrors } = await cookiesClient.models.UserTheme.list({
        filter: {
          storeId: { eq: storeId },
          isActive: { eq: true },
        },
      });

      if (listErrors) {
        logger.error('Failed to list active themes', { errors: listErrors }, 'ThemeActivationAPI');
        return NextResponse.json(
          {
            error: 'Failed to list active themes',
            details: listErrors,
          },
          { status: 500, headers: corsHeaders }
        );
      }

      // Desactivar todos los temas activos
      for (const theme of existingThemes) {
        await cookiesClient.models.UserTheme.update({
          id: theme.id,
          isActive: false,
        });
      }
    }

    // Actualizar el tema específico
    const { data: updatedTheme, errors } = await cookiesClient.models.UserTheme.update({
      id: themeId,
      isActive,
    });

    if (errors) {
      logger.error('Failed to update theme', { errors }, 'ThemeActivationAPI');
      return NextResponse.json(
        {
          error: 'Failed to update theme',
          details: errors,
        },
        { status: 500, headers: corsHeaders }
      );
    }

    logger.info(
      'Theme activation updated successfully',
      {
        storeId,
        themeId,
        isActive: updatedTheme?.isActive,
      },
      'ThemeActivationAPI'
    );

    return NextResponse.json(
      {
        success: true,
        message: isActive ? 'Theme activated successfully' : 'Theme deactivated successfully',
        theme: {
          id: updatedTheme?.id,
          name: updatedTheme?.name,
          isActive: updatedTheme?.isActive,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Theme activation failed', error, 'ThemeActivationAPI');

    return NextResponse.json(
      {
        error: 'Theme activation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * DELETE /api/stores/[storeId]/themes
 * Elimina un tema
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ storeId: string }> }) {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const { storeId } = await params;
    const { searchParams } = new URL(request.url);
    const themeId = searchParams.get('themeId');

    logger.info('Theme deletion request received', { storeId, themeId }, 'ThemeDeletionAPI');

    // Verificar autenticación
    const session = await AuthGetCurrentUserServer();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    // Verificar que el store existe
    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400, headers: corsHeaders });
    }

    if (!themeId) {
      return NextResponse.json({ error: 'Theme ID is required' }, { status: 400, headers: corsHeaders });
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

    // Buscar el tema para verificar que pertenece a la tienda
    const { data: theme, errors: getErrors } = await cookiesClient.models.UserTheme.get({
      id: themeId,
    });

    if (getErrors || !theme) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404, headers: corsHeaders });
    }

    if (theme.storeId !== storeId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders });
    }

    // Eliminar el tema de la base de datos
    const { errors } = await cookiesClient.models.UserTheme.delete({
      id: themeId,
    });

    if (errors) {
      logger.error('Failed to delete theme from database', { errors }, 'ThemeDeletionAPI');
      return NextResponse.json(
        {
          error: 'Failed to delete theme from database',
          details: errors,
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // TODO: Eliminar archivos de S3
    // const s3Storage = S3StorageService.getInstance();
    // await s3Storage.deleteTheme(storeId);

    logger.info('Theme deleted successfully', { storeId, themeId }, 'ThemeDeletionAPI');

    return NextResponse.json(
      {
        success: true,
        message: 'Theme deleted successfully',
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Theme deletion failed', error, 'ThemeDeletionAPI');

    return NextResponse.json(
      {
        error: 'Theme deletion failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
