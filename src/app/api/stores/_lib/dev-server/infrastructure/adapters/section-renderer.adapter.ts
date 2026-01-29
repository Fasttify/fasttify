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

import { sectionRenderer } from '@/liquid-forge/services/rendering/section-renderer';
import { templateLoader } from '@/liquid-forge/services/templates/template-loader';
import { contextBuilder } from '@/liquid-forge/services/rendering/global-context';
import { dynamicDataLoader } from '@/liquid-forge/services/page/dynamic-data-loader';
import { dataFetcher } from '@/liquid-forge/services/fetchers/data-fetcher';
import { cookiesClient } from '@/utils/server/AmplifyServer';
import type {
  ISectionRenderer,
  RenderSectionParams,
  RenderSectionResult,
} from '../../domain/ports/section-renderer.port';
import type { PageRenderOptions } from '@/liquid-forge/types/template';
import type { RenderContext } from '@/liquid-forge/types';
import { logger } from '@/liquid-forge';

/**
 * Helper: Obtiene la configuración de la sección del template
 */
const getSectionConfig = (template: any, sectionId: string) => {
  const sectionConfig = template.sections[sectionId];
  if (!sectionConfig) {
    throw new Error(`Section ${sectionId} not found in template`);
  }
  return sectionConfig;
};

/**
 * Helper: Carga el contenido Liquid de la sección
 */
const loadSectionContent = async (storeId: string, sectionType: string): Promise<string> => {
  return templateLoader.loadTemplate(storeId, `${sectionType}.liquid`);
};

/**
 * Helper: Carga los datos de la tienda desde la base de datos
 */
const loadStoreData = async (storeId: string) => {
  const { data: userStore } = await cookiesClient.models.UserStore.get({ storeId });
  if (!userStore) {
    throw new Error(`Store ${storeId} not found`);
  }
  return userStore;
};

/**
 * Helper: Construye el objeto store para el contexto
 */
const buildStoreObject = (userStore: any) => ({
  storeId: userStore.storeId,
  storeName: userStore.storeName,
  storeDescription: userStore.storeDescription,
  storeCurrency: userStore.storeCurrency,
  currencyFormat: userStore.currencyFormat,
  currencyLocale: userStore.currencyLocale,
  currencyDecimalPlaces: userStore.currencyDecimalPlaces,
  customDomain: userStore.defaultDomain,
  contactEmail: userStore.contactEmail,
  contactPhone: userStore.contactPhone,
  storeAdress: userStore.storeAdress,
  storeLogo: userStore.storeLogo,
  storeStatus: true,
});

/**
 * Helper: Construye las opciones de renderizado de página
 */
const buildPageRenderOptions = (pageType: string): PageRenderOptions => ({
  pageType: pageType as PageRenderOptions['pageType'],
});

/**
 * Helper: Construye el storeTemplate para el contexto
 */
const buildStoreTemplate = (pageType: string, template: any) => ({
  templates: {
    [pageType]: template,
  },
});

/**
 * Helper: Carga el settings_schema.json para los límites de búsqueda
 */
const loadSettingsSchema = async (storeId: string): Promise<Record<string, string>> => {
  try {
    const settingsSchema = await templateLoader.loadTemplate(storeId, 'config/settings_schema.json');
    return { 'config/settings_schema.json': settingsSchema };
  } catch (_error) {
    return {};
  }
};

/**
 * Helper: Carga todos los datos dinámicos necesarios para el contexto
 */
const loadDynamicPageData = async (storeId: string, pageType: string) => {
  const pageRenderOptions = buildPageRenderOptions(pageType);
  const loadedTemplates = await loadSettingsSchema(storeId);
  return dynamicDataLoader.loadDynamicData(storeId, pageRenderOptions, {}, loadedTemplates);
};

/**
 * Helper: Carga los menús de navegación de la tienda
 */
const loadNavigationMenus = async (storeId: string) => {
  return dataFetcher.getStoreNavigationMenus(storeId).catch(() => null);
};

/**
 * Helper: Construye el contexto completo combinando base y datos dinámicos
 */
const buildCompleteContext = async (
  store: any,
  pageData: any,
  navigationMenus: any,
  storeTemplate: any
): Promise<RenderContext> => {
  const baseContext = await contextBuilder.createRenderContext(
    store,
    pageData.products,
    storeTemplate,
    pageData.cartData,
    navigationMenus || undefined,
    pageData.contextData.checkout
  );

  Object.assign(baseContext, pageData.contextData);
  return baseContext;
};

/**
 * Helper: Renderiza la sección con el contexto completo
 */
const renderSectionWithContext = async (
  sectionType: string,
  sectionContent: string,
  context: RenderContext,
  storeTemplate: any,
  sectionId: string,
  pageType: string
): Promise<string> => {
  return sectionRenderer.renderSectionWithSchema(
    sectionType,
    sectionContent,
    context,
    storeTemplate,
    sectionId,
    pageType
  );
};

/**
 * Adaptador: Section Renderer
 * Implementación concreta para renderizar secciones usando Liquid
 */
export class SectionRendererAdapter implements ISectionRenderer {
  async renderSection(params: RenderSectionParams): Promise<RenderSectionResult> {
    try {
      const { storeId, sectionId, template, pageType } = params;

      const sectionConfig = getSectionConfig(template, sectionId);
      const [sectionContent, userStore, pageData, navigationMenus] = await Promise.all([
        loadSectionContent(storeId, sectionConfig.type),
        loadStoreData(storeId),
        loadDynamicPageData(storeId, pageType),
        loadNavigationMenus(storeId),
      ]);

      const store = buildStoreObject(userStore);
      const storeTemplate = buildStoreTemplate(pageType, template);
      const context = await buildCompleteContext(store, pageData, navigationMenus, storeTemplate);
      const html = await renderSectionWithContext(
        sectionConfig.type,
        sectionContent,
        context,
        storeTemplate,
        sectionId,
        pageType
      );

      return { html };
    } catch (error) {
      logger.error(`Error rendering section ${params.sectionId}`, error, 'SectionRendererAdapter');
      throw error;
    }
  }
}
