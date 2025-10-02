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
import { AuthGetCurrentUserServer, cookiesClient } from '@/utils/client/AmplifyUtils';

export async function deleteTheme(request: NextRequest, storeId: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const { searchParams } = new URL(request.url);
    const themeId = searchParams.get('themeId');

    logger.info('Theme deletion request received', { storeId, themeId }, 'ThemeDeletionAPI');

    const session = await AuthGetCurrentUserServer();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400, headers: corsHeaders });
    }
    if (!themeId) {
      return NextResponse.json({ error: 'Theme ID is required' }, { status: 400, headers: corsHeaders });
    }

    const { data: userStore } = await cookiesClient.models.UserStore.get({ storeId });
    if (!userStore) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404, headers: corsHeaders });
    }
    if (userStore.userId !== session.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders });
    }

    const { data: theme, errors: getErrors } = await cookiesClient.models.UserTheme.get({ id: themeId });
    if (getErrors || !theme) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404, headers: corsHeaders });
    }
    if (theme.storeId !== storeId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders });
    }

    const { errors } = await cookiesClient.models.UserTheme.delete({ id: themeId });
    if (errors) {
      logger.error('Failed to delete theme from database', { errors }, 'ThemeDeletionAPI');
      return NextResponse.json(
        { error: 'Failed to delete theme from database', details: errors },
        { status: 500, headers: corsHeaders }
      );
    }

    // TODO: eliminar archivos de S3 si aplica

    logger.info('Theme deleted successfully', { storeId, themeId }, 'ThemeDeletionAPI');

    return NextResponse.json(
      { success: true, message: 'Theme deleted successfully' },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Theme deletion failed', error, 'ThemeDeletionAPI');
    return NextResponse.json(
      { error: 'Theme deletion failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
