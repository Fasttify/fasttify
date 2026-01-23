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
import { logger } from '@/liquid-forge';
import { AuthGetCurrentUserServer, cookiesClient } from '@/utils/client/AmplifyUtils';

export async function activateTheme(request: NextRequest, storeId: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const body = await request.json();
    const { themeId, isActive } = body || {};

    logger.info('Theme activation request received', { storeId, themeId, isActive }, 'ThemeActivationAPI');

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

    if (!themeId || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'themeId and isActive are required' }, { status: 400, headers: corsHeaders });
    }

    if (isActive) {
      const { data: existingThemes, errors: listErrors } = await cookiesClient.models.UserTheme.list({
        filter: { storeId: { eq: storeId }, isActive: { eq: true } },
      });
      if (listErrors) {
        logger.error('Failed to list active themes', { errors: listErrors }, 'ThemeActivationAPI');
        return NextResponse.json(
          { error: 'Failed to list active themes', details: listErrors },
          { status: 500, headers: corsHeaders }
        );
      }
      for (const theme of existingThemes) {
        await cookiesClient.models.UserTheme.update({ id: theme.id, isActive: false } as any);
      }
    }

    const { data: updatedTheme, errors } = await cookiesClient.models.UserTheme.update({
      id: themeId,
      isActive,
    } as any);
    if (errors) {
      logger.error('Failed to update theme', { errors }, 'ThemeActivationAPI');
      return NextResponse.json(
        { error: 'Failed to update theme', details: errors },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: isActive ? 'Theme activated successfully' : 'Theme deactivated successfully',
        theme: { id: updatedTheme?.id, name: updatedTheme?.name, isActive: updatedTheme?.isActive },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Theme activation failed', error, 'ThemeActivationAPI');
    return NextResponse.json(
      { error: 'Theme activation failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
