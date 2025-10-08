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

import { logger } from '@/liquid-forge/lib/logger';
import { extractPaginationLimitFromTemplate } from '@/liquid-forge/services/page/data-loader/pagination/pagination-limit-extractor';
import type { TemplateAnalysis } from '@/liquid-forge/services/templates/analysis/template-analyzer';
import { templateAnalyzer } from '@/liquid-forge/services/templates/analysis/template-analyzer';
import { templateLoader } from '@/liquid-forge/services/templates/template-loader';
import type { PageRenderOptions } from '@/liquid-forge/types/template';

/**
 * Tipo para cargadores de templates
 */
type TemplateLoader = (storeId: string, options: PageRenderOptions) => Promise<Record<string, string>>;

/**
 * Mapeo declarativo de tipos de página a paths de templates
 */
const templatePaths: Record<string, string> = {
  index: 'templates/index.json',
  product: 'templates/product.json',
  collection: 'templates/collection.json',
  cart: 'templates/cart.json',
  page: 'templates/page.json',
  policies: 'templates/policies.json',
  search: 'templates/search.json',
  '404': 'templates/404.json',
};

/**
 * Obtiene el path de la plantilla según el tipo de página.
 */
function getTemplatePath(pageType: string): string {
  return templatePaths[pageType] || `templates/${pageType}.json`;
}

/**
 * Cargadores declarativos para diferentes tipos de templates
 */
const templateLoaders: Record<string, TemplateLoader> = {
  layout: async (storeId: string) => {
    const layout = await templateLoader.loadMainLayout(storeId);
    return { 'layout/theme.liquid': layout };
  },

  page: async (storeId: string, options: PageRenderOptions) => {
    const templatePath = getTemplatePath(options.pageType);
    const pageTemplate = await templateLoader.loadTemplate(storeId, templatePath);
    return { [templatePath]: pageTemplate };
  },

  layoutSections: async (storeId: string, options: PageRenderOptions) => {
    const layout = await templateLoader.loadMainLayout(storeId);
    const sectionNames = extractSectionNames(layout);
    return await loadSections(storeId, sectionNames, 'layout');
  },

  pageSections: async (storeId: string, options: PageRenderOptions) => {
    const templatePath = getTemplatePath(options.pageType);

    if (!templatePath.endsWith('.json')) {
      return {};
    }

    const pageTemplate = await templateLoader.loadTemplate(storeId, templatePath);
    const sectionNames = extractPageSectionNames(pageTemplate);
    return await loadSections(storeId, sectionNames, 'page');
  },
};

/**
 * Analiza las plantillas requeridas para la página usando cargadores declarativos.
 */
export async function analyzeRequiredTemplates(storeId: string, options: PageRenderOptions): Promise<TemplateAnalysis> {
  try {
    const allTemplates: Record<string, string> = {};

    // Cargar todos los tipos de templates en paralelo
    const loadPromises = Object.entries(templateLoaders).map(async ([type, loader]) => {
      try {
        const templates = await loader(storeId, options);
        Object.assign(allTemplates, templates);
      } catch (error) {
        logger.warn(`Failed to load ${type} templates`, error, 'TemplateAnalyzer');
      }
    });

    await Promise.all(loadPromises);

    const analysis = await templateAnalyzer.analyzeTemplateSet(storeId, allTemplates);

    // PASO 2 (simplificado): Extraer el límite de paginación del schema del propio template JSON.
    extractPaginationLimitFromTemplate(allTemplates, options, analysis);

    return analysis;
  } catch (error) {
    logger.error('Error analyzing templates', error, 'TemplateAnalyzer');
    return createEmptyAnalysis();
  }
}

/**
 * Carga secciones de forma genérica con manejo de errores.
 */
async function loadSections(storeId: string, sectionNames: string[], context: string): Promise<Record<string, string>> {
  const sections: Record<string, string> = {};

  const loadPromises = sectionNames.map(async (sectionName) => {
    try {
      const sectionContent = await templateLoader.loadTemplate(storeId, sectionName);
      sections[sectionName] = sectionContent;
    } catch (error) {
      logger.warn(`Could not load ${context} section ${sectionName}`, error, 'TemplateAnalyzer');
    }
  });

  await Promise.all(loadPromises);
  return sections;
}

/**
 * Extrae nombres de secciones del layout.
 */
function extractSectionNames(layout: string): string[] {
  const sectionNames: string[] = [];

  // Extraer secciones individuales {% section 'nombre' %}
  const sectionMatches = layout.match(/\{\%\s*section\s+['"]([^'"]+)['"]\s*\%\}/g) || [];
  const individualSections = sectionMatches
    .map((match) => {
      const nameMatch = match.match(/section\s+['"]([^'"]+)['"]/i);
      return nameMatch ? nameMatch[1] : '';
    })
    .filter(Boolean);

  sectionNames.push(...individualSections);

  // Extraer secciones de grupos {% sections 'grupo' %}
  const sectionsMatches = layout.match(/\{\%\s*sections\s+['"]([^'"]+)['"]\s*\%\}/g) || [];
  const groupSections = sectionsMatches
    .map((match) => {
      const nameMatch = match.match(/sections\s+['"]([^'"]+)['"]/i);
      return nameMatch ? nameMatch[1] : '';
    })
    .filter(Boolean);

  // Para cada grupo, agregar el archivo JSON del grupo y las secciones individuales
  for (const groupName of groupSections) {
    // Agregar el archivo JSON del grupo
    sectionNames.push(`${groupName}.json`);

    // Agregar las secciones individuales que contiene
    const groupSectionsList = getSectionsFromGroup(groupName);
    sectionNames.push(...groupSectionsList);
  }

  return sectionNames;
}

/**
 * Obtiene las secciones individuales que pertenecen a un grupo
 */
function getSectionsFromGroup(groupName: string): string[] {
  // Para header-group, incluir announcement-bar y header
  if (groupName === 'header-group') {
    return ['announcement-bar', 'header'];
  }

  // Para footer-group, incluir footer
  if (groupName === 'footer-group') {
    return ['footer'];
  }

  // Para otros grupos, retornar vacío por ahora
  return [];
}

/**
 * Extrae nombres de secciones de un template JSON de página.
 */
function extractPageSectionNames(pageTemplate: string): string[] {
  try {
    const templateConfig = JSON.parse(pageTemplate);
    if (!templateConfig.sections) return [];

    return Object.entries(templateConfig.sections)
      .map(([sectionId, sectionConfig]) => {
        const sectionType = (sectionConfig as any).type;
        if (!sectionType) return '';

        // Construir la ruta completa: si ya incluye un prefijo, usarlo. Si no, asumir que es una sección.
        const fullPath = sectionType.includes('/') ? `${sectionType}.liquid` : `sections/${sectionType}.liquid`;

        return fullPath;
      })
      .filter(Boolean);
  } catch (error) {
    logger.warn('Error parsing page template JSON', error, 'TemplateAnalyzer');
    return [];
  }
}

/**
 * Crea un análisis vacío para casos de error.
 */
function createEmptyAnalysis(): TemplateAnalysis {
  return {
    requiredData: new Map(),
    hasPagination: false,
    usedSections: [],
    liquidObjects: [],
    dependencies: [],
  };
}
