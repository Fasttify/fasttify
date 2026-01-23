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
import { templateLoader } from '@/liquid-forge/services/templates/template-loader';
import { schemaParser } from '@/liquid-forge/services/templates/parsing/schema-parser';

interface AvailableSection {
  type: string;
  name: string;
  category?: string;
  icon?: string;
  description?: string;
}

export async function listAvailableSections(request: NextRequest, storeId: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);

  try {
    const s3Client = new S3Client({
      region: process.env.REGION_BUCKET,
    });

    const bucketName = process.env.BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json({ error: 'S3 bucket not configured' }, { status: 500, headers: corsHeaders });
    }

    // Buscar secciones en: templates/${storeId}/sections/*.liquid
    const prefix = `templates/${storeId}/sections/`;
    const sectionFiles: string[] = [];

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
          if (object.Key && object.Key.endsWith('.liquid')) {
            // Extraer el nombre de la sección (ej: templates/storeId/sections/hero.liquid -> sections/hero)
            const relativePath = object.Key.replace(`templates/${storeId}/`, '');
            const sectionType = relativePath.replace('.liquid', '');
            sectionFiles.push(sectionType);
          }
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    // Procesar cada sección para extraer información del schema
    const sectionsPromises = sectionFiles.map(async (sectionType): Promise<AvailableSection | null> => {
      try {
        const sectionContent = await templateLoader.loadTemplate(storeId, `${sectionType}.liquid`);
        const schema = schemaParser.extractFullSchema(sectionContent);

        if (!schema) {
          return null;
        }

        // Extraer categoría del primer preset si existe
        const category = schema.presets?.[0]?.category || undefined;
        const icon = schema.presets?.[0]?.icon || undefined;

        return {
          type: sectionType,
          name: schema.name || sectionType,
          category,
          icon,
          description: schema.description || undefined,
        };
      } catch (error) {
        logger.warn(`Failed to process section ${sectionType}`, error, 'ListAvailableSections');
        return null;
      }
    });

    const sections = (await Promise.all(sectionsPromises)).filter(
      (section): section is AvailableSection => section !== null
    );

    // Ordenar por nombre
    sections.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(
      {
        sections,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Error listing available sections', error, 'ListAvailableSections');
    return NextResponse.json(
      {
        error: 'Failed to list available sections',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
