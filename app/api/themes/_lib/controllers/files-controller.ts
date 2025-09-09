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
import { ThemeS3Service } from '@/api/themes/_lib/s3-theme-files.service';
import { AuthGetCurrentUserServer, cookiesClient } from '@/utils/client/AmplifyUtils';

export async function getListFiles(request: NextRequest, themeId: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    if (!storeId || !themeId) {
      return NextResponse.json(
        { error: { code: 400, message: 'INVALID_INPUT' } },
        { status: 400, headers: corsHeaders }
      );
    }

    // Autenticación requerida
    const session = await AuthGetCurrentUserServer();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    // Verificar propiedad del store
    const { data: userStore } = await cookiesClient.models.UserStore.get({ storeId });
    if (!userStore) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404, headers: corsHeaders });
    }
    if (userStore.userId !== session.username) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders });
    }

    const max = Number(process.env.THEME_MAX_FILE_SIZE_BYTES || 1_000_000);
    const files = await ThemeS3Service.getInstance().listThemeFiles(storeId, themeId, max);

    return NextResponse.json({ files }, { headers: corsHeaders });
  } catch (e: any) {
    return NextResponse.json(
      { error: { code: 500, message: e?.message || 'INTERNAL_ERROR' } },
      { status: 500, headers: corsHeaders }
    );
  }
}
