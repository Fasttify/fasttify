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
import { ThemeS3Service } from '@/app/api/themes/_lib/services/s3-theme-files.service';
import { getFileType } from '@/app/api/themes/_lib/utils/path-utils';

export async function getListFiles(request: NextRequest, corsHeaders: Record<string, string>): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json(
        { error: { code: 400, message: 'INVALID_INPUT' } },
        { status: 400, headers: corsHeaders }
      );
    }

    const files = await ThemeS3Service.getInstance().listThemeFilesMetadata(storeId);

    // Devolver solo metadatos, sin contenido
    const filesWithoutContent = files.map((file) => ({
      id: file.id,
      path: file.path,
      size: file.size,
      lastModified: file.lastModified,
      type: getFileType(file.path),
      name: file.path.split('/').pop(),
      _hasContent: false,
      _contentLength: 0,
    }));

    // Headers de caché para el cliente
    const cacheHeaders = {
      ...corsHeaders,
      'Cache-Control': 'public, max-age=300', // 5 minutos
      ETag: `"${storeId}-${filesWithoutContent.length}-${Date.now()}"`,
    };

    return NextResponse.json({ files: filesWithoutContent }, { headers: cacheHeaders });
  } catch (e: any) {
    const duration = Date.now() - startTime;
    console.error(`Error loading theme files after ${duration}ms:`, e);

    return NextResponse.json(
      { error: { code: 500, message: e?.message || 'INTERNAL_ERROR' } },
      { status: 500, headers: corsHeaders }
    );
  }
}
