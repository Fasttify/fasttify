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

import { liquidEngine } from '@/liquid-forge/liquid/engine';
import {
  cacheManager,
  getAssetCacheKey,
  getCompiledTemplateCacheKey,
  getCompiledTemplatesPrefix,
  getTemplateCacheKey,
  getTemplatesPrefix,
} from '@/liquid-forge/services/core/cache';
import type { TemplateCache, TemplateError } from '@/liquid-forge/types';
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

  private static readonly CDN_HEADERS = {
    'User-Agent': 'Fasttify-API/1.0',
    'X-API-Source': 'fasttify-server',
  } as const;

  private constructor() {
    this.bucketName = process.env.BUCKET_NAME || '';
    this.isProduction = process.env.NODE_ENV === 'production';

    if (this.bucketName) {
      this.s3Client = new S3Client({
        region: process.env.REGION_BUCKET,
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
   * Resuelve `templateName` a la clave S3 final bajo `templates/{storeId}/...`.
   */
  private getS3TemplateKey(storeId: string, templateName: string): string {
    if (templateName.includes('/') && (templateName.endsWith('.liquid') || templateName.endsWith('.json'))) {
      return `templates/${storeId}/${templateName}`;
    }
    if (templateName.includes('/')) {
      return `templates/${storeId}/${templateName}.liquid`;
    }
    if (templateName.endsWith('.json')) {
      return `templates/${storeId}/sections/${templateName}`;
    }
    return `templates/${storeId}/sections/${templateName}.liquid`;
  }

  /**
   * TTL de caché para plantillas y assets.
   */
  private getTemplateCacheTTL(): number {
    return cacheManager.getTemplateTTL();
  }

  /**
   * Guarda contenido de plantilla en caché con metadatos.
   */
  private setCachedTemplate(cacheKey: string, content: string): void {
    const ttl = this.getTemplateCacheTTL();
    cacheManager.setCached(
      cacheKey,
      {
        content,
        lastUpdated: new Date(),
        ttl,
      },
      ttl
    );
  }

  /**
   * Guarda asset binario en caché (base64) con metadatos.
   */
  private setCachedAsset(cacheKey: string, buffer: Buffer): void {
    const ttl = this.getTemplateCacheTTL();
    cacheManager.setCached(
      cacheKey,
      {
        content: buffer.toString('base64'),
        lastUpdated: new Date(),
        ttl,
      },
      ttl
    );
  }

  /**
   * Crea error estandarizado para recursos de plantillas/assets.
   */
  private buildTemplateNotFoundError(message: string, details: unknown): TemplateError {
    return {
      type: 'TEMPLATE_NOT_FOUND',
      message,
      details,
      statusCode: 404,
    };
  }

  /**
   * Descarga texto desde CDN.
   */
  private async fetchTextFromCDN(key: string): Promise<string> {
    const response = await fetch(getCdnUrlForKey(key), { headers: TemplateLoader.CDN_HEADERS });
    if (!response.ok) {
      throw new Error(`Template not found: ${key}`);
    }
    return response.text();
  }

  /**
   * Descarga texto desde S3.
   */
  private async fetchTextFromS3(key: string): Promise<string> {
    if (!this.s3Client || !this.bucketName) {
      throw new Error('S3 client or bucket not configured');
    }
    const response = await this.s3Client.send(new GetObjectCommand({ Bucket: this.bucketName, Key: key }));
    if (!response.Body) {
      throw new Error(`Template not found: ${key}`);
    }
    return response.Body.transformToString();
  }

  /**
   * Descarga binario desde CDN.
   */
  private async fetchBinaryFromCDN(key: string): Promise<Buffer> {
    const response = await fetch(getCdnUrlForKey(key), { headers: TemplateLoader.CDN_HEADERS });
    if (!response.ok) {
      throw new Error(`Asset not found: ${key}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Descarga binario desde S3.
   */
  private async fetchBinaryFromS3(key: string): Promise<Buffer> {
    if (!this.s3Client || !this.bucketName) {
      throw new Error('S3 client or bucket not configured');
    }
    const response = await this.s3Client.send(new GetObjectCommand({ Bucket: this.bucketName, Key: key }));
    if (!response.Body) {
      throw new Error(`Asset not found: ${key}`);
    }
    const bytes = await response.Body.transformToByteArray();
    return Buffer.from(bytes);
  }

  /**
   * Coalescencia de requests concurrentes por clave.
   */
  private coalesce<T>(
    map: Map<string, Promise<T>>,
    key: string,
    factory: () => Promise<T>,
    enabled: boolean
  ): Promise<T> {
    if (enabled) {
      const existing = map.get(key);
      if (existing) return existing;
    }
    const promise = factory();
    if (enabled) {
      map.set(key, promise);
      promise.finally(() => map.delete(key));
    }
    return promise;
  }

  /**
   * Carga una plantilla compilada, optimizado para renderizado.
   * Usa un cache para plantillas ya compiladas.
   */
  public async loadCompiledTemplate(storeId: string, templateName: string): Promise<Template[]> {
    const s3Key = this.getS3TemplateKey(storeId, templateName);
    const compiledCacheKey = getCompiledTemplateCacheKey(storeId, s3Key);
    const cachedCompiled = cacheManager.getCached(compiledCacheKey) as Template[] | null;
    if (cachedCompiled) return cachedCompiled;
    const rawContent = await this.loadTemplate(storeId, templateName);
    const compiledTemplate = liquidEngine.parse(rawContent);
    cacheManager.setCached(compiledCacheKey, compiledTemplate, this.getTemplateCacheTTL());
    return compiledTemplate;
  }

  /**
   * Carga contenido raw de una plantilla con caché y coalescencia.
   */
  public async loadTemplate(storeId: string, templateName: string): Promise<string> {
    const s3Key = this.getS3TemplateKey(storeId, templateName);
    const cacheKey = getTemplateCacheKey(storeId, s3Key);
    if (this.isProduction && this.ongoingRequests.has(cacheKey)) {
      return this.ongoingRequests.get(cacheKey)!;
    }
    const cached = cacheManager.getCached(cacheKey) as TemplateCache | null;
    if (cached) return cached.content;
    return this.coalesce(
      this.ongoingRequests,
      cacheKey,
      () => this.fetchTemplateFromSource(s3Key, cacheKey),
      this.isProduction
    );
  }

  /**
   * Obtiene plantilla desde la fuente activa (CDN/S3) y cachea.
   */
  private async fetchTemplateFromSource(s3Key: string, cacheKey: string): Promise<string> {
    try {
      const content = this.isProduction ? await this.fetchTextFromCDN(s3Key) : await this.fetchTextFromS3(s3Key);
      this.setCachedTemplate(cacheKey, content);
      return content;
    } catch (error) {
      throw this.buildTemplateNotFoundError(`Template not found: ${s3Key}`, error);
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
   * Carga contenido raw de una sección.
   */
  public async loadSection(storeId: string, sectionName: string): Promise<string> {
    return this.loadTemplate(storeId, sectionName);
  }

  /**
   * Carga y compila una sección.
   */
  public async loadSectionCompiled(storeId: string, sectionName: string): Promise<Template[]> {
    return this.loadCompiledTemplate(storeId, sectionName);
  }

  /**
   * Carga asset binario con caché y coalescencia.
   */
  public async loadAsset(storeId: string, assetPath: string): Promise<Buffer> {
    const cacheKey = getAssetCacheKey(storeId, assetPath);
    const cached = cacheManager.getCached(cacheKey) as TemplateCache | null;
    if (cached) return Buffer.from(cached.content, 'base64');
    return this.coalesce(
      this.ongoingAssetRequests,
      cacheKey,
      () => this.fetchAndCacheAsset(storeId, assetPath, cacheKey),
      true
    );
  }

  /**
   * Descarga asset (CDN/S3) y lo cachea.
   */
  private async fetchAndCacheAsset(storeId: string, assetPath: string, cacheKey: string): Promise<Buffer> {
    try {
      const key = `templates/${storeId}/assets/${assetPath}`;
      const buffer = this.isProduction ? await this.fetchBinaryFromCDN(key) : await this.fetchBinaryFromS3(key);
      this.setCachedAsset(cacheKey, buffer);
      return buffer;
    } catch (error) {
      throw this.buildTemplateNotFoundError(`Asset not found: ${assetPath}`, error);
    }
  }

  /**
   * Invalida caché de todas las plantillas de una tienda.
   */
  public invalidateStoreCache(storeId: string): void {
    cacheManager.deleteByPrefix(getTemplatesPrefix(storeId));
    cacheManager.deleteByPrefix(getCompiledTemplatesPrefix(storeId));
  }

  /**
   * Invalida caché de una plantilla específica (raw y compilada).
   */
  public invalidateTemplateCache(storeId: string, templatePath: string): void {
    cacheManager.deleteKey(getTemplateCacheKey(storeId, templatePath));
    cacheManager.deleteKey(getCompiledTemplateCacheKey(storeId, templatePath));
  }

  public clearCache(): void {
    cacheManager.clearCache();
  }
}

export const templateLoader = TemplateLoader.getInstance();

export { TemplateLoader };
