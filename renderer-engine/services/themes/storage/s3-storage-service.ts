import { RendererLogger } from '@/renderer-engine/lib/logger';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { ProcessedTheme, ThemeFile } from '../types';

export interface ThemeStorageResult {
  success: boolean;
  storeId: string;
  s3Key: string;
  cdnUrl?: string;
  error?: string;
}

/**
 * Servicio para almacenar temas en S3
 */
export class S3StorageService {
  private static instance: S3StorageService;
  private logger = RendererLogger;
  private s3Client: S3Client;

  private constructor() {
    this.s3Client = new S3Client({
      region: process.env.REGION_BUCKET || 'us-east-2',
    });
  }

  public static getInstance(): S3StorageService {
    if (!S3StorageService.instance) {
      S3StorageService.instance = new S3StorageService();
    }
    return S3StorageService.instance;
  }

  /**
   * Almacena un tema procesado en S3
   */
  public async storeTheme(theme: ProcessedTheme, storeId: string, originalZipFile: File): Promise<ThemeStorageResult> {
    try {
      this.logger.info('Starting theme storage to S3', { themeId: theme.id, storeId }, 'S3StorageService');

      // 1. Crear estructura de carpetas
      const baseKey = this.generateThemeKey(storeId);

      // 2. Subir archivo ZIP original
      const zipKey = `${baseKey}/theme.zip`;
      const zipResult = await this.uploadFile(originalZipFile, zipKey);

      if (!zipResult.success) {
        throw new Error(`Failed to upload ZIP file: ${zipResult.error}`);
      }

      // 3. Subir archivos individuales organizados (solo si están disponibles)
      if (theme.files && theme.files.length > 0) {
        const filesResult = await this.uploadThemeFiles(theme.files, baseKey);

        if (!filesResult.success) {
          throw new Error(`Failed to upload theme files: ${filesResult.error}`);
        }
      }

      // 4. Generar metadata del tema
      const metadataKey = `${baseKey}/metadata.json`;
      const metadata = this.generateThemeMetadata(theme, storeId);
      const metadataResult = await this.uploadJson(metadata, metadataKey);

      if (!metadataResult.success) {
        throw new Error(`Failed to upload metadata: ${metadataResult.error}`);
      }

      // 5. Generar URL de CDN
      const cdnUrl = this.generateCdnUrl(zipKey);

      const result: ThemeStorageResult = {
        success: true,
        storeId,
        s3Key: baseKey,
        cdnUrl,
      };

      this.logger.info('Theme stored successfully in S3', result, 'S3StorageService');
      return result;
    } catch (error) {
      this.logger.error('Error storing theme to S3', error, 'S3StorageService');

      return {
        success: false,
        storeId,
        s3Key: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Genera la clave S3 para el tema
   */
  private generateThemeKey(storeId: string): string {
    return `templates/${storeId}`;
  }

  /**
   * Sube un archivo a S3
   */
  private async uploadFile(file: File | Buffer, key: string): Promise<{ success: boolean; error?: string }> {
    try {
      const content = file instanceof File ? await file.arrayBuffer() : file;

      const command = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: key,
        Body: Buffer.from(content instanceof ArrayBuffer ? new Uint8Array(content) : content),
        ContentType: this.getContentType(key),
      });

      await this.s3Client.send(command);

      this.logger.debug(`Uploaded file to S3: ${key}`, { size: content.byteLength }, 'S3StorageService');

      return { success: true };
    } catch (error) {
      this.logger.error('Error uploading file to S3', error, 'S3StorageService');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Determina el Content-Type basado en la extensión del archivo
   */
  private getContentType(key: string): string {
    const extension = key.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'json':
        return 'application/json';
      case 'css':
        return 'text/css';
      case 'js':
        return 'application/javascript';
      case 'liquid':
        return 'text/plain';
      case 'html':
        return 'text/html';
      case 'zip':
        return 'application/zip';
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'webp':
        return 'image/webp';
      case 'svg':
        return 'image/svg+xml';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Sube archivos del tema organizados por tipo
   */
  private async uploadThemeFiles(files: ThemeFile[], baseKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const uploadPromises = files.map(async (file) => {
        // Organizar archivos por tipo en carpetas separadas
        let fileKey: string;

        if (file.path.includes('/layout/')) {
          fileKey = `${baseKey}/layout/${file.path.split('/layout/')[1]}`;
        } else if (file.path.includes('/templates/')) {
          fileKey = `${baseKey}/templates/${file.path.split('/templates/')[1]}`;
        } else if (file.path.includes('/sections/')) {
          fileKey = `${baseKey}/sections/${file.path.split('/sections/')[1]}`;
        } else if (file.path.includes('/snippets/')) {
          fileKey = `${baseKey}/snippets/${file.path.split('/snippets/')[1]}`;
        } else if (file.path.includes('/assets/')) {
          fileKey = `${baseKey}/assets/${file.path.split('/assets/')[1]}`;
        } else if (file.path.includes('/config/')) {
          fileKey = `${baseKey}/config/${file.path.split('/config/')[1]}`;
        } else if (file.path.includes('/locales/')) {
          fileKey = `${baseKey}/locales/${file.path.split('/locales/')[1]}`;
        } else {
          // Archivos en la raíz
          fileKey = `${baseKey}/root/${file.path}`;
        }

        const content = file.content instanceof Buffer ? file.content : Buffer.from(file.content as string);
        return this.uploadFile(content, fileKey);
      });

      const results = await Promise.all(uploadPromises);
      const failedUploads = results.filter((result) => !result.success);

      if (failedUploads.length > 0) {
        this.logger.error('Failed to upload theme files', { failedCount: failedUploads.length }, 'S3StorageService');
        return {
          success: false,
          error: `Failed to upload ${failedUploads.length} files`,
        };
      }

      this.logger.info('Theme files uploaded successfully', { fileCount: files.length }, 'S3StorageService');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload theme files',
      };
    }
  }

  /**
   * Sube JSON a S3
   */
  private async uploadJson(data: any, key: string): Promise<{ success: boolean; error?: string }> {
    try {
      const jsonBuffer = Buffer.from(JSON.stringify(data, null, 2));
      return await this.uploadFile(jsonBuffer, key);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload JSON',
      };
    }
  }

  /**
   * Genera metadata del tema
   */
  private generateThemeMetadata(theme: ProcessedTheme, storeId: string): any {
    return {
      themeId: theme.id,
      storeId,
      name: theme.name,
      version: theme.version,
      author: theme.author,
      description: theme.description,
      fileCount: theme.files?.length || 0,
      totalSize: theme.files?.reduce((sum, file) => sum + file.size, 0) || 0,
      sections: theme.sections?.length || 0,
      templates: theme.templates?.length || 0,
      assets: theme.assets?.length || 0,
      createdAt: theme.createdAt.toISOString(),
      updatedAt: theme.updatedAt.toISOString(),
      structure: {
        hasLayout: theme.files?.some((f) => f.path.includes('/layout/theme.liquid')) || false,
        hasSettings: theme.files?.some((f) => f.path.includes('/config/settings_schema.json')) || false,
        hasIndex: theme.files?.some((f) => f.path.includes('/templates/index.json')) || false,
        hasProduct: theme.files?.some((f) => f.path.includes('/templates/product.json')) || false,
        hasCollection: theme.files?.some((f) => f.path.includes('/templates/collection.json')) || false,
      },
    };
  }

  /**
   * Genera URL de CDN para el tema
   */
  private generateCdnUrl(s3Key: string): string {
    // TODO: Implementar generación real de URL de CDN
    // Por ahora simulamos la URL
    return `https://cdn.fasttify.com/${s3Key}`;
  }

  /**
   * Obtiene un tema desde S3
   */
  public async getTheme(storeId: string): Promise<ProcessedTheme | null> {
    try {
      const baseKey = this.generateThemeKey(storeId);
      const metadataKey = `${baseKey}/metadata.json`;

      const command = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: metadataKey,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        this.logger.debug(`Theme metadata not found: ${metadataKey}`, {}, 'S3StorageService');
        return null;
      }

      const metadataContent = await response.Body.transformToString();
      const metadata = JSON.parse(metadataContent);

      this.logger.debug(`Retrieved theme from S3: ${metadataKey}`, { themeId: metadata.themeId }, 'S3StorageService');

      // TODO: Implementar reconstrucción completa del ProcessedTheme desde metadata
      return null;
    } catch (error) {
      this.logger.error('Error getting theme from S3', error, 'S3StorageService');
      return null;
    }
  }

  /**
   * Elimina un tema de S3
   */
  public async deleteTheme(storeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const baseKey = this.generateThemeKey(storeId);

      // Listar todos los objetos del tema para eliminarlos
      const listCommand = new ListObjectsV2Command({
        Bucket: process.env.BUCKET_NAME,
        Prefix: `${baseKey}/`,
      });

      const listResponse = await this.s3Client.send(listCommand);

      if (!listResponse.Contents || listResponse.Contents.length === 0) {
        this.logger.info(`No theme files found to delete: ${baseKey}`, {}, 'S3StorageService');
        return { success: true };
      }

      // Eliminar todos los objetos del tema
      const deletePromises = listResponse.Contents.map(async (object) => {
        if (!object.Key) return;

        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: object.Key,
        });

        return this.s3Client.send(deleteCommand);
      });

      await Promise.all(deletePromises);

      this.logger.info(
        `Deleted theme from S3: ${baseKey}`,
        {
          deletedFiles: listResponse.Contents.length,
        },
        'S3StorageService'
      );

      return { success: true };
    } catch (error) {
      this.logger.error('Error deleting theme from S3', error, 'S3StorageService');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      };
    }
  }

  /**
   * Lista todos los temas de una tienda
   */
  public async listStoreThemes(storeId: string): Promise<string[]> {
    try {
      const prefix = `templates/${storeId}/`;

      const command = new ListObjectsV2Command({
        Bucket: process.env.BUCKET_NAME,
        Prefix: prefix,
        Delimiter: '/',
      });

      const response = await this.s3Client.send(command);

      if (!response.CommonPrefixes || response.CommonPrefixes.length === 0) {
        this.logger.debug(`No themes found for store: ${storeId}`, {}, 'S3StorageService');
        return [];
      }

      // Extraer los IDs de los temas de las rutas
      const themeIds = response.CommonPrefixes.map((prefix) => prefix.Prefix)
        .filter((prefix) => prefix)
        .map((prefix) => prefix!.replace(`templates/${storeId}/`, '').replace('/', ''));

      this.logger.debug(
        `Found themes for store: ${storeId}`,
        {
          themeCount: themeIds.length,
          themes: themeIds,
        },
        'S3StorageService'
      );

      return themeIds;
    } catch (error) {
      this.logger.error('Error listing store themes', error, 'S3StorageService');
      return [];
    }
  }
}
