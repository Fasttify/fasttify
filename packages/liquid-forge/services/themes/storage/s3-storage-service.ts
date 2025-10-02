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

import { RendererLogger } from '@/liquid-forge/lib/logger';
import { getCdnUrlForKey } from '@/utils/server';
import { getContentType } from '@/lib/utils';
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
  previewCdnUrl?: string;
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
      region: process.env.AWS_REGION || 'us-east-2',
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
      // 1. Crear estructura de carpetas
      const baseKey = this.generateThemeKey(storeId);

      // 1.1 Escribir metadata inicial (placeholder) para no bloquear a la UI si tarda la subida
      const metadataKey = `${baseKey}/metadata.json`;
      const initialMetadata = {
        ...this.generateThemeMetadata(theme, storeId),
        status: 'processing',
        stage: 'init',
        updatedAt: new Date().toISOString(),
      };
      await this.uploadJson(initialMetadata, metadataKey);

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

      // 4. Resolver preview del tema (si existe en los archivos)
      const previewFile = this.findPreviewFile(theme.files || []);
      let previewCdnUrl: string | undefined = undefined;
      if (previewFile) {
        const previewKey = this.buildS3KeyForFile(previewFile.path, baseKey);
        previewCdnUrl = getCdnUrlForKey(previewKey);
      }

      // 5. Generar metadata final del tema
      const finalMetadata = {
        ...this.generateThemeMetadata(theme, storeId),
        status: 'ready',
        stage: 'completed',
        updatedAt: new Date().toISOString(),
        previewUrl: previewCdnUrl || theme.settings.previewUrl || undefined,
      };
      const metadataResult = await this.uploadJson(finalMetadata, metadataKey);

      if (!metadataResult.success) {
        throw new Error(`Failed to upload metadata: ${metadataResult.error}`);
      }

      // 6. Generar URL de CDN
      const cdnUrl = getCdnUrlForKey(zipKey);

      const result: ThemeStorageResult = {
        success: true,
        storeId,
        s3Key: baseKey,
        cdnUrl,
        previewCdnUrl,
      };

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
      const body: Buffer | Uint8Array =
        file instanceof File
          ? new Uint8Array(await file.arrayBuffer())
          : Buffer.isBuffer(file)
            ? file
            : new Uint8Array(file as any);

      const command = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: getContentType(key),
        ContentLength: (body as any).byteLength ?? (body as any).length,
      });

      await this.s3Client.send(command);

      const size = (body as any).byteLength ?? (body as any).length;

      return { success: true };
    } catch (error) {
      this.logger.error('Error uploading file to S3', { key, error }, 'S3StorageService');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Sube archivos del tema organizados por tipo
   */
  private async uploadThemeFiles(files: ThemeFile[], baseKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const uploadPromises = files.map(async (file) => {
        const fileKey = this.buildS3KeyForFile(file.path, baseKey);

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
   * Construye la clave S3 a partir de la ruta del archivo de tema
   */
  private buildS3KeyForFile(path: string, baseKey: string): string {
    if (path.includes('/layout/')) {
      return `${baseKey}/layout/${path.split('/layout/')[1]}`;
    }
    if (path.includes('/templates/')) {
      return `${baseKey}/templates/${path.split('/templates/')[1]}`;
    }
    if (path.includes('/sections/')) {
      return `${baseKey}/sections/${path.split('/sections/')[1]}`;
    }
    if (path.includes('/snippets/')) {
      return `${baseKey}/snippets/${path.split('/snippets/')[1]}`;
    }
    if (path.includes('/assets/')) {
      return `${baseKey}/assets/${path.split('/assets/')[1]}`;
    }
    if (path.includes('/config/')) {
      return `${baseKey}/config/${path.split('/config/')[1]}`;
    }
    if (path.includes('/locales/')) {
      return `${baseKey}/locales/${path.split('/locales/')[1]}`;
    }
    return `${baseKey}/root/${path}`;
  }

  /**
   * Busca un archivo de preview dentro del tema
   */
  private findPreviewFile(files: ThemeFile[]): ThemeFile | undefined {
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

    // Coincidencia por nombre o fin de ruta para soportar subcarpetas del tema
    return files.find(
      (f) => f.type === 'image' && candidates.some((name) => f.path === name || f.path.endsWith('/' + name))
    );
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
        return null;
      }

      const metadataContent = await response.Body.transformToString();
      const metadata = JSON.parse(metadataContent);

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

      const listCommand = new ListObjectsV2Command({
        Bucket: process.env.BUCKET_NAME,
        Prefix: `${baseKey}/`,
      });

      const listResponse = await this.s3Client.send(listCommand);

      if (!listResponse.Contents || listResponse.Contents.length === 0) {
        return { success: true };
      }

      const deletePromises = listResponse.Contents.map(async (object) => {
        if (!object.Key) return;

        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: object.Key,
        });

        return this.s3Client.send(deleteCommand);
      });

      await Promise.all(deletePromises);

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
        return [];
      }

      const themeIds = response.CommonPrefixes.map((prefix) => prefix.Prefix)
        .filter((prefix) => prefix)
        .map((prefix) => prefix!.replace(`templates/${storeId}/`, '').replace('/', ''));

      return themeIds;
    } catch (error) {
      this.logger.error('Error listing store themes', error, 'S3StorageService');
      return [];
    }
  }
}
