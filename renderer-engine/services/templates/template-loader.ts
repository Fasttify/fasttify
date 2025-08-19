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

import { liquidEngine } from '@/renderer-engine/liquid/engine';
import {
  cacheManager,
  getAssetCacheKey,
  getCompiledTemplateCacheKey,
  getTemplateCacheKey,
} from '@/renderer-engine/services/core/cache';
import type { TemplateCache, TemplateError } from '@/renderer-engine/types';
import { getCdnUrlForKey } from '@/utils/server';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Template } from 'liquidjs';

class TemplateLoader {
  private static instance: TemplateLoader;
  private s3Client?: S3Client;
  private readonly bucketName: string;
  private readonly isProduction: boolean;
  private ongoingRequests: Map<string, Promise<any>> = new Map();
  private ongoingAssetRequests: Map<string, Promise<Buffer>> = new Map();

  private constructor() {
    this.bucketName = process.env.BUCKET_NAME || '';
    this.isProduction = process.env.APP_ENV === 'production';

    // Solo inicializar S3 si tenemos bucket configurado
    if (this.bucketName) {
      this.s3Client = new S3Client({
        region: process.env.REGION_BUCKET || 'us-east-2',
      });
    }
  }

  public static getInstance(): TemplateLoader {
    if (!TemplateLoader.instance) {
      TemplateLoader.instance = new TemplateLoader();
    }
    return TemplateLoader.instance;
  }

  /**
   * Resuelve el nombre de un template a la clave completa de S3.
   * Esta es la lógica centralizada para construir las rutas de los templates Liquid.
   */
  private getS3TemplateKey(storeId: string, templateName: string): string {
    // Manejar templates específicos de Next.js que ya tienen un path completo y extensión.
    // Ej: 'layout/theme.liquid', 'templates/index.json', 'config/settings_schema.json'
    if (templateName.includes('/') && (templateName.endsWith('.liquid') || templateName.endsWith('.json'))) {
      return `templates/${storeId}/${templateName}`;
    }

    // Manejar snippets y secciones que vienen con su prefijo de carpeta (ej. 'snippets/nombre', 'sections/nombre')
    if (templateName.includes('/')) {
      return `templates/${storeId}/${templateName}.liquid`;
    }

    // Asumir que si no hay barra, es una sección simple (ej. 'cart', 'product', 'footer')
    // y se encuentra en la carpeta 'sections/'.
    return `templates/${storeId}/sections/${templateName}.liquid`;
  }

  /**
   * Carga una plantilla compilada, optimizado para renderizado.
   * Usa un cache para plantillas ya compiladas.
   */
  public async loadCompiledTemplate(storeId: string, templateName: string): Promise<Template[]> {
    const s3Key = this.getS3TemplateKey(storeId, templateName);
    const compiledCacheKey = getCompiledTemplateCacheKey(storeId, s3Key);
    const cachedCompiled = cacheManager.getCached(compiledCacheKey) as Template[] | null;
    if (cachedCompiled) {
      return cachedCompiled;
    }

    // Obtener contenido raw usando el método existente (que ya tiene su propio cache)
    const rawContent = await this.loadTemplate(storeId, templateName);

    // Compilar
    const compiledTemplate = liquidEngine.parse(rawContent);

    // Guardar en cache la versión compilada
    const cacheTTL = cacheManager.getTemplateTTL();
    cacheManager.setCached(compiledCacheKey, compiledTemplate, cacheTTL);

    return compiledTemplate;
  }

  /**
   * Carga una plantilla específica desde S3 o CloudFront
   */
  public async loadTemplate(storeId: string, templateName: string): Promise<string> {
    const s3Key = this.getS3TemplateKey(storeId, templateName);
    const cacheKey = getTemplateCacheKey(storeId, s3Key);

    // Unificación de peticiones: si ya hay una en vuelo, usarla (SOLO EN PRODUCCIÓN)
    if (this.isProduction && this.ongoingRequests.has(cacheKey)) {
      return this.ongoingRequests.get(cacheKey);
    }

    const cached = cacheManager.getCached(cacheKey) as TemplateCache | null;
    if (cached) {
      return cached.content;
    }

    const promise = this.fetchTemplateFromSource(storeId, s3Key, cacheKey);

    // Registrar la promesa en vuelo (SOLO EN PRODUCCIÓN)
    if (this.isProduction) {
      this.ongoingRequests.set(cacheKey, promise);
      promise.finally(() => {
        this.ongoingRequests.delete(cacheKey);
      });
    }

    return promise;
  }

  private async fetchTemplateFromSource(storeId: string, s3Key: string, cacheKey: string): Promise<string> {
    let content: string;
    try {
      // Usar CDN en producción para mejor rendimiento
      if (this.isProduction) {
        const response = await fetch(getCdnUrlForKey(s3Key));
        if (!response.ok) {
          throw new Error(`Template not found: ${s3Key}`);
        }
        content = await response.text();
      } else {
        // S3 directo en desarrollo
        if (!this.s3Client || !this.bucketName) {
          throw new Error('S3 client or bucket not configured');
        }

        const response = await this.s3Client.send(
          new GetObjectCommand({
            Bucket: this.bucketName,
            Key: s3Key,
          })
        );

        if (!response.Body) {
          throw new Error(`Template not found: ${s3Key}`);
        }

        content = await response.Body.transformToString();
      }

      // Cache with appropriate TTL using new hybrid system
      const cacheTTL = cacheManager.getTemplateTTL();
      cacheManager.setCached(
        cacheKey,
        {
          content,
          lastUpdated: new Date(),
          ttl: cacheTTL,
        },
        cacheTTL
      );

      return content;
    } catch (error) {
      const templateError: TemplateError = {
        type: 'TEMPLATE_NOT_FOUND',
        message: `Template not found: ${s3Key}`,
        details: error,
        statusCode: 404,
      };
      throw templateError;
    }
  }

  /**
   * Carga layout principal - Optimizado para velocidad
   */
  public async loadMainLayout(storeId: string): Promise<string> {
    return this.loadTemplate(storeId, 'layout/theme.liquid');
  }

  /**
   * Carga layout principal compilado.
   */
  public async loadMainLayoutCompiled(storeId: string): Promise<Template[]> {
    return this.loadCompiledTemplate(storeId, 'layout/theme.liquid');
  }

  /**
   * Carga sección específica - Optimizado para velocidad
   * NOTA: Este método ahora solo delega a loadTemplate ya que getS3TemplateKey
   * manejará la construcción de la ruta 'sections/nombre.liquid'
   */
  public async loadSection(storeId: string, sectionName: string): Promise<string> {
    return this.loadTemplate(storeId, sectionName);
  }

  /**
   * Carga una sección compilada.
   * NOTA: Este método ahora solo delega a loadCompiledTemplate ya que getS3TemplateKey
   * manejará la construcción de la ruta 'sections/nombre.liquid'
   */
  public async loadSectionCompiled(storeId: string, sectionName: string): Promise<Template[]> {
    return this.loadCompiledTemplate(storeId, sectionName);
  }

  /**
   * Carga asset optimizado para velocidad
   */
  public async loadAsset(storeId: string, assetPath: string): Promise<Buffer> {
    const cacheKey = getAssetCacheKey(storeId, assetPath);
    const cached = cacheManager.getCached(cacheKey) as TemplateCache | null;
    if (cached) {
      return Buffer.from(cached.content, 'base64');
    }

    // Unificación de requests concurrentes
    if (this.ongoingAssetRequests.has(cacheKey)) {
      return this.ongoingAssetRequests.get(cacheKey)!;
    }

    const promise = this.fetchAndCacheAsset(storeId, assetPath, cacheKey);
    this.ongoingAssetRequests.set(cacheKey, promise);
    promise.finally(() => {
      this.ongoingAssetRequests.delete(cacheKey);
    });
    return promise;
  }

  private async fetchAndCacheAsset(storeId: string, assetPath: string, cacheKey: string): Promise<Buffer> {
    let assetBuffer: Buffer;
    try {
      if (this.isProduction) {
        const response = await fetch(getCdnUrlForKey(`templates/${storeId}/assets/${assetPath}`));
        if (!response.ok) {
          throw new Error(`Asset not found: ${assetPath}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        assetBuffer = Buffer.from(arrayBuffer);
      } else {
        if (!this.s3Client || !this.bucketName) {
          throw new Error('S3 client or bucket not configured');
        }
        const response = await this.s3Client.send(
          new GetObjectCommand({
            Bucket: this.bucketName,
            Key: `templates/${storeId}/assets/${assetPath}`,
          })
        );
        if (!response.Body) {
          throw new Error(`Asset not found: ${assetPath}`);
        }
        const bytes = await response.Body.transformToByteArray();
        assetBuffer = Buffer.from(bytes);
      }
      // Cache asset using new hybrid system
      const cacheTTL = cacheManager.getTemplateTTL();
      cacheManager.setCached(
        cacheKey,
        {
          content: assetBuffer.toString('base64'),
          lastUpdated: new Date(),
          ttl: cacheTTL,
        },
        cacheTTL
      );
      return assetBuffer;
    } catch (error) {
      const templateError: TemplateError = {
        type: 'TEMPLATE_NOT_FOUND',
        message: `Asset not found: ${assetPath}`,
        details: error,
        statusCode: 404,
      };
      throw templateError;
    }
  }

  public invalidateStoreCache(storeId: string): void {
    cacheManager.invalidateStoreCache(storeId);
  }

  public invalidateTemplateCache(storeId: string, templatePath: string): void {
    // Invalidar tanto el cache de contenido raw como el compilado
    // Usar TTL de 0 para invalidación inmediata
    cacheManager.setCached(getTemplateCacheKey(storeId, templatePath), null, 0);
    cacheManager.setCached(getCompiledTemplateCacheKey(storeId, templatePath), null, 0);
  }

  public clearCache(): void {
    cacheManager.clearCache();
  }
}

export const templateLoader = TemplateLoader.getInstance();

export { TemplateLoader };
