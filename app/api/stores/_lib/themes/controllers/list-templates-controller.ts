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
import { ListObjectsV2Command, S3Client, ListObjectsV2CommandOutput } from '@aws-sdk/client-s3';
import type { TemplateType } from '@fasttify/theme-studio';

export async function listTemplates(request: NextRequest, storeId: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);

  try {
    const s3Client = new S3Client({
      region: process.env.REGION_BUCKET,
    });

    const bucketName = process.env.BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json({ error: 'S3 bucket not configured' }, { status: 500, headers: corsHeaders });
    }

    // Buscar templates en: templates/${storeId}/templates/*.json
    const prefix = `templates/${storeId}/templates/`;
    const templates: TemplateType[] = [];

    let continuationToken: string | undefined = undefined;

    do {
      const command: ListObjectsV2Command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });

      const response: ListObjectsV2CommandOutput = await s3Client.send(command);

      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key && object.Key.endsWith('.json')) {
            // Extraer el nombre del template (ej: templates/storeId/templates/index.json -> index)
            const filename = object.Key.replace(prefix, '').replace('.json', '');

            // Validar que sea un tipo de template válido
            const validTemplateTypes: TemplateType[] = [
              'index',
              'product',
              'collection',
              'page',
              'blog',
              'article',
              'search',
              'cart',
              'checkout',
              'checkout_start',
              'checkout_confirmation',
              'policies',
              '404',
            ];

            if (validTemplateTypes.includes(filename as TemplateType)) {
              templates.push(filename as TemplateType);
            }
          }
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return NextResponse.json(
      {
        success: true,
        templates,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Error listing templates', error, 'ListTemplatesAPI');
    return NextResponse.json(
      {
        error: 'Failed to list templates',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
