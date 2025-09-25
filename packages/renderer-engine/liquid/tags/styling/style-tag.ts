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

import { Tag, TagToken, Context, TopLevelToken, Liquid, TokenKind } from 'liquidjs';
import { AssetCollector } from '@/renderer-engine/services/rendering/asset-collector';
import { logger } from '@/renderer-engine/lib/logger';

/**
 * Custom Style Tag para manejar {% style %} en LiquidJS
 * Genera CSS dinámico con variables Liquid
 */
export class StyleTag extends Tag {
  private cssContent: string = '';

  constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(tagToken, remainTokens, liquid);

    // Parsear el contenido CSS entre {% style %} y {% endstyle %}
    this.parseCSSContent(remainTokens);
  }

  private parseCSSContent(remainTokens: TopLevelToken[]): void {
    let depth = 1;
    let content = '';

    for (let i = 0; i < remainTokens.length; i++) {
      const token = remainTokens[i];

      if (token.kind === TokenKind.Tag) {
        const tagToken = token as any;
        if (tagToken.name === 'style') {
          depth++;
        } else if (tagToken.name === 'endstyle') {
          depth--;
          if (depth === 0) {
            // Remover los tokens procesados
            remainTokens.splice(0, i + 1);
            break;
          }
        }
      }

      if (depth > 0) {
        // Capturar todo el contenido, incluyendo texto y expresiones Liquid
        if (token.kind === TokenKind.HTML) {
          // Acceder correctamente al contenido HTML usando begin y end
          const htmlToken = token as any;
          const tokenContent = htmlToken.input
            ? htmlToken.input.substring(htmlToken.begin, htmlToken.end)
            : htmlToken.content || '';
          content += tokenContent;
        } else if (token.kind === TokenKind.Output) {
          // Reconstruir la expresión de output
          const outputToken = token as any;
          const tokenContent = outputToken.content || outputToken.value || '';
          content += `{{ ${tokenContent} }}`;
        } else if (token.kind === TokenKind.Tag) {
          // Reconstruir la tag completa
          const tagToken = token as any;
          const tokenContent = tagToken.content || tagToken.value || '';
          content += `{% ${tokenContent} %}`;
        }
      }
    }

    this.cssContent = content.trim();
  }

  *render(ctx: Context): Generator<any, void, unknown> {
    const assetCollector = (this.liquid.options.globals as any)._assetCollector as AssetCollector | undefined;
    const sectionId = ctx.getSync(['section', 'id']) as string | undefined;

    if (!assetCollector || !this.cssContent.trim()) {
      return;
    }

    try {
      const template = this.liquid.parse(this.cssContent);
      const processedCSS = (yield this.liquid.render(template, ctx.getAll())) as string;
      const uniqueId = sectionId || `style-${Math.random().toString(36).substring(2, 9)}`;
      // Temporalmente sin optimización para debugging
      const finalCSS = processedCSS.trim();

      assetCollector.addCss(finalCSS, uniqueId);
    } catch (error) {
      logger.error('Error processing CSS in style tag', error, 'StyleTag');
    }
  }

  /**
   * Optimiza y limpia el CSS generado
   */
  private optimizeCSS(css: string): string {
    return (
      css
        // Remover comentarios CSS
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remover espacios múltiples
        .replace(/\s+/g, ' ')
        // Remover espacios antes y después de llaves y dos puntos
        .replace(/\s*{\s*/g, ' { ')
        .replace(/\s*}\s*/g, ' } ')
        .replace(/\s*:\s*/g, ': ')
        .replace(/\s*;\s*/g, '; ')
        // Limpiar líneas vacías
        .replace(/^\s*[\r\n]/gm, '')
        .trim()
    );
  }
}

/**
 * Stylesheet Tag - Para CSS en secciones
 * Similar a Style Tag pero con funcionalidades adicionales
 */
export class StylesheetTag extends Tag {
  private cssContent: string = '';

  constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(tagToken, remainTokens, liquid);

    // Parsear el contenido CSS entre {% stylesheet %} y {% endstylesheet %}
    this.parseCSSContent(remainTokens);
  }

  private parseCSSContent(remainTokens: TopLevelToken[]): void {
    let depth = 1;
    let content = '';

    for (let i = 0; i < remainTokens.length; i++) {
      const token = remainTokens[i];

      if (token.kind === TokenKind.Tag) {
        const tagToken = token as any;
        if (tagToken.name === 'stylesheet') {
          depth++;
        } else if (tagToken.name === 'endstylesheet') {
          depth--;
          if (depth === 0) {
            // Remover los tokens procesados
            remainTokens.splice(0, i + 1);
            break;
          }
        }
      }

      if (depth > 0) {
        // Capturar todo el contenido
        if (token.kind === TokenKind.HTML) {
          // Acceder correctamente al contenido HTML usando begin y end
          const htmlToken = token as any;
          const tokenContent = htmlToken.input ? htmlToken.input.substring(htmlToken.begin, htmlToken.end) : '';
          content += tokenContent;
        } else if (token.kind === TokenKind.Output) {
          // Reconstruir la expresión de output
          const outputToken = token as any;
          const tokenContent = outputToken.content || outputToken.value || '';
          content += `{{ ${tokenContent} }}`;
        } else if (token.kind === TokenKind.Tag) {
          // Reconstruir la tag completa
          const tagToken = token as any;
          const tokenContent = tagToken.content || tagToken.value || '';
          content += `{% ${tokenContent} %}`;
        }
      }
    }

    this.cssContent = content.trim();
  }

  *render(ctx: Context): Generator<any, void, unknown> {
    const assetCollector = (this.liquid.options.globals as any)._assetCollector as AssetCollector | undefined;
    const sectionId = ctx.getSync(['section', 'id']) as string | undefined;

    if (!assetCollector || !this.cssContent.trim()) {
      return;
    }

    try {
      const template = this.liquid.parse(this.cssContent);
      const processedCSS = (yield this.liquid.render(template, ctx.getAll())) as string;
      const uniqueId = sectionId || `stylesheet-${Math.random().toString(36).substring(2, 9)}`;
      assetCollector.addCss(processedCSS, uniqueId);
    } catch (error) {
      logger.error('Error processing CSS in stylesheet tag', error, 'StylesheetTag');
    }
  }
}
