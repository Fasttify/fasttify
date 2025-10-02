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

export interface PostCSSOptions {
  autoprefixer: boolean;
  removeComments: boolean;
  minify: boolean;
  environment: 'development' | 'production';
}

export interface ProcessingResult {
  content: string;
  originalSize: number;
  processedSize: number;
  compressionRatio: number;
}

export class PostCSSProcessor {
  private static instance: PostCSSProcessor;
  private cssProcessor: any;
  private jsProcessor: any;

  private constructor() {
    this.initializeProcessors();
  }

  public static getInstance(): PostCSSProcessor {
    if (!PostCSSProcessor.instance) {
      PostCSSProcessor.instance = new PostCSSProcessor();
    }
    return PostCSSProcessor.instance;
  }

  private async initializeProcessors(): Promise<void> {
    try {
      // Importar PostCSS dinámicamente para evitar errores si no está instalado
      const postcss = await import('postcss');
      const autoprefixer = await import('autoprefixer');
      const cssnano = await import('cssnano');

      // Configuración PostCSS
      this.cssProcessor = postcss.default([
        autoprefixer.default({
          // Configuración específica para evitar problemas con browserslist
          overrideBrowserslist: ['defaults', 'not IE 11', 'not IE_Mob 11'],
        }),
        cssnano.default({
          preset: 'default',
        }),
      ]);
    } catch (error) {
      this.cssProcessor = null;
    }

    // Para JS usamos minificación simple (como hacen los desarrolladores de Shopify)
    this.jsProcessor = {
      minify: (js: string): string => {
        return js
          .replace(/\/\/.*$/gm, '') // Comentarios de línea
          .replace(/\/\*[\s\S]*?\*\//g, '') // Comentarios de bloque
          .replace(/\s+/g, ' ') // Espacios
          .replace(/\s*([=+\-*/%&|^!~?:,;{}()\[\]<>])\s*/g, '$1')
          .trim();
      },
    };
  }

  public async processCSS(css: string, options?: Partial<PostCSSOptions>): Promise<ProcessingResult> {
    const originalSize = css.length;
    let processedCSS = css;

    try {
      if (this.cssProcessor) {
        // Usar PostCSS si está disponible
        const result = await this.cssProcessor.process(css, {
          from: undefined,
          to: undefined,
        });
        processedCSS = result.css;
      } else {
        // Fallback a minificación simple
        processedCSS = this.simpleCSSMinification(css);
      }

      const processedSize = processedCSS.length;
      const compressionRatio = originalSize > 0 ? ((originalSize - processedSize) / originalSize) * 100 : 0;

      return {
        content: processedCSS,
        originalSize,
        processedSize,
        compressionRatio,
      };
    } catch (error) {
      // Fallback a minificación simple
      processedCSS = this.simpleCSSMinification(css);
      const processedSize = processedCSS.length;
      const compressionRatio = originalSize > 0 ? ((originalSize - processedSize) / originalSize) * 100 : 0;

      return {
        content: processedCSS,
        originalSize,
        processedSize,
        compressionRatio,
      };
    }
  }

  public async processJS(js: string): Promise<ProcessingResult> {
    const originalSize = js.length;

    try {
      const processedJS = this.jsProcessor.minify(js);
      const processedSize = processedJS.length;
      const compressionRatio = originalSize > 0 ? ((originalSize - processedSize) / originalSize) * 100 : 0;

      return {
        content: processedJS,
        originalSize,
        processedSize,
        compressionRatio,
      };
    } catch (error) {
      return {
        content: js, // Fallback al original
        originalSize,
        processedSize: originalSize,
        compressionRatio: 0,
      };
    }
  }

  public async processAsset(content: string, filePath: string): Promise<ProcessingResult> {
    if (filePath.endsWith('.css') || filePath.endsWith('.css.liquid')) {
      return await this.processCSS(content);
    }

    if (filePath.endsWith('.js') || filePath.endsWith('.js.liquid')) {
      return await this.processJS(content);
    }

    if (filePath.endsWith('.liquid')) {
      return await this.processLiquid(content);
    }

    // Para otros tipos de archivo, no procesar
    return {
      content,
      originalSize: content.length,
      processedSize: content.length,
      compressionRatio: 0,
    };
  }

  public async processLiquid(liquid: string): Promise<ProcessingResult> {
    const originalSize = liquid.length;

    try {
      const processedLiquid = this.minifyLiquid(liquid);
      const processedSize = processedLiquid.length;
      const compressionRatio = originalSize > 0 ? ((originalSize - processedSize) / originalSize) * 100 : 0;

      return {
        content: processedLiquid,
        originalSize,
        processedSize,
        compressionRatio,
      };
    } catch (error) {
      return {
        content: liquid, // Fallback al original
        originalSize,
        processedSize: originalSize,
        compressionRatio: 0,
      };
    }
  }

  private minifyLiquid(liquid: string): string {
    // Remove all HTML comments robustly (keep removing until none remain)
    let result = liquid;
    let prev;
    do {
      prev = result;
      result = result.replace(/<!--[\s\S]*?-->/g, '');
    } while (result !== prev);

    return (
      result
        // Eliminar comentarios Liquid ({% comment %} ... {% endcomment %})
        .replace(/\{%\s*comment\s*%\}[\s\S]*?\{%\s*endcomment\s*%\}/g, '')
        // Eliminar comentarios CSS (/* ... */) - SOLO en bloques <style>
        .replace(/<style[^>]*>([\s\S]*?)<\/style\b[^>]*>/gi, (match, styleContent) => {
          const cleanedContent = styleContent.replace(/\/\*[\s\S]*?\*\//g, '');
          return match.replace(styleContent, cleanedContent);
        })
        // Eliminar comentarios JavaScript (// ... y /* ... */) - SOLO en bloques <script>
        .replace(/<script[^>]*>([\s\S]*?)<\/script\b[^>]*>/gi, (match, scriptContent) => {
          const cleanedContent = scriptContent.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
          return match.replace(scriptContent, cleanedContent);
        })
        // Eliminar espacios múltiples en líneas completas (pero preservar contenido dentro de tags)
        .replace(/^[ \t]+|[ \t]+$/gm, '')
        // Comprimir múltiples saltos de línea
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim()
    );
  }

  private simpleCSSMinification(css: string): string {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Eliminar comentarios
      .replace(/\s+/g, ' ') // Comprimir espacios
      .replace(/\s*([{}|:;,])\s*/g, '$1') // Optimizar sintaxis
      .trim();
  }

  public isPostCSSAvailable(): boolean {
    return this.cssProcessor !== null;
  }
}
