import fs from 'fs'
import path from 'path'
import chokidar from 'chokidar'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { templateLoader } from '@/renderer-engine/services/templates/template-loader'
import { cacheManager } from '@/renderer-engine/services/core/cache-manager'
import { logger } from '@/renderer-engine/lib/logger'

interface SyncOptions {
  localDir: string
  storeId: string
  bucketName?: string
  region?: string
}

interface FileChange {
  path: string
  event: 'add' | 'change' | 'unlink'
  timestamp: number
}

/**
 * Sistema de desarrollo para sincronizar plantillas locales con S3 en tiempo real
 */
export class TemplateDevSynchronizer {
  private static instance: TemplateDevSynchronizer
  private watcher: chokidar.FSWatcher | null = null
  private s3Client: S3Client | null = null
  private localDir: string = ''
  private storeId: string = ''
  private bucketName: string = ''
  private isActive: boolean = false
  private recentChanges: FileChange[] = []
  private onChangeCallback: ((changes: FileChange[]) => void) | null = null

  private constructor() {
    // La configuración de S3 se establece al iniciar la sincronización
    this.bucketName = process.env.BUCKET_NAME || ''
    this.s3Client = new S3Client({
      region: process.env.REGION_BUCKET || 'us-east-2',
    })
  }

  public static getInstance(): TemplateDevSynchronizer {
    if (!TemplateDevSynchronizer.instance) {
      TemplateDevSynchronizer.instance = new TemplateDevSynchronizer()
    }
    return TemplateDevSynchronizer.instance
  }

  /**
   * Inicia la sincronización de archivos locales con S3
   * @param options - Opciones de sincronización
   * @returns Promise que se resuelve cuando el watcher está listo
   */
  public async start(options: SyncOptions): Promise<void> {
    if (this.isActive) {
      await this.stop()
    }

    this.localDir = path.resolve(options.localDir)
    this.storeId = options.storeId

    if (options.bucketName) {
      this.bucketName = options.bucketName
    }

    if (options.region) {
      this.s3Client = new S3Client({
        region: options.region,
      })
    }

    if (!fs.existsSync(this.localDir)) {
      throw new Error(`El directorio local ${this.localDir} no existe`)
    }

    if (!this.bucketName) {
      throw new Error('No se ha configurado el nombre del bucket S3')
    }

    if (!this.s3Client) {
      throw new Error('No se ha configurado el cliente S3')
    }

    // Iniciar watcher
    this.watcher = chokidar.watch(this.localDir, {
      ignored: /(^|[\/\\])\../, // Ignorar archivos ocultos
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100,
      },
    })

    logger.debug(
      `[TemplateDevSynchronizer] Observando cambios en ${this.localDir}`,
      undefined,
      'TemplateDevSynchronizer'
    )

    // Configurar eventos
    this.watcher
      .on('add', filePath => this.handleFileChange(filePath, 'add'))
      .on('change', filePath => this.handleFileChange(filePath, 'change'))
      .on('unlink', filePath => this.handleFileChange(filePath, 'unlink'))

    // Esperar a que esté listo
    await new Promise<void>(resolve => {
      if (this.watcher) {
        this.watcher.on('ready', () => {
          this.isActive = true
          logger.debug(
            `[TemplateDevSynchronizer] Listo para sincronizar cambios`,
            undefined,
            'TemplateDevSynchronizer'
          )
          resolve()
        })
      } else {
        resolve()
      }
    })
  }

  /**
   * Detiene la sincronización
   */
  public async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close()
      this.watcher = null
      this.isActive = false
      logger.debug(
        '[TemplateDevSynchronizer] Sincronización detenida',
        undefined,
        'TemplateDevSynchronizer'
      )
    }
  }

  /**
   * Maneja los cambios en archivos
   */
  private async handleFileChange(
    filePath: string,
    event: 'add' | 'change' | 'unlink'
  ): Promise<void> {
    try {
      // Obtener ruta relativa al directorio local
      const relativePath = path.relative(this.localDir, filePath)
      logger.debug(
        `[TemplateDevSynchronizer] ${event.toUpperCase()}: ${relativePath}`,
        undefined,
        'TemplateDevSynchronizer'
      )

      // Construir clave S3
      const s3Key = `templates/${this.storeId}/${relativePath}`.replace(/\\/g, '/')

      // Subir archivo a S3
      if (event === 'add' || event === 'change') {
        await this.uploadFileToS3(filePath, s3Key)
      } else if (event === 'unlink') {
        // TODO: Implementar eliminación de archivos en S3
        logger.warn(
          `[TemplateDevSynchronizer] Eliminación de archivos no implementada aún`,
          undefined,
          'TemplateDevSynchronizer'
        )
      }

      // Invalidar caché de manera agresiva
      const templatePath = relativePath.replace(/\\/g, '/')

      // Invalidar la caché del template específico
      cacheManager.invalidateTemplateCache(`templates/${this.storeId}/${templatePath}`)
      templateLoader.invalidateTemplateCache(this.storeId, templatePath)

      // Forzar recarga del template - Si es un cambio importante, invalidar toda la caché
      if (templatePath.includes('template/')) {
        logger.debug(
          `[TemplateDevSynchronizer] Cambio crítico detectado, invalidando toda la caché de la tienda`,
          undefined,
          'TemplateDevSynchronizer'
        )
        templateLoader.invalidateTemplateCache(this.storeId, templatePath)
      }

      // Registrar cambio reciente
      const change: FileChange = {
        path: relativePath,
        event,
        timestamp: Date.now(),
      }
      this.recentChanges.push(change)

      // Mantener solo los últimos 50 cambios
      if (this.recentChanges.length > 50) {
        this.recentChanges = this.recentChanges.slice(-50)
      }

      // Notificar cambio
      if (this.onChangeCallback) {
        this.onChangeCallback([...this.recentChanges])
      }
    } catch (error) {
      logger.error(
        `[TemplateDevSynchronizer] Error al manejar cambio en archivo`,
        error,
        'TemplateDevSynchronizer'
      )
    }
  }

  /**
   * Sube un archivo a S3
   */
  private async uploadFileToS3(filePath: string, s3Key: string): Promise<void> {
    if (!this.s3Client) return

    try {
      const contentType = this.getContentType(filePath)
      const isBinaryFile =
        contentType.startsWith('image/') ||
        contentType.startsWith('font/') ||
        contentType === 'application/octet-stream'

      let body
      if (isBinaryFile) {
        // Leer como buffer para archivos binarios
        body = fs.readFileSync(filePath)
      } else {
        // Leer como texto para archivos de texto
        body = fs.readFileSync(filePath, 'utf-8')
      }

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: body,
        ContentType: contentType,
        Metadata: {
          'store-id': this.storeId,
          'template-type': 'store-template',
          'upload-time': new Date().toISOString(),
        },
      })

      await this.s3Client.send(command)
      logger.debug(
        `[TemplateDevSynchronizer] Subido a S3: ${s3Key}`,
        undefined,
        'TemplateDevSynchronizer'
      )
    } catch (error) {
      logger.error(
        `[TemplateDevSynchronizer] Error al subir a S3`,
        error,
        'TemplateDevSynchronizer'
      )
      throw error
    }
  }

  /**
   * Devuelve el Content-Type basado en la extensión del archivo
   */
  private getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase().substring(1)

    const contentTypes: Record<string, string> = {
      html: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
      json: 'application/json',
      liquid: 'application/liquid',
      txt: 'text/plain',
      md: 'text/markdown',
      scss: 'text/scss',
      sass: 'text/sass',
      xml: 'application/xml',
      // Tipos de imagen
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      webp: 'image/webp',
      ico: 'image/x-icon',
      // Tipos de font
      woff: 'font/woff',
      woff2: 'font/woff2',
      ttf: 'font/ttf',
      eot: 'application/vnd.ms-fontobject',
    }

    return contentTypes[ext] || 'application/octet-stream'
  }

  /**
   * Establece un callback para notificar cambios
   * @param callback - Función a llamar cuando hay cambios
   */
  public onChanges(callback: (changes: FileChange[]) => void): void {
    this.onChangeCallback = callback
  }

  /**
   * Fuerza la sincronización de todos los archivos en el directorio
   */
  public async syncAll(): Promise<void> {
    if (!this.isActive || !this.localDir) {
      throw new Error('El sincronizador no está activo')
    }

    logger.debug(
      `[TemplateDevSynchronizer] Sincronizando todos los archivos...`,
      undefined,
      'TemplateDevSynchronizer'
    )

    const syncFiles = async (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          await syncFiles(fullPath)
        } else {
          await this.handleFileChange(fullPath, 'add')
        }
      }
    }

    await syncFiles(this.localDir)
    logger.debug(
      `[TemplateDevSynchronizer] Sincronización completa`,
      undefined,
      'TemplateDevSynchronizer'
    )
  }

  /**
   * Verifica si el sincronizador está activo
   */
  public isRunning(): boolean {
    return this.isActive
  }

  /**
   * Obtiene los cambios recientes
   */
  public getRecentChanges(): FileChange[] {
    return [...this.recentChanges]
  }
}

// Exportar instancia singleton
export const templateDevSynchronizer = TemplateDevSynchronizer.getInstance()
