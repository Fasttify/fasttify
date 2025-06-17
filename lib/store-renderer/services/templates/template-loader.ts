import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import type { TemplateFile, TemplateCache, TemplateError } from '@/lib/store-renderer/types'
import { cacheManager } from '@/lib/store-renderer/services/core/cache-manager'
import { dataFetcher } from '@/lib/store-renderer/services/fetchers/data-fetcher'

class TemplateLoader {
  private static instance: TemplateLoader
  private s3Client?: S3Client
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
      // Verificar caché primero
      const cached = this.getCachedTemplate(storeId, templatePath)
      if (cached) {
        return cached.content
      }

      let content: string

      // En producción usar CloudFront, en desarrollo usar S3 directo
      if (this.appEnv === 'production' && this.cloudFrontDomain) {
        content = await this.loadTemplateFromCloudFront(storeId, templatePath)
      } else {
        content = await this.loadTemplateFromS3(storeId, templatePath)
      }

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
      const storeTemplate = await dataFetcher.getStoreTemplateData(storeId)

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
   * Carga un asset estático (imagen, CSS, JS) desde el directorio assets
   * @param storeId - ID de la tienda
   * @param assetPath - Ruta del asset (ej: "nike.png", "theme.css")
   * @returns Contenido del asset como Buffer
   */
  public async loadAsset(storeId: string, assetPath: string): Promise<Buffer> {
    try {
      // Verificar caché primero (para assets también)
      const cacheKey = `asset_${storeId}_${assetPath}`
      const cached = cacheManager.getCached(cacheKey) as TemplateCache | null
      if (cached) {
        // Para assets, el contenido en caché es base64, convertir de vuelta a Buffer
        return Buffer.from(cached.content, 'base64')
      }

      let assetBuffer: Buffer

      // En producción usar CloudFront, en desarrollo usar S3 directo
      if (this.appEnv === 'production' && this.cloudFrontDomain) {
        assetBuffer = await this.loadAssetFromCloudFront(storeId, assetPath)
      } else {
        assetBuffer = await this.loadAssetFromS3(storeId, assetPath)
      }

      // Guardar en caché (convertir Buffer a base64 para almacenamiento)
      const assetCache: TemplateCache = {
        content: assetBuffer.toString('base64'),
        lastUpdated: new Date(),
        ttl: cacheManager.TEMPLATE_CACHE_TTL,
      }
      cacheManager.setCached(cacheKey, assetCache, cacheManager.TEMPLATE_CACHE_TTL)

      return assetBuffer
    } catch (error) {
      console.error(
        `[TemplateLoader] Error loading asset ${assetPath} for store ${storeId}:`,
        error
      )

      const templateError: TemplateError = {
        type: 'TEMPLATE_NOT_FOUND',
        message: `Asset not found: ${assetPath}`,
        details: error,
        statusCode: 404,
      }

      throw templateError
    }
  }

  /**
   * Verifica si una tienda tiene plantillas disponibles
   * @param storeId - ID de la tienda
   * @returns true si tiene plantillas activas
   */
  public async hasTemplates(storeId: string): Promise<boolean> {
    try {
      await dataFetcher.getStoreTemplateData(storeId)
      return true
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
    cacheManager.invalidateStoreCache(storeId)
  }

  /**
   * Invalida la caché de una plantilla específica
   * @param storeId - ID de la tienda
   * @param templatePath - Ruta de la plantilla
   */
  public invalidateTemplateCache(storeId: string, templatePath: string): void {
    const cacheKey = `template_${storeId}_${templatePath}`
    // Invalidar estableciendo a null con TTL de 0
    cacheManager.setCached(cacheKey, null, 0)
    console.log(`[TemplateLoader] Caché invalidada para ${templatePath} en tienda ${storeId}`)
  }

  /**
   * Invalida toda la caché de plantillas para una tienda
   * @param storeId - ID de la tienda
   */
  public invalidateAllTemplateCache(storeId: string): void {
    // Usar el método existente para invalidar caché por tienda
    cacheManager.invalidateStoreCache(storeId)
    console.log(`[TemplateLoader] Caché de todas las plantillas invalidada para tienda ${storeId}`)
  }

  /**
   * Limpia todo el caché
   */
  public clearCache(): void {
    cacheManager.clearCache()
  }

  /**
   * Limpia plantillas expiradas del caché
   */
  public cleanExpiredCache(): void {
    cacheManager.cleanExpiredCache()
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
   * Carga un asset desde CloudFront (producción)
   */
  private async loadAssetFromCloudFront(storeId: string, assetPath: string): Promise<Buffer> {
    const assetUrl = `https://${this.cloudFrontDomain}/templates/${storeId}/assets/${assetPath}`

    const response = await fetch(assetUrl)

    if (!response.ok) {
      throw new Error(`Asset not found: ${assetPath} (CloudFront returned ${response.status})`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  /**
   * Carga un asset desde S3 directamente (desarrollo)
   */
  private async loadAssetFromS3(storeId: string, assetPath: string): Promise<Buffer> {
    if (!this.s3Client || !this.bucketName) {
      throw new Error('S3 client or bucket not configured')
    }

    // Construir la key de S3 para assets
    const s3Key = `templates/${storeId}/assets/${assetPath}`

    // Cargar desde S3
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    })

    const response = await this.s3Client.send(command)

    if (!response.Body) {
      throw new Error(`Asset not found: ${assetPath}`)
    }

    // Convertir stream a Buffer usando AWS SDK v3
    const bytes = await response.Body!.transformToByteArray()
    return Buffer.from(bytes)
  }

  /**
   * Obtiene una plantilla del caché si existe y es válida
   */
  private getCachedTemplate(storeId: string, templatePath: string): TemplateCache | null {
    const cacheKey = `template_${storeId}_${templatePath}`
    const cached = cacheManager.getCached(cacheKey) as TemplateCache | null
    return cached
  }

  /**
   * Guarda una plantilla en caché
   */
  private setCachedTemplate(storeId: string, templatePath: string, content: string): void {
    const cacheKey = `template_${storeId}_${templatePath}`

    // Utilizar el nuevo método para obtener el TTL apropiado según el entorno
    const cacheTTL = cacheManager.getAppropiateTTL('template')

    const cacheItem = {
      content,
      lastUpdated: new Date(),
      ttl: cacheTTL,
    }

    cacheManager.setCached(cacheKey, cacheItem, cacheTTL)
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
    const globalStats = cacheManager.getCacheStats()

    // Para mantener compatibilidad, mapeamos las estadísticas globales
    return {
      stores: 0, // No podemos determinar esto fácilmente con el cache global
      totalTemplates: globalStats.total,
      expiredTemplates: globalStats.expired,
      activeTemplates: globalStats.active,
    }
  }
}

// Export singleton instance
export const templateLoader = TemplateLoader.getInstance()

// Export class for testing
export { TemplateLoader }
