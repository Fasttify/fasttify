import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import type { TemplateFile, TemplateCache, TemplateError } from '../types'
import { cookiesClient } from '@/utils/AmplifyServer'

interface S3TemplateCache {
  [storeId: string]: {
    [templatePath: string]: TemplateCache
  }
}

class TemplateLoader {
  private static instance: TemplateLoader
  private s3Client?: S3Client
  private cache: S3TemplateCache = {}
  private readonly TEMPLATE_CACHE_TTL = 60 * 60 * 1000 // 1 hora en ms
  private readonly bucketName: string
  private readonly cloudFrontDomain: string
  private readonly appEnv: string

  private constructor() {
    this.bucketName = process.env.BUCKET_NAME || ''
    this.cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN_NAME || ''
    this.appEnv = process.env.APP_ENV || 'development'

    // Solo inicializar S3 si tenemos bucket configurado
    if (this.bucketName) {
      this.s3Client = new S3Client({
        region: process.env.REGION_BUCKET || 'us-east-2',
      })
    }
  }

  public static getInstance(): TemplateLoader {
    if (!TemplateLoader.instance) {
      TemplateLoader.instance = new TemplateLoader()
    }
    return TemplateLoader.instance
  }

  /**
   * Carga una plantilla específica desde S3 o CloudFront
   * @param storeId - ID de la tienda
   * @param templatePath - Ruta de la plantilla (ej: "layout/theme.liquid")
   * @returns Contenido de la plantilla
   */
  public async loadTemplate(storeId: string, templatePath: string): Promise<string> {
    try {
      console.log(`[TemplateLoader] Loading template: ${templatePath} for store: ${storeId}`)
      console.log(`[TemplateLoader] Environment: ${this.appEnv}`)
      console.log(`[TemplateLoader] CloudFront domain: ${this.cloudFrontDomain}`)
      console.log(`[TemplateLoader] Bucket name: ${this.bucketName}`)

      // Verificar caché primero
      const cached = this.getCachedTemplate(storeId, templatePath)
      if (cached) {
        console.log(`[TemplateLoader] Using cached template: ${templatePath}`)
        return cached.content
      }

      let content: string

      // En producción usar CloudFront, en desarrollo usar S3 directo
      if (this.appEnv === 'production' && this.cloudFrontDomain) {
        console.log(`[TemplateLoader] Loading from CloudFront...`)
        content = await this.loadTemplateFromCloudFront(storeId, templatePath)
      } else {
        console.log(`[TemplateLoader] Loading from S3...`)
        content = await this.loadTemplateFromS3(storeId, templatePath)
      }

      console.log(`[TemplateLoader] Template loaded successfully: ${templatePath}`)

      // Guardar en caché
      this.setCachedTemplate(storeId, templatePath, content)

      return content
    } catch (error) {
      console.error(
        `[TemplateLoader] Error loading template ${templatePath} for store ${storeId}:`,
        error
      )

      const templateError: TemplateError = {
        type: 'TEMPLATE_NOT_FOUND',
        message: `Template not found: ${templatePath}`,
        details: error,
        statusCode: 404,
      }

      throw templateError
    }
  }

  /**
   * Carga todas las plantillas de una tienda
   * @param storeId - ID de la tienda
   * @returns Array de archivos de plantilla
   */
  public async loadAllTemplates(storeId: string): Promise<TemplateFile[]> {
    try {
      // Primero verificar si existe el registro en StoreTemplate
      const { data: storeTemplate } = await cookiesClient.models.StoreTemplate.get({
        storeId: storeId,
      })

      if (!storeTemplate || !storeTemplate.isActive) {
        throw new Error(`No active templates found for store: ${storeId}`)
      }

      // Listar todos los archivos de plantilla en S3
      const prefix = `templates/${storeId}/`
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
      })

      const response = await this.s3Client!.send(command)

      if (!response.Contents || response.Contents.length === 0) {
        throw new Error(`No template files found for store: ${storeId}`)
      }

      // Cargar contenido de cada archivo
      const templateFiles: TemplateFile[] = []

      for (const object of response.Contents) {
        if (!object.Key) continue

        // Extraer el path relativo
        const relativePath = object.Key.replace(prefix, '')

        try {
          const content = await this.loadTemplate(storeId, relativePath)

          templateFiles.push({
            path: relativePath,
            content,
            contentType: this.getContentType(relativePath),
            lastModified: object.LastModified,
          })
        } catch (error) {
          console.warn(`Failed to load template file: ${relativePath}`, error)
          // Continuar con otros archivos
        }
      }

      if (templateFiles.length === 0) {
        throw new Error(`No valid template files found for store: ${storeId}`)
      }

      return templateFiles
    } catch (error) {
      console.error(`Error loading templates for store ${storeId}:`, error)

      const templateError: TemplateError = {
        type: 'TEMPLATE_NOT_FOUND',
        message: `Templates not found for store: ${storeId}`,
        details: error,
        statusCode: 404,
      }

      throw templateError
    }
  }

  /**
   * Carga una plantilla específica por tipo (layout, section)
   * @param storeId - ID de la tienda
   * @param templateType - Tipo de plantilla ('layout' | 'sections')
   * @param templateName - Nombre de la plantilla
   * @returns Contenido de la plantilla
   */
  public async loadTemplateByType(
    storeId: string,
    templateType: 'layout' | 'sections',
    templateName: string
  ): Promise<string> {
    const templatePath = `${templateType}/${templateName}`
    return await this.loadTemplate(storeId, templatePath)
  }

  /**
   * Carga el layout principal de la tienda
   * @param storeId - ID de la tienda
   * @returns Contenido del layout principal
   */
  public async loadMainLayout(storeId: string): Promise<string> {
    return await this.loadTemplateByType(storeId, 'layout', 'theme.liquid')
  }

  /**
   * Carga una sección específica
   * @param storeId - ID de la tienda
   * @param sectionName - Nombre de la sección (sin extensión)
   * @returns Contenido de la sección
   */
  public async loadSection(storeId: string, sectionName: string): Promise<string> {
    const fileName = sectionName.endsWith('.liquid') ? sectionName : `${sectionName}.liquid`
    return await this.loadTemplateByType(storeId, 'sections', fileName)
  }

  /**
   * Verifica si una tienda tiene plantillas disponibles
   * @param storeId - ID de la tienda
   * @returns true si tiene plantillas activas
   */
  public async hasTemplates(storeId: string): Promise<boolean> {
    try {
      const { data: storeTemplate } = await cookiesClient.models.StoreTemplate.get({
        storeId: storeId,
      })

      return !!(storeTemplate && storeTemplate.isActive)
    } catch (error) {
      console.error(`Error checking templates for store ${storeId}:`, error)
      return false
    }
  }

  /**
   * Invalida el caché para una tienda específica
   * @param storeId - ID de la tienda
   */
  public invalidateStoreCache(storeId: string): void {
    delete this.cache[storeId]
  }

  /**
   * Invalida el caché para una plantilla específica
   * @param storeId - ID de la tienda
   * @param templatePath - Ruta de la plantilla
   */
  public invalidateTemplateCache(storeId: string, templatePath: string): void {
    if (this.cache[storeId]) {
      delete this.cache[storeId][templatePath]
    }
  }

  /**
   * Limpia todo el caché
   */
  public clearCache(): void {
    this.cache = {}
  }

  /**
   * Limpia plantillas expiradas del caché
   */
  public cleanExpiredCache(): void {
    const now = Date.now()

    Object.keys(this.cache).forEach(storeId => {
      const storeCache = this.cache[storeId]

      Object.keys(storeCache).forEach(templatePath => {
        const cached = storeCache[templatePath]
        if (now > cached.lastUpdated.getTime() + cached.ttl) {
          delete storeCache[templatePath]
        }
      })

      // Si no quedan plantillas en caché para esta tienda, eliminar la entrada
      if (Object.keys(storeCache).length === 0) {
        delete this.cache[storeId]
      }
    })
  }

  /**
   * Carga una plantilla desde CloudFront (producción)
   */
  private async loadTemplateFromCloudFront(storeId: string, templatePath: string): Promise<string> {
    const templateUrl = `https://${this.cloudFrontDomain}/templates/${storeId}/${templatePath}`

    const response = await fetch(templateUrl)

    if (!response.ok) {
      throw new Error(
        `Template not found: ${templatePath} (CloudFront returned ${response.status})`
      )
    }

    return await response.text()
  }

  /**
   * Carga una plantilla desde S3 directamente (desarrollo)
   */
  private async loadTemplateFromS3(storeId: string, templatePath: string): Promise<string> {
    if (!this.s3Client || !this.bucketName) {
      throw new Error('S3 client or bucket not configured')
    }

    // Construir la key de S3
    const s3Key = `templates/${storeId}/${templatePath}`

    // Cargar desde S3
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    })

    const response = await this.s3Client.send(command)

    if (!response.Body) {
      throw new Error(`Template not found: ${templatePath}`)
    }

    // Convertir stream a string usando AWS SDK v3
    return await response.Body!.transformToString()
  }

  /**
   * Obtiene una plantilla del caché si existe y es válida
   */
  private getCachedTemplate(storeId: string, templatePath: string): TemplateCache | null {
    const storeCache = this.cache[storeId]
    if (!storeCache) {
      return null
    }

    const cached = storeCache[templatePath]
    if (!cached) {
      return null
    }

    const now = Date.now()
    if (now > cached.lastUpdated.getTime() + cached.ttl) {
      delete storeCache[templatePath]
      return null
    }

    return cached
  }

  /**
   * Guarda una plantilla en caché
   */
  private setCachedTemplate(storeId: string, templatePath: string, content: string): void {
    if (!this.cache[storeId]) {
      this.cache[storeId] = {}
    }

    this.cache[storeId][templatePath] = {
      content,
      lastUpdated: new Date(),
      ttl: this.TEMPLATE_CACHE_TTL,
    }
  }

  /**
   * Determina el content type basado en la extensión del archivo
   */
  private getContentType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop()

    const contentTypes: Record<string, string> = {
      html: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
      json: 'application/json',
      liquid: 'application/liquid',
      txt: 'text/plain',
      md: 'text/markdown',
    }

    return contentTypes[ext || ''] || 'text/plain'
  }

  /**
   * Obtiene estadísticas del caché para debugging
   */
  public getCacheStats(): {
    stores: number
    totalTemplates: number
    expiredTemplates: number
    activeTemplates: number
  } {
    const now = Date.now()
    let stores = 0
    let totalTemplates = 0
    let expiredTemplates = 0
    let activeTemplates = 0

    Object.values(this.cache).forEach(storeCache => {
      stores++

      Object.values(storeCache).forEach(cached => {
        totalTemplates++
        if (now > cached.lastUpdated.getTime() + cached.ttl) {
          expiredTemplates++
        } else {
          activeTemplates++
        }
      })
    })

    return { stores, totalTemplates, expiredTemplates, activeTemplates }
  }
}

// Export singleton instance
export const templateLoader = TemplateLoader.getInstance()

// Export class for testing
export { TemplateLoader }
