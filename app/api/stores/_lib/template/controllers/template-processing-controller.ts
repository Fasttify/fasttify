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

import { getCdnUrlForKey } from '@/utils/server';
import type { ThemeFile } from '@/renderer-engine/services/themes/types';
import type { TemplateObject, CopyResult, StoreConfig, TemplateMetadata } from '@/api/stores/template/types';
import { S3TemplateController } from '@/api/stores/_lib/template/controllers/s3-template-controller';

export class TemplateProcessingController {
  private s3Controller: S3TemplateController;
  private readonly BASE_TEMPLATE_PREFIX = 'base-templates/default/';

  constructor() {
    this.s3Controller = new S3TemplateController();
  }

  /**
   * Carga los objetos del template base desde S3 y los convierte en ThemeFile[]
   */
  async loadBaseTemplateAsThemeFiles(templateObjects: TemplateObject[]): Promise<ThemeFile[]> {
    const files: ThemeFile[] = [];

    for (const obj of templateObjects) {
      try {
        const body = await this.s3Controller.getObjectContent(obj.key);
        if (!body) continue;

        const isText = this.isTextLike(obj.relativePath);
        const content = isText ? new TextDecoder('utf-8').decode(body) : Buffer.from(body);

        files.push({
          path: obj.relativePath,
          content,
          type: this.determineFileType(obj.relativePath),
          size: body.length,
          lastModified: new Date(),
        });
      } catch (e) {
        console.error('Failed to load base template file from S3', obj.key, e);
      }
    }

    return files;
  }

  /**
   * Procesa la plantilla completa: lista, copia y genera URLs
   */
  async processTemplate(
    storeId: string,
    storeConfig: StoreConfig
  ): Promise<{
    templateObjects: TemplateObject[];
    copyResults: CopyResult[];
    templateUrls: Record<string, string>;
  }> {
    // 1. Listar todos los objetos de la plantilla base
    const templateObjects = await this.s3Controller.listBaseTemplateObjects(this.BASE_TEMPLATE_PREFIX);

    // 2. Crear metadatos para personalización
    const metadata = this.createTemplateMetadata(storeId, storeConfig);

    // 3. Copiar cada objeto a la carpeta del usuario
    const copyResults = await this.s3Controller.copyTemplateToUserStore(templateObjects, storeId, metadata);

    // 4. Generar URLs de las plantillas
    const templateUrls = this.generateTemplateUrls(copyResults);

    return {
      templateObjects,
      copyResults,
      templateUrls,
    };
  }

  /**
   * Genera URLs de plantillas usando CDN
   */
  private generateTemplateUrls(copyResults: CopyResult[]): Record<string, string> {
    const urls: Record<string, string> = {};

    copyResults.forEach(({ key, path }) => {
      urls[path] = getCdnUrlForKey(key);
    });

    return urls;
  }

  /**
   * Crea metadatos para personalización de la plantilla
   */
  private createTemplateMetadata(storeId: string, storeConfig: StoreConfig): TemplateMetadata {
    return {
      'store-id': storeId,
      'store-name': this.sanitizeMetadataValue(storeConfig.storeName),
      'store-domain': storeConfig.domain,
      'store-description': this.sanitizeMetadataValue(storeConfig.storeData.description || ''),
      'store-currency': storeConfig.storeData.currency || 'USD',
      'store-theme': storeConfig.storeData.theme || 'modern',
      'template-type': 'store-template',
      'upload-time': new Date().toISOString(),
    };
  }

  /**
   * Determina si un archivo es de tipo texto
   */
  private isTextLike(path: string): boolean {
    const ext = path.toLowerCase().split('.').pop() || '';
    return ['liquid', 'json', 'css', 'js', 'html', 'xml', 'txt', 'md'].includes(ext);
  }

  /**
   * Determina el tipo de archivo basado en su extensión
   */
  private determineFileType(path: string): 'liquid' | 'json' | 'css' | 'js' | 'image' | 'font' | 'other' {
    const extension = path.toLowerCase().split('.').pop() || '';
    if (extension === 'liquid') return 'liquid';
    if (extension === 'json') return 'json';
    if (extension === 'css') return 'css';
    if (extension === 'js') return 'js';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension)) return 'image';
    if (['woff', 'woff2', 'ttf', 'eot', 'otf'].includes(extension)) return 'font';
    return 'other';
  }

  /**
   * Sanitiza valores de metadatos para S3
   */
  private sanitizeMetadataValue(value: string): string {
    return value.replace(/[^\x00-\x7F]/g, '');
  }

  /**
   * Busca una URL de preview dentro de los archivos copiados del template
   */
  findPreviewUrlFromTemplateUrls(urls: Record<string, string>): string | undefined {
    const candidates = [
      'assets/preview.png',
      'assets/preview.jpg',
      'assets/preview.webp',
      'assets/screenshot.png',
      'assets/screenshot.jpg',
      'assets/screenshot.webp',
      'preview.png',
      'preview.jpg',
      'preview.webp',
      'screenshot.png',
      'screenshot.jpg',
      'screenshot.webp',
    ];

    // Intentar coincidencia exacta por clave
    for (const name of candidates) {
      if (urls[name]) return urls[name];
    }

    // Si no está exacto, buscar por sufijo en claves (por si vienen en subcarpetas)
    const keys = Object.keys(urls);
    for (const key of keys) {
      if (candidates.some((c) => key.endsWith('/' + c) || key.toLowerCase().endsWith('/' + c))) {
        return urls[key];
      }
    }
    return undefined;
  }
}
