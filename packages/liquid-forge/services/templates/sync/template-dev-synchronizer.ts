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

import { logger } from '../../../lib/logger';
import { cacheManager } from '../../core/cache';
import { cacheInvalidationService } from '../../core/cache/cache-invalidation-service';
import { templateLoader } from '../template-loader';
import { PostCSSProcessor } from '../../themes/optimization/postcss-processor';
import { getContentType, isBinaryFile } from '@/lib/utils/file-utils';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';

// Define the root directory for allowed local template development folders.
// You may change this to a different directory as appropriate for your setup.
// E.g., use process.env.TEMPLATES_DEV_ROOT or a predetermined safe location.
const TEMPLATES_DEV_ROOT = path.resolve(process.env.TEMPLATES_DEV_ROOT || process.cwd());

interface SyncOptions {
  localDir: string;
  storeId: string;
  bucketName?: string;
  region?: string;
}

interface FileChange {
  path: string;
  event: 'add' | 'change' | 'unlink';
  timestamp: number;
}

/**
 * Sistema de desarrollo para sincronizar plantillas locales con S3 en tiempo real
 */
export class TemplateDevSynchronizer {
  private static instance: TemplateDevSynchronizer;
  private watcher: chokidar.FSWatcher | null = null;
  private s3Client: S3Client | null = null;
  private localDir: string = '';
  private storeId: string = '';
  private bucketName: string = '';
  private isActive: boolean = false;
  private recentChanges: FileChange[] = [];
  private onChangeCallback: ((changes: FileChange[]) => void) | null = null;
  private postcssProcessor: PostCSSProcessor;

  /**
   * Inicializa dependencias y cliente S3 para desarrollo.
   */
  private constructor() {
    this.bucketName = process.env.BUCKET_NAME || '';
    this.s3Client = new S3Client({
      region: process.env.REGION_BUCKET || 'us-east-2',
    });
    this.postcssProcessor = PostCSSProcessor.getInstance();
  }

  /**
   * Retorna la instancia singleton del sincronizador
   * @returns Instancia única de TemplateDevSynchronizer
   */
  public static getInstance(): TemplateDevSynchronizer {
    if (!TemplateDevSynchronizer.instance) {
      TemplateDevSynchronizer.instance = new TemplateDevSynchronizer();
    }
    return TemplateDevSynchronizer.instance;
  }

  /**
   * Inicia la sincronización de archivos locales con S3
   * @param options - Opciones de sincronización
   * @returns Promise que se resuelve cuando el watcher está listo
   */
  public async start(options: SyncOptions): Promise<void> {
    if (this.isActive) {
      await this.stop();
    }

    const requestedDir = path.resolve(options.localDir);
    if (requestedDir !== TEMPLATES_DEV_ROOT && !requestedDir.startsWith(TEMPLATES_DEV_ROOT + path.sep)) {
      throw new Error(
        `Illegal local directory: ${options.localDir}. Only directories within ${TEMPLATES_DEV_ROOT} are allowed.`
      );
    }
    this.localDir = requestedDir;
    this.storeId = options.storeId;

    if (options.bucketName) {
      this.bucketName = options.bucketName;
    }

    if (options.region) {
      this.s3Client = new S3Client({
        region: options.region,
      });
    }

    if (!fs.existsSync(this.localDir)) {
      throw new Error(`Local directory ${this.localDir} does not exist`);
    }

    if (!this.bucketName) {
      throw new Error('Bucket name not configured');
    }

    if (!this.s3Client) {
      throw new Error('S3 client not configured');
    }

    this.watcher = chokidar.watch(this.localDir, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100,
      },
    });

    this.watcher
      .on('add', (filePath) => this.handleFileChange(filePath, 'add'))
      .on('change', (filePath) => this.handleFileChange(filePath, 'change'))
      .on('unlink', (filePath) => this.handleFileChange(filePath, 'unlink'));

    await new Promise<void>((resolve) => {
      if (this.watcher) {
        this.watcher.on('ready', () => {
          this.isActive = true;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Detiene la sincronización
   * @returns Promise que se resuelve al detener el watcher
   */
  public async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
      this.isActive = false;
    }
  }

  /**
   * Valida que una ruta esté dentro del directorio seguro
   * @param candidatePath - Ruta candidata a validar
   * @param rootPath - Directorio raíz seguro
   * @returns true si la ruta es segura, false en caso contrario
   */
  private isSafePath(candidatePath: string, rootPath: string): boolean {
    try {
      // Resolver y normalizar ambas rutas
      const resolvedCandidate = path.resolve(candidatePath);
      const resolvedRoot = path.resolve(rootPath);

      // Verificar que la ruta candidata esté dentro del directorio raíz
      return resolvedCandidate === resolvedRoot || resolvedCandidate.startsWith(resolvedRoot + path.sep);
    } catch (error) {
      logger.error(`Error validating path: ${candidatePath}`, error, 'TemplateDevSynchronizer');
      return false;
    }
  }

  /**
   * Asegura una ruta dentro del directorio seguro, regresando ruta absoluta y relativa.
   * @param filePath - Ruta del archivo a validar
   * @returns Objeto con ruta validada y relativa
   */
  private assertAndResolvePath(filePath: string): { validatedPath: string; relativePath: string } {
    if (!this.isSafePath(filePath, this.localDir)) {
      throw new Error(`Unsafe path: ${filePath}`);
    }
    const validatedPath = path.resolve(filePath);
    const relativePath = path.relative(this.localDir, validatedPath).replace(/\\/g, '/');
    return { validatedPath, relativePath };
  }

  /**
   * Construye la clave de S3 para un archivo relativo al directorio local.
   * @param relativePath - Ruta relativa desde el directorio local
   * @returns Clave S3 normalizada
   */
  private buildS3Key(relativePath: string): string {
    return `templates/${this.storeId}/${relativePath}`.replace(/\\/g, '/');
  }

  /**
   * Registra un cambio reciente manteniendo un límite máximo.
   * @param change - Cambio de archivo a registrar
   */
  private recordRecentChange(change: FileChange): void {
    this.recentChanges.push(change);
    if (this.recentChanges.length > 50) {
      this.recentChanges = this.recentChanges.slice(-50);
    }
    if (this.onChangeCallback) {
      this.onChangeCallback([...this.recentChanges]);
    }
  }

  /**
   * Maneja los cambios en archivos
   * @param filePath - Ruta absoluta del archivo cambiado
   * @param event - Tipo de evento (add|change|unlink)
   * @returns Promise cuando el procesamiento del cambio finaliza
   */
  private async handleFileChange(filePath: string, event: 'add' | 'change' | 'unlink'): Promise<void> {
    try {
      if (!this.isSafePath(filePath, this.localDir)) {
        logger.warn(`Unsafe path detected and omitted: ${filePath}`, undefined, 'TemplateDevSynchronizer');
        return;
      }

      const relativePath = path.relative(this.localDir, filePath);

      const s3Key = this.buildS3Key(relativePath);

      if (event === 'add' || event === 'change') {
        await this.uploadFileToS3(filePath, s3Key);
      } else if (event === 'unlink') {
        await this.deleteFileFromS3(s3Key);
      }

      const templateName = relativePath.replace(/\\/g, '/');

      templateLoader.invalidateTemplateCache(this.storeId, templateName);

      if (templateName.includes('layout/') || templateName.includes('config/')) {
        cacheManager.invalidateStoreCache(this.storeId); // Invalidar toda la caché de la tienda
      }

      cacheInvalidationService.invalidateCache('template_store_updated', this.storeId, undefined, templateName);

      this.recordRecentChange({ path: templateName, event, timestamp: Date.now() });
    } catch (error) {
      logger.error(`Error handling file change: ${filePath}`, error, 'TemplateDevSynchronizer');
    }
  }

  /**
   * Sube un archivo a S3
   * @param filePath - Ruta absoluta local del archivo
   * @param s3Key - Clave de destino en S3
   * @returns Promise cuando la carga finaliza
   */
  private async uploadFileToS3(filePath: string, s3Key: string): Promise<void> {
    if (!this.s3Client) return;

    try {
      if (!this.isSafePath(filePath, this.localDir)) {
        logger.warn(`Unsafe path detected and blocked: ${filePath}`, undefined, 'TemplateDevSynchronizer');
        throw new Error(`Unsafe path: ${filePath}`);
      }

      const validatedPath = path.resolve(filePath);

      const isBinary = isBinaryFile(validatedPath);

      const relativePath = path.relative(this.localDir, validatedPath).replace(/\\/g, '/');

      let body;
      if (isBinary) {
        body = fs.readFileSync(validatedPath);
      } else {
        let content = fs.readFileSync(validatedPath, 'utf-8');
        if (this.isProcessableAsset(relativePath)) {
          try {
            const result = await this.postcssProcessor.processAsset(content, relativePath);
            content = result.content;
          } catch (_error) {}
        }

        body = content;
      }

      if (isBinary) {
        // Para archivos binarios, usar PutObjectCommand
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: s3Key,
          Body: body,
          ContentType: getContentType(filePath),
          Metadata: {
            'store-id': this.storeId,
            'template-type': 'store-template',
            'upload-time': new Date().toISOString(),
          },
        });

        await this.s3Client.send(command);
      } else {
        // Para archivos de texto procesados, usar Upload
        const upload = new Upload({
          client: this.s3Client,
          params: {
            Bucket: this.bucketName,
            Key: s3Key,
            Body: body,
            ContentType: getContentType(filePath),
            Metadata: {
              'store-id': this.storeId,
              'template-type': 'store-template',
              'upload-time': new Date().toISOString(),
            },
          },
        });

        await upload.done();
      }
    } catch (error) {
      logger.error(`Error uploading to S3`, error, 'TemplateDevSynchronizer');
      throw error;
    }
  }

  /**
   * Verifica si un archivo debe ser procesado por PostCSS
   * @param path - Ruta relativa del archivo
   * @returns true si es procesable, false en caso contrario
   */
  private isProcessableAsset(path: string): boolean {
    const isAssetCSSJS =
      (path.includes('/assets/') || path.startsWith('assets/')) &&
      (path.endsWith('.css') || path.endsWith('.css.liquid') || path.endsWith('.js') || path.endsWith('.js.liquid'));
    const isLiquidFile = path.endsWith('.liquid');
    return isAssetCSSJS || isLiquidFile;
  }

  /**
   * Elimina un archivo de S3
   * @param s3Key - Clave del objeto en S3
   * @returns Promise cuando la eliminación finaliza
   */
  private async deleteFileFromS3(s3Key: string): Promise<void> {
    if (!this.s3Client) return;

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      logger.error(`Error deleting from S3`, error, 'TemplateDevSynchronizer');
      throw error;
    }
  }

  /**
   * Establece un callback para notificar cambios
   * @param callback - Función a llamar cuando hay cambios
   */
  public onChanges(callback: (changes: FileChange[]) => void): void {
    this.onChangeCallback = callback;
  }

  /**
   * Fuerza la sincronización de todos los archivos en el directorio
   * @returns Promise cuando finaliza la sincronización completa
   */
  public async syncAll(): Promise<void> {
    if (!this.isActive || !this.localDir) {
      throw new Error('Synchronizer is not active');
    }

    const syncFiles = async (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (!this.isSafePath(fullPath, this.localDir)) {
          logger.warn(
            `Unsafe path detected during synchronization and omitted: ${fullPath}`,
            undefined,
            'TemplateDevSynchronizer'
          );
          continue;
        }

        if (entry.isDirectory()) {
          await syncFiles(fullPath);
        } else {
          await this.handleFileChange(fullPath, 'add');
        }
      }
    };

    await syncFiles(this.localDir);
  }

  /**
   * Verifica si el sincronizador está activo
   * @returns true si el watcher está activo
   */
  public isRunning(): boolean {
    return this.isActive;
  }

  /**
   * Obtiene los cambios recientes
   * @returns Lista de cambios recientes
   */
  public getRecentChanges(): FileChange[] {
    return [...this.recentChanges];
  }

  /**
   * Retorna el storeId activo
   */
  public getStoreId(): string {
    return this.storeId;
  }
}

// Exportar instancia singleton
export const templateDevSynchronizer = TemplateDevSynchronizer.getInstance();
