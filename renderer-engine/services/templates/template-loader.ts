import { liquidEngine } from '@/renderer-engine/liquid/engine';
import { cacheManager } from '@/renderer-engine/services/core/cache-manager';
import type { TemplateCache, TemplateError } from '@/renderer-engine/types';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Template } from 'liquidjs';

class TemplateLoader {
  private static instance: TemplateLoader;
  private s3Client?: S3Client;
  private readonly bucketName: string;
  private readonly cloudFrontDomain: string;
  private readonly isProduction: boolean;
  private ongoingRequests: Map<string, Promise<any>> = new Map();

  private constructor() {
    this.bucketName = process.env.BUCKET_NAME || '';
    this.cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN_NAME || '';
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
   * Carga una plantilla compilada, optimizado para renderizado.
   * Usa un cache para plantillas ya compiladas.
   */
  public async loadCompiledTemplate(storeId: string, templatePath: string): Promise<Template[]> {
    const compiledCacheKey = `compiled_template_${storeId}_${templatePath}`;
    const cachedCompiled = cacheManager.getCached(compiledCacheKey) as Template[] | null;
    if (cachedCompiled) {
      return cachedCompiled;
    }

    // Obtener contenido raw usando el método existente (que ya tiene su propio cache)
    const rawContent = await this.loadTemplate(storeId, templatePath);

    // Compilar
    const compiledTemplate = liquidEngine.parse(rawContent);

    // Guardar en cache la versión compilada
    const cacheTTL = cacheManager.getAppropiateTTL('template');
    cacheManager.setCached(compiledCacheKey, compiledTemplate, cacheTTL);

    return compiledTemplate;
  }

  /**
   * Carga una plantilla específica desde S3 o CloudFront
   */
  public async loadTemplate(storeId: string, templatePath: string): Promise<string> {
    const cacheKey = `template_${storeId}_${templatePath}`;

    // Unificación de peticiones: si ya hay una en vuelo, usarla (SOLO EN PRODUCCIÓN)
    if (this.isProduction && this.ongoingRequests.has(cacheKey)) {
      return this.ongoingRequests.get(cacheKey);
    }

    const cached = cacheManager.getCached(cacheKey) as TemplateCache | null;
    if (cached) {
      return cached.content;
    }

    const promise = this.fetchTemplateFromSource(storeId, templatePath, cacheKey);

    // Registrar la promesa en vuelo (SOLO EN PRODUCCIÓN)
    if (this.isProduction) {
      this.ongoingRequests.set(cacheKey, promise);
      promise.finally(() => {
        this.ongoingRequests.delete(cacheKey);
      });
    }

    return promise;
  }

  private async fetchTemplateFromSource(storeId: string, templatePath: string, cacheKey: string): Promise<string> {
    let content: string;
    try {
      // Usar CloudFront en producción para mejor rendimiento
      if (this.isProduction && this.cloudFrontDomain) {
        const response = await fetch(`https://${this.cloudFrontDomain}/templates/${storeId}/${templatePath}`);
        if (!response.ok) {
          throw new Error(`Template not found: ${templatePath}`);
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
            Key: `templates/${storeId}/${templatePath}`,
          })
        );

        if (!response.Body) {
          throw new Error(`Template not found: ${templatePath}`);
        }

        content = await response.Body.transformToString();
      }

      // Cache with appropriate TTL
      const cacheTTL = cacheManager.getAppropiateTTL('template');
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
        message: `Template not found: ${templatePath}`,
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
   */
  public async loadSection(storeId: string, sectionName: string): Promise<string> {
    const fileName = sectionName.endsWith('.liquid') ? sectionName : `${sectionName}.liquid`;
    return this.loadTemplate(storeId, `sections/${fileName}`);
  }

  /**
   * Carga una sección compilada.
   */
  public async loadSectionCompiled(storeId: string, sectionName: string): Promise<Template[]> {
    const fileName = sectionName.endsWith('.liquid') ? sectionName : `${sectionName}.liquid`;
    return this.loadCompiledTemplate(storeId, `sections/${fileName}`);
  }

  /**
   * Carga asset optimizado para velocidad
   */
  public async loadAsset(storeId: string, assetPath: string): Promise<Buffer> {
    const cacheKey = `asset_${storeId}_${assetPath}`;
    const cached = cacheManager.getCached(cacheKey) as TemplateCache | null;
    if (cached) {
      return Buffer.from(cached.content, 'base64');
    }

    let assetBuffer: Buffer;

    try {
      if (this.isProduction && this.cloudFrontDomain) {
        const response = await fetch(`https://${this.cloudFrontDomain}/templates/${storeId}/assets/${assetPath}`);
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

      // Cache asset
      cacheManager.setCached(
        cacheKey,
        {
          content: assetBuffer.toString('base64'),
          lastUpdated: new Date(),
          ttl: cacheManager.TEMPLATE_CACHE_TTL,
        },
        cacheManager.TEMPLATE_CACHE_TTL
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
    cacheManager.setCached(`template_${storeId}_${templatePath}`, null, 0);
    cacheManager.setCached(`compiled_template_${storeId}_${templatePath}`, null, 0);
  }

  public clearCache(): void {
    cacheManager.clearCache();
  }
}

export const templateLoader = TemplateLoader.getInstance();

export { TemplateLoader };
