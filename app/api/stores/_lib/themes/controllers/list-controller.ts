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
import { logger } from '@/renderer-engine/lib/logger';
import { AuthGetCurrentUserServer, cookiesClient } from '@/utils/client/AmplifyUtils';

export async function listThemes(request: NextRequest, storeId: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    logger.info('Theme list request received', { storeId }, 'ThemeListAPI');

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

    const { data: themes, errors } = await cookiesClient.models.UserTheme.listUserThemeByStoreId({ storeId });
    if (errors) {
      logger.error('Failed to list themes', { errors }, 'ThemeListAPI');
      return NextResponse.json(
        { error: 'Failed to list themes', details: errors },
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
      { error: 'Theme list failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
