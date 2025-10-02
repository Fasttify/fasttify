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
import { liquidEngine } from '@/liquid-forge/liquid/engine';
import type { RenderResult, ShopContext, TemplateError } from '@/liquid-forge/types';
import {
  extractStoreName,
  getErrorDescription,
  getErrorSuggestions,
  getErrorTitle,
  getFriendlyMessage,
} from '@/liquid-forge/services/errors/error-messages';
import {
  getDataErrorTemplate,
  getFallbackErrorPageTemplate,
  getRenderErrorTemplate,
  getStoreNotActiveTemplate,
  getStoreNotFoundTemplate,
  getTemplateNotFoundTemplate,
} from '@/liquid-forge/services/errors/error-templates';

export interface ErrorRenderOptions {
  storeId?: string;
  domain: string;
  path?: string;
  store?: ShopContext;
}

export class ErrorRenderer {
  /**
   * Renderiza una página de error amigable usando templates Liquid
   */
  public async renderError(error: TemplateError, options: ErrorRenderOptions): Promise<RenderResult> {
    try {
      // Crear contexto básico para el error
      const context = this.createErrorContext(error, options);

      // Seleccionar template según el tipo de error
      const template = this.getErrorTemplate(error.type);

      // Renderizar el error con Liquid
      const html = await liquidEngine.render(template, context, `error_${error.type}`);

      const storeName = extractStoreName(options.domain);
      const title = getErrorTitle(error.type, storeName);

      return {
        html,
        metadata: {
          icons: options.store?.favicon || '/favicon.ico',
          title,
          description: getErrorDescription(error.type),
          openGraph: {
            title,
            description: getErrorDescription(error.type),
            url: options.domain + (options.path || ''),
            type: 'website',
            site_name: storeName,
          },
          schema: {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: title,
            description: getErrorDescription(error.type),
          },
        },
        cacheKey: `error_${error.type}_${Date.now()}`,
        cacheTTL: 0, // No cachear errores
      };
    } catch (renderError) {
      // Si falla el renderizado de error, devolver HTML básico
      logger.error('Error rendering error page', renderError, 'ErrorRenderer');
      return this.getFallbackErrorPage(error, options);
    }
  }

  /**
   * Crea el contexto para renderizar errores
   */
  private createErrorContext(error: TemplateError, options: ErrorRenderOptions) {
    const storeName = extractStoreName(options.domain);

    return {
      error: {
        type: error.type,
        message: error.message,
        status_code: error.statusCode,
        friendly_message: getFriendlyMessage(error.type),
        suggestions: getErrorSuggestions(error.type),
        show_details: process.env.NODE_ENV === 'development',
        details: error.details,
      },
      store: options.store || {
        name: storeName,
        domain: options.domain,
        url: `https://${options.domain}`,
      },
      page: {
        title: getErrorTitle(error.type, storeName),
        template: 'error',
        url: options.domain + (options.path || ''),
      },
      settings: {
        show_breadcrumbs: false,
        show_navigation: false,
      },
    };
  }

  /**
   * Obtiene el template HTML para cada tipo de error
   */
  private getErrorTemplate(errorType: TemplateError['type']): string {
    switch (errorType) {
      case 'STORE_NOT_FOUND':
        return getStoreNotFoundTemplate();
      case 'TEMPLATE_NOT_FOUND':
        return getTemplateNotFoundTemplate();
      case 'RENDER_ERROR':
        return getRenderErrorTemplate();
      case 'DATA_ERROR':
        return getDataErrorTemplate();
      case 'STORE_NOT_ACTIVE':
        return getStoreNotActiveTemplate();
      default:
        return getRenderErrorTemplate();
    }
  }

  /**
   * Página de error de respaldo si falla el renderizado de error
   */
  private getFallbackErrorPage(error: TemplateError, options: ErrorRenderOptions): RenderResult {
    const html = getFallbackErrorPageTemplate();
    return {
      html,
      metadata: {
        icons: '/favicon.ico',
        title: 'Error - Fasttify',
        description: 'Se produjo un error inesperado',
        openGraph: {
          title: 'Error - Fasttify',
          description: 'Se produjo un error inesperado',
          url: options.domain,
          type: 'website',
          site_name: 'Fasttify',
        },
        schema: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Error',
        },
      },
      cacheKey: `fallback_error_${Date.now()}`,
      cacheTTL: 0,
    };
  }
}

// Exportar instancia singleton
export const errorRenderer = new ErrorRenderer();
