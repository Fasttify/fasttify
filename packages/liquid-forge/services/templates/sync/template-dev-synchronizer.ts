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

import { logger } from '@/liquid-forge/lib/logger';
import { cacheManager } from '@/liquid-forge/services/core/cache';
import { cacheInvalidationService } from '@/liquid-forge/services/core/cache/cache-invalidation-service';
import { templateLoader } from '@/liquid-forge/services/templates/template-loader';
import { PostCSSProcessor } from '@/liquid-forge/services/themes/optimization/postcss-processor';
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

  private constructor() {
    // La configuración de S3 se establece al iniciar la sincronización
    this.bucketName = process.env.BUCKET_NAME || '';
    this.s3Client = new S3Client({
      region: process.env.REGION_BUCKET || 'us-east-2',
    });
    this.postcssProcessor = PostCSSProcessor.getInstance();
  }

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

    // Always resolve relative to our safe root
    const requestedDir = path.resolve(options.localDir);
    // Strict containment check: normalized requestedDir must be the root or start with the normalized root + separator
    if (requestedDir !== TEMPLATES_DEV_ROOT && !requestedDir.startsWith(TEMPLATES_DEV_ROOT + path.sep)) {
      throw new Error(
        `Directorio local ilegal: ${options.localDir}. Solo se permiten carpetas dentro de ${TEMPLATES_DEV_ROOT}.`
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
      throw new Error(`El directorio local ${this.localDir} no existe`);
    }

    if (!this.bucketName) {
      throw new Error('No se ha configurado el nombre del bucket S3');
    }

    if (!this.s3Client) {
      throw new Error('No se ha configurado el cliente S3');
    }

    // Iniciar watcher
    this.watcher = chokidar.watch(this.localDir, {
      ignored: /(^|[\/\\])\../, // Ignorar archivos ocultos
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100,
      },
    });

    logger.debug(
      `[TemplateDevSynchronizer] Observando cambios en ${this.localDir}`,
      undefined,
      'TemplateDevSynchronizer'
    );

    // Configurar eventos
    this.watcher
      .on('add', (filePath) => this.handleFileChange(filePath, 'add'))
      .on('change', (filePath) => this.handleFileChange(filePath, 'change'))
      .on('unlink', (filePath) => this.handleFileChange(filePath, 'unlink'));

    // Esperar a que esté listo
    await new Promise<void>((resolve) => {
      if (this.watcher) {
        this.watcher.on('ready', () => {
          this.isActive = true;
          logger.debug(
            `[TemplateDevSynchronizer] Listo para sincronizar cambios`,
            undefined,
            'TemplateDevSynchronizer'
          );
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Detiene la sincronización
   */
  public async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
      this.isActive = false;
      logger.debug('[TemplateDevSynchronizer] Sincronización detenida', undefined, 'TemplateDevSynchronizer');
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
      logger.error(
        `[TemplateDevSynchronizer] Error validando ruta: ${candidatePath}`,
        error,
        'TemplateDevSynchronizer'
      );
      return false;
    }
  }

  /**
   * Maneja los cambios en archivos
   */
  private async handleFileChange(filePath: string, event: 'add' | 'change' | 'unlink'): Promise<void> {
    try {
      // Validar que la ruta esté dentro del directorio seguro
      if (!this.isSafePath(filePath, this.localDir)) {
        logger.warn(
          `[TemplateDevSynchronizer] Ruta no segura detectada y omitida: ${filePath}`,
          undefined,
          'TemplateDevSynchronizer'
        );
        return;
      }

      // Obtener ruta relativa al directorio local
      const relativePath = path.relative(this.localDir, filePath);
      logger.debug(
        `[TemplateDevSynchronizer] ${event.toUpperCase()}: ${relativePath}`,
        undefined,
        'TemplateDevSynchronizer'
      );

      // Construir clave S3
      const s3Key = `templates/${this.storeId}/${relativePath}`.replace(/\\/g, '/');

      // Subir archivo a S3
      if (event === 'add' || event === 'change') {
        await this.uploadFileToS3(filePath, s3Key);
      } else if (event === 'unlink') {
        await this.deleteFileFromS3(s3Key);
      }

      // Invalidar caché de manera agresiva
      // templatePath es ahora el templateName que templateLoader.getS3TemplateKey espera
      const templateName = relativePath.replace(/\\/g, '/');

      // Invalidar la caché del template específico (tanto raw como compilado)
      templateLoader.invalidateTemplateCache(this.storeId, templateName);

      // Forzar recarga del template - Si es un cambio importante (ej. en el layout), invalidar toda la caché
      if (templateName.includes('layout/') || templateName.includes('config/')) {
        cacheManager.invalidateStoreCache(this.storeId); // Invalidar toda la caché de la tienda
      }

      // Invalidar caché de CloudFront para el archivo específico
      cacheInvalidationService.invalidateCache('template_store_updated', this.storeId, undefined, templateName);

      // Registrar cambio reciente
      const change: FileChange = {
        path: relativePath,
        event,
        timestamp: Date.now(),
      };
      this.recentChanges.push(change);

      // Mantener solo los últimos 50 cambios
      if (this.recentChanges.length > 50) {
        this.recentChanges = this.recentChanges.slice(-50);
      }

      // Notificar cambio
      if (this.onChangeCallback) {
        this.onChangeCallback([...this.recentChanges]);
      }
    } catch (error) {
      logger.error(`[TemplateDevSynchronizer] Error al manejar cambio en archivo`, error, 'TemplateDevSynchronizer');
    }
  }

  /**
   * Sube un archivo a S3
   */
  private async uploadFileToS3(filePath: string, s3Key: string): Promise<void> {
    if (!this.s3Client) return;

    try {
      // Validar que la ruta esté dentro del directorio seguro antes de leer
      if (!this.isSafePath(filePath, this.localDir)) {
        logger.warn(
          `[TemplateDevSynchronizer] Intento de lectura de archivo no seguro bloqueado: ${filePath}`,
          undefined,
          'TemplateDevSynchronizer'
        );
        throw new Error(`Ruta no segura: ${filePath}`);
      }

      // Crear una ruta validada y normalizada para uso seguro
      const validatedPath = path.resolve(filePath);
      const validatedRoot = path.resolve(this.localDir);

      // Verificación adicional de seguridad
      if (!validatedPath.startsWith(validatedRoot + path.sep) && validatedPath !== validatedRoot) {
        logger.warn(
          `[TemplateDevSynchronizer] Ruta validada no segura: ${validatedPath}`,
          undefined,
          'TemplateDevSynchronizer'
        );
        throw new Error(`Path not safe: ${validatedPath}`);
      }

      const isBinary = isBinaryFile(validatedPath);

      // Obtener ruta relativa para determinar si es procesable
      const relativePath = path.relative(this.localDir, validatedPath).replace(/\\/g, '/');

      let body;
      if (isBinary) {
        // Leer como buffer para archivos binarios
        body = fs.readFileSync(validatedPath);
      } else {
        // Leer como texto para archivos de texto
        let content = fs.readFileSync(validatedPath, 'utf-8');

        // Procesar archivos CSS, JS y Liquid si están en assets/
        if (this.isProcessableAsset(relativePath)) {
          try {
            const result = await this.postcssProcessor.processAsset(content, relativePath);
            content = result.content;
          } catch (_error) {
            // Continuar con el contenido original si falla el procesamiento
          }
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
      logger.debug(`[TemplateDevSynchronizer] Subido a S3: ${s3Key}`, undefined, 'TemplateDevSynchronizer');
    } catch (error) {
      logger.error(`[TemplateDevSynchronizer] Error al subir a S3`, error, 'TemplateDevSynchronizer');
      throw error;
    }
  }

  /**
   * Verifica si un archivo debe ser procesado por PostCSS
   */
  private isProcessableAsset(path: string): boolean {
    // Para CSS y JS: solo en carpeta assets/
    const isAssetCSSJS =
      (path.includes('/assets/') || path.startsWith('assets/')) &&
      (path.endsWith('.css') || path.endsWith('.css.liquid') || path.endsWith('.js') || path.endsWith('.js.liquid'));

    // Para Liquid: en cualquier parte del tema
    const isLiquidFile = path.endsWith('.liquid');

    const isProcessable = isAssetCSSJS || isLiquidFile;

    return isProcessable;
  }

  /**
   * Elimina un archivo de S3
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
      logger.error(`[TemplateDevSynchronizer] Error al eliminar de S3`, error, 'TemplateDevSynchronizer');
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
   */
  public async syncAll(): Promise<void> {
    if (!this.isActive || !this.localDir) {
      throw new Error('El sincronizador no está activo');
    }

    logger.debug(`[TemplateDevSynchronizer] Sincronizando todos los archivos...`, undefined, 'TemplateDevSynchronizer');

    const syncFiles = async (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Validar que la ruta esté dentro del directorio seguro
        if (!this.isSafePath(fullPath, this.localDir)) {
          logger.warn(
            `[TemplateDevSynchronizer] Ruta no segura detectada durante sincronización y omitida: ${fullPath}`,
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
    logger.debug(`[TemplateDevSynchronizer] Sincronización completa`, undefined, 'TemplateDevSynchronizer');
  }

  /**
   * Verifica si el sincronizador está activo
   */
  public isRunning(): boolean {
    return this.isActive;
  }

  /**
   * Obtiene los cambios recientes
   */
  public getRecentChanges(): FileChange[] {
    return [...this.recentChanges];
  }
}

// Exportar instancia singleton
export const templateDevSynchronizer = TemplateDevSynchronizer.getInstance();
