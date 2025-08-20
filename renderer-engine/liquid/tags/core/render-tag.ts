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

import { Tag, TagToken, Context, TopLevelToken, Liquid } from 'liquidjs';
import { logger } from '@/renderer-engine/lib/logger';

/**
 * Custom Render Tag para manejar {% render 'snippet' %} en LiquidJS
 * Replica la funcionalidad de inclusión de snippets de Shopify
 */
export class RenderTag extends Tag {
  private snippetName!: string;
  private parameters: Map<string, string> = new Map();

  constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(tagToken, remainTokens, liquid);
    this.parseArguments(tagToken);
  }

  private parseArguments(tagToken: TagToken): void {
    const args = tagToken.args?.trim() || '';

    if (!args) {
      throw new Error('Render tag requires a snippet name');
    }

    // Separar el nombre del snippet de los parámetros
    const parts = args.split(',').map((part) => part.trim());

    // Limpiar el nombre del snippet (remover comillas)
    this.snippetName = parts[0].replace(/^['"]|['"]$/g, '');

    // Parsear parámetros opcionales
    for (let i = 1; i < parts.length; i++) {
      const param = parts[i];
      const colonIndex = param.indexOf(':');

      if (colonIndex === -1) {
        throw new Error(`Invalid parameter syntax: ${param}. Expected "key: value"`);
      }

      const key = param.substring(0, colonIndex).trim();
      const value = param.substring(colonIndex + 1).trim();

      this.parameters.set(key, value);
    }
  }

  *render(ctx: Context, emitter: any): Generator<any, void, unknown> {
    if (!this.snippetName) {
      emitter.write('<!-- Error: Snippet name cannot be empty -->');
      return;
    }

    try {
      // Cargar el contenido del snippet
      const snippetContent = (yield this.loadSnippet(this.snippetName, ctx)) as string;

      if (!snippetContent) {
        logger.warn(`Snippet '${this.snippetName}' not found`, undefined, 'RenderTag');
        emitter.write(`<!-- Snippet '${this.snippetName}' not found -->`);
        return;
      }

      // Evaluar parámetros usando LiquidJS
      const evaluatedParams: Record<string, unknown> = {};
      for (const [key, value] of this.parameters) {
        try {
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            evaluatedParams[key] = value.slice(1, -1);
          } else {
            const template = this.liquid.parse(`{{ ${value} }}`);
            const result = yield this.liquid.render(template, ctx.getAll());
            evaluatedParams[key] = String(result).trim();
          }
        } catch (error) {
          logger.warn(`Error evaluating parameter '${key}': '${value}'`, error, 'RenderTag');
          evaluatedParams[key] = value;
        }
      }

      // Crear contexto combinado
      const combinedContext = { ...ctx.getAll(), ...evaluatedParams };

      // Parsear y renderizar el snippet
      const template = this.liquid.parse(snippetContent);
      const result = yield this.liquid.render(template, combinedContext);

      emitter.write(result as string);
    } catch (error) {
      logger.error(`Error rendering snippet '${this.snippetName}'`, error, 'RenderTag');
      emitter.write(`<!-- Error rendering snippet '${this.snippetName}' -->`);
    }
  }

  /**
   * Carga el contenido de un snippet usando el TemplateLoader
   */
  private async loadSnippet(snippetName: string, ctx: Context): Promise<string | null> {
    try {
      // Obtener storeId del contexto
      const contextData = ctx.getAll() as any;
      const storeId = contextData.store?.storeId || contextData.storeId;

      if (!storeId) {
        logger.warn(`No storeId found in context for snippet '${snippetName}'`, undefined, 'RenderTag');
        return `<!-- Error: No storeId found for snippet '${snippetName}' -->`;
      }

      // Usar el TemplateLoader para cargar el snippet
      const { TemplateLoader } = await import('@/renderer-engine/services/templates/template-loader');
      const templateLoader = TemplateLoader.getInstance();

      // Los snippets están en la carpeta 'snippets'
      const snippetFileName = snippetName.endsWith('.liquid') ? snippetName : `${snippetName}.liquid`;
      const snippetPath = `snippets/${snippetFileName}`;

      const snippetContent = await templateLoader.loadTemplate(storeId, snippetPath);

      if (!snippetContent) {
        logger.warn(`Snippet '${snippetName}' is empty`, undefined, 'RenderTag');
        return `<!-- Warning: Snippet '${snippetName}' is empty -->`;
      }

      return snippetContent;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.warn(`Could not load snippet '${snippetName}'`, error, 'RenderTag');

      // Devolver comentario HTML en lugar de null para mejor debugging
      return `<!-- Error loading snippet '${snippetName}': ${errorMessage} -->`;
    }
  }
}

/**
 * Include Tag (deprecated) - alias para Render Tag
 * Shopify ha deprecado {% include %} en favor de {% render %}
 * pero mantenemos compatibilidad
 */
export class IncludeTag extends RenderTag {
  constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(tagToken, remainTokens, liquid);
  }
}
