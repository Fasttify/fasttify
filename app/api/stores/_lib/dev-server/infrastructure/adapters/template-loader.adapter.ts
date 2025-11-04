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

import { templateLoader } from '@/liquid-forge/services/templates/template-loader';
import type { ITemplateLoader } from '../../domain/ports/template-loader.port';
import type { Template, TemplateType } from '@fasttify/theme-studio';

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

function getTemplatePath(templateType: TemplateType): string {
  return TEMPLATE_PATHS[templateType] || `templates/${templateType}.json`;
}

/**
 * Adaptador: Template Loader
 * Implementación concreta para cargar templates desde S3 usando templateLoader de liquid-forge
 */
export class TemplateLoaderAdapter implements ITemplateLoader {
  async loadTemplate(storeId: string, templateType: TemplateType): Promise<Template> {
    const templatePath = getTemplatePath(templateType);
    const templateContent = await templateLoader.loadTemplate(storeId, templatePath);
    const templateConfig = JSON.parse(templateContent.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1'));

    return {
      type: templateType,
      sections: templateConfig.sections || {},
      order: templateConfig.order || [],
    };
  }

  async saveTemplate(_storeId: string, _templateType: TemplateType, _template: Template): Promise<void> {
    // TODO: Implementar guardado en S3
    // Por ahora solo en memoria durante la sesión
    throw new Error('Save template not implemented yet');
  }
}
