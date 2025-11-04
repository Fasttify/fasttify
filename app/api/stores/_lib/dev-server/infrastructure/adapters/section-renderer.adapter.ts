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
import { cookiesClient } from '@/utils/server/AmplifyServer';
import type {
  ISectionRenderer,
  RenderSectionParams,
  RenderSectionResult,
} from '../../domain/ports/section-renderer.port';
import { logger } from '@/liquid-forge';

/**
 * Adaptador: Section Renderer
 * Implementación concreta para renderizar secciones usando Liquid
 */
export class SectionRendererAdapter implements ISectionRenderer {
  async renderSection(params: RenderSectionParams): Promise<RenderSectionResult> {
    try {
      const { storeId, sectionId, template, pageType } = params;

      // Obtener la configuración de la sección del template
      const sectionConfig = template.sections[sectionId];
      if (!sectionConfig) {
        throw new Error(`Section ${sectionId} not found in template`);
      }

      // Cargar el contenido Liquid de la sección
      const sectionContent = await templateLoader.loadTemplate(storeId, `${sectionConfig.type}.liquid`);

      // Obtener datos de la tienda desde la base de datos
      const { data: userStore } = await cookiesClient.models.UserStore.get({ storeId });
      if (!userStore) {
        throw new Error(`Store ${storeId} not found`);
      }

      // Construir el objeto store con la estructura esperada por contextBuilder
      const store = {
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
        storeStatus: true, // Asumir activo para dev server
      };

      // Construir el contexto base para renderizar
      const baseContext = await contextBuilder.createRenderContext(
        store,
        [], // products - vacío para hot-reload
        {
          templates: {
            [pageType]: template,
          },
        }
      );

      // Renderizar la sección usando el sectionRenderer existente
      const html = await sectionRenderer.renderSectionWithSchema(
        sectionConfig.type,
        sectionContent,
        baseContext,
        {
          templates: {
            [pageType]: template,
          },
        },
        sectionId,
        pageType
      );

      return {
        html,
      };
    } catch (error) {
      logger.error(`Error rendering section ${params.sectionId}`, error, 'SectionRendererAdapter');
      throw error;
    }
  }
}
