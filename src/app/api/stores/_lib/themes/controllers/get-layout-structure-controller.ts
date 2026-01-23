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

interface LayoutSection {
  id: string;
  type: string;
  name: string;
  isSnippet: boolean;
  schema: {
    name: string;
    settings: any[];
    blocks: any[];
    presets: any[];
  };
}

interface SectionReference {
  name: string;
  isRender: boolean;
  position: number;
}

/**
 * Extrae todas las referencias a secciones y snippets del layout
 */
function extractSectionReferences(layoutContent: string): SectionReference[] {
  const references: SectionReference[] = [];
  const regex = /{%\s*(section|render)\s+['"]([^'"]+)['"]\s*%}/g;
  let match;

  while ((match = regex.exec(layoutContent)) !== null) {
    references.push({
      name: match[2],
      isRender: match[1] === 'render',
      position: match.index,
    });
  }

  return references.filter((ref) => !ref.name.endsWith('.json'));
}

/**
 * Encuentra la posición donde comienza el contenido principal del layout
 */
function findMainContentStart(layoutContent: string): number {
  const contentForLayoutIndex = layoutContent.indexOf('{{ content_for_layout }}');
  const mainTagMatch = layoutContent.match(/<main[^>]*>/i);
  const mainTagIndex = mainTagMatch ? layoutContent.indexOf(mainTagMatch[0]) : -1;

  if (contentForLayoutIndex !== -1 && mainTagIndex !== -1) {
    return Math.min(contentForLayoutIndex, mainTagIndex);
  }
  return contentForLayoutIndex !== -1
    ? contentForLayoutIndex
    : mainTagIndex !== -1
      ? mainTagIndex
      : layoutContent.length;
}

/**
 * Categoriza las referencias de secciones según su posición en el layout
 */
function categorizeSections(
  references: SectionReference[],
  layoutContent: string,
  mainContentStart: number
): { header: SectionReference[]; footer: SectionReference[]; other: SectionReference[] } {
  const bodyCloseIndex = layoutContent.indexOf('</body>');
  const categories = {
    header: [] as SectionReference[],
    footer: [] as SectionReference[],
    other: [] as SectionReference[],
  };

  for (const ref of references) {
    if (ref.position < mainContentStart) {
      categories.header.push(ref);
    } else if (bodyCloseIndex === -1 || ref.position < bodyCloseIndex) {
      categories.footer.push(ref);
    } else {
      categories.other.push(ref);
    }
  }

  return categories;
}

/**
 * Carga el contenido de una sección o snippet
 */
async function loadSectionContent(
  storeId: string,
  ref: SectionReference
): Promise<{ content: string; type: string; isSnippet: boolean } | null> {
  if (ref.isRender) {
    // Intentar como snippet primero, luego como section
    try {
      const content = await templateLoader.loadTemplate(storeId, `snippets/${ref.name}.liquid`);
      return { content, type: `snippets/${ref.name}`, isSnippet: true };
    } catch {
      try {
        const content = await templateLoader.loadTemplate(storeId, `sections/${ref.name}.liquid`);
        return { content, type: `sections/${ref.name}`, isSnippet: false };
      } catch {
        return null;
      }
    }
  }

  // Es {% section %}, buscar en sections
  try {
    const content = await templateLoader.loadTemplate(storeId, `sections/${ref.name}.liquid`);
    return { content, type: `sections/${ref.name}`, isSnippet: false };
  } catch {
    return null;
  }
}

/**
 * Procesa una referencia de sección y extrae su información completa
 */
async function processSection(storeId: string, ref: SectionReference): Promise<LayoutSection | null> {
  const loaded = await loadSectionContent(storeId, ref);
  if (!loaded) {
    logger.warn(`Failed to load section ${ref.name}`, undefined, 'GetLayoutStructure');
    return null;
  }

  const schema = schemaParser.extractFullSchema(loaded.content);

  return {
    id: ref.name,
    type: loaded.type,
    name: schema?.name || ref.name,
    isSnippet: loaded.isSnippet,
    schema: {
      name: schema?.name || ref.name,
      settings: schema?.settings || [],
      blocks: schema?.blocks || [],
      presets: schema?.presets || [],
    },
  };
}

/**
 * Procesa múltiples referencias de secciones en paralelo
 */
async function processSections(storeId: string, references: SectionReference[]): Promise<LayoutSection[]> {
  const results = await Promise.all(references.map((ref) => processSection(storeId, ref)));
  return results.filter((section): section is LayoutSection => section !== null);
}

export async function getLayoutStructure(request: NextRequest, storeId: string): Promise<NextResponse> {
  const corsHeaders = await getNextCorsHeaders(request);

  try {
    const layoutContent = await templateLoader.loadMainLayout(storeId);
    const references = extractSectionReferences(layoutContent);
    const mainContentStart = findMainContentStart(layoutContent);
    const categories = categorizeSections(references, layoutContent, mainContentStart);

    const [headerSections, footerSections, otherSections] = await Promise.all([
      processSections(storeId, categories.header),
      processSections(storeId, categories.footer),
      processSections(storeId, categories.other),
    ]);

    return NextResponse.json(
      {
        header: { sections: headerSections },
        footer: { sections: footerSections },
        other: { sections: otherSections },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    logger.error('Error getting layout structure', error, 'GetLayoutStructure');
    return NextResponse.json(
      {
        error: 'Failed to get layout structure',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
