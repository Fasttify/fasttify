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

export async function getFileContent(
  request: NextRequest,
  corsHeaders: Record<string, string>,
  storeId: string
): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('filePath');

    if (!filePath) {
      return NextResponse.json(
        { error: { code: 400, message: 'FILE_PATH_REQUIRED' } },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!storeId) {
      return NextResponse.json(
        { error: { code: 400, message: 'STORE_ID_REQUIRED' } },
        { status: 400, headers: corsHeaders }
      );
    }

    // Cargar solo el archivo específico
    const files = await ThemeS3Service.getInstance().listThemeFiles(storeId, 1_000_000);
    const file = files.find((f) => f.path === filePath);

    if (!file) {
      return NextResponse.json(
        { error: { code: 404, message: 'FILE_NOT_FOUND' } },
        { status: 404, headers: corsHeaders }
      );
    }

    // Headers de seguridad
    const securityHeaders = {
      ...corsHeaders,
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      Pragma: 'no-cache',
      Expires: '0',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    };

    return NextResponse.json({ content: file.content || '' }, { headers: securityHeaders });
  } catch (e: any) {
    const duration = Date.now() - startTime;
    console.error(`Error loading file content after ${duration}ms:`, e);

    return NextResponse.json(
      { error: { code: 500, message: e?.message || 'INTERNAL_ERROR' } },
      { status: 500, headers: corsHeaders }
    );
  }
}
