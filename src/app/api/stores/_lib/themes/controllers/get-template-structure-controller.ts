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
import { templateLoader } from '@/liquid-forge/services/templates/template-loader';
import { schemaParser } from '@/liquid-forge/services/templates/parsing/schema-parser';

const TEMPLATE_PATHS: Record<string, string> = {
  index: 'templates/index.json',
  product: 'templates/product.json',
  collection: 'templates/collection.json',
  cart: 'templates/cart.json',
  page: 'templates/page.json',
  policies: 'templates/policies.json',
  search: 'templates/search.json',
  '404': 'templates/404.json',
  checkout: 'templates/checkout.json',
  checkout_confirmation: 'templates/checkout_confirmation.json',
};

function getTemplatePath(pageType: string): string {
  return TEMPLATE_PATHS[pageType] || `templates/${pageType}.json`;
}

interface TemplateSection {
  id: string;
  type: string;
  name: string;
  settings: Record<string, any>;
  blocks?: any[];
  schema: {
    name: string;
    settings: any[];
    blocks: any[];
    presets: any[];
  };
}

export async function getTemplateStructure(
  request: NextRequest,
  storeId: string,
  pageType: string
): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);

  try {
    const templatePath = getTemplatePath(pageType);

    // Cargar el template JSON
    const templateContent = await templateLoader.loadTemplate(storeId, templatePath);
    const templateConfig = JSON.parse(templateContent.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1'));

    if (!templateConfig.sections || !templateConfig.order) {
      return NextResponse.json(
        {
          error: 'Invalid template structure',
          message: 'Template must have sections and order properties',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Procesar cada sección en paralelo
    const sectionsPromises = templateConfig.order.map(async (sectionId: string) => {
      const sectionConfig = templateConfig.sections[sectionId];
      if (!sectionConfig) {
        return null;
      }

      try {
        // Cargar el contenido de la sección Liquid
        const sectionContent = await templateLoader.loadTemplate(storeId, `${sectionConfig.type}.liquid`);

        // Extraer el schema completo
        const schema = schemaParser.extractFullSchema(sectionContent);

        const section: TemplateSection = {
          id: sectionId,
          type: sectionConfig.type,
          name: schema?.name || sectionId,
          settings: sectionConfig.settings || {},
          blocks: sectionConfig.blocks || [],
          schema: {
            name: schema?.name || sectionId,
            settings: schema?.settings || [],
            blocks: schema?.blocks || [],
            presets: schema?.presets || [],
          },
        };

        return section;
      } catch (error) {
        logger.warn(`Failed to load section ${sectionConfig.type}`, error, 'GetTemplateStructure');
        // Retornar sección con información mínima si falla
        return {
          id: sectionId,
          type: sectionConfig.type,
          name: sectionId,
          settings: sectionConfig.settings || {},
          blocks: sectionConfig.blocks || [],
          schema: {
            name: sectionId,
            settings: [],
            blocks: [],
            presets: [],
          },
        } as TemplateSection;
      }
    });

    const sections = (await Promise.all(sectionsPromises)).filter(
      (section): section is TemplateSection => section !== null
    );

    return NextResponse.json(
      {
        pageType,
        sections,
        order: templateConfig.order,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Error getting template structure', error, 'GetTemplateStructure');
    return NextResponse.json(
      {
        error: 'Failed to get template structure',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
