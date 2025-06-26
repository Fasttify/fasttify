import { Liquid } from 'liquidjs'
import type {
  LiquidEngineConfig,
  CompiledTemplate,
  TemplateCache,
  LiquidContext,
  TemplateError,
} from '@/renderer-engine/types'
import { allFilters } from '@/renderer-engine/liquid/filters'
import { SchemaTag } from '@/renderer-engine/liquid/tags/schema-tag'
import { ScriptTag } from '@/renderer-engine/liquid/tags/script-tag'
import { SectionTag } from '@/renderer-engine/liquid/tags/section-tag'
import { PaginateTag, EndPaginateTag } from '@/renderer-engine/liquid/tags/paginate-tag'
import { RenderTag, IncludeTag } from '@/renderer-engine/liquid/tags/render-tag'
import { StyleTag, StylesheetTag } from '@/renderer-engine/liquid/tags/style-tag'
import { JavaScriptTag } from '@/renderer-engine/liquid/tags/javascript-tag'
import { FormTag } from '@/renderer-engine/liquid/tags/form-tag'
import { cacheManager } from '@/renderer-engine/services/core/cache-manager'
import { AssetCollector } from '@/renderer-engine/services/rendering/asset-collector'
import { logger } from '@/renderer-engine/lib/logger'

class LiquidEngine {
  private static instance: LiquidEngine
  private liquid: Liquid
  public assetCollector: AssetCollector
  private currentStoreId: string | null = null

  private constructor() {
    this.assetCollector = new AssetCollector()
    this.liquid = this.createEngine()
    this.registerFilters()
    this.registerCustomTags()
  }

  public static getInstance(): LiquidEngine {
    if (!LiquidEngine.instance) {
      LiquidEngine.instance = new LiquidEngine()
    }
    return LiquidEngine.instance
  }

  /**
   * Crea y configura la instancia de LiquidJS
   */
  private createEngine(): Liquid {
    const config: LiquidEngineConfig = {
      cache: false, // Caché interno de LiquidJS
      greedy: false, // Permite variables undefined sin error
      trimTagLeft: false,
      trimTagRight: false,
      trimOutputLeft: false,
      trimOutputRight: false,
      strictFilters: false, // Permite filtros undefined
      strictVariables: false, // Permite variables undefined
      globals: {
        // Variables globales disponibles en todas las plantillas
        settings: {
          currency: 'COP',
          currency_symbol: '$',
          money_format: '${{amount}}',
          timezone: 'America/Bogota',
        },
      },
      context: {
        _assetCollector: this.assetCollector,
      },
    }

    return new Liquid(config)
  }

  /**
   * Registra todos los filtros personalizados
   */
  private registerFilters(): void {
    allFilters.forEach(({ name, filter }) => {
      this.liquid.registerFilter(name, filter)
    })
  }

  /**
   * Registra filtros específicos del contexto de una tienda
   * Solo registra si el storeId cambió para evitar acumulación
   */
  private registerStoreFilters(storeId: string): void {
    //  SOLO registrar si cambió el storeId o es la primera vez
    if (this.currentStoreId === storeId) {
      return // Ya está registrado para este store, no hacer nada
    }

    logger.debug(`Registering filters for store: ${storeId}`, 'LiquidEngine')

    // Registrar asset_url con storeId específico
    this.liquid.registerFilter('asset_url', (filename: string) => {
      if (!filename) {
        return ''
      }

      // Limpiar el filename
      const cleanFilename = filename.replace(/^\/+/, '')

      // URL para assets específicos de la tienda via API
      return `/api/stores/${storeId}/assets/${cleanFilename}`
    })

    //  Actualizar el storeId actual
    this.currentStoreId = storeId
  }

  /**
   * Registra tags personalizados para compatibilidad con Shopify
   */
  private registerCustomTags(): void {
    // ETIQUETAS BÁSICAS DE SHOPIFY
    this.liquid.registerTag('schema', SchemaTag)
    this.liquid.registerTag('section', SectionTag)

    // ETIQUETAS DE PAGINACIÓN
    this.liquid.registerTag('paginate', PaginateTag)
    this.liquid.registerTag('endpaginate', EndPaginateTag)

    // ETIQUETAS DE COMPONENTES/SNIPPETS
    this.liquid.registerTag('render', RenderTag)
    this.liquid.registerTag('include', IncludeTag) // Deprecated pero compatible

    // ETIQUETAS DE ESTILO Y SCRIPT
    this.liquid.registerTag('style', StyleTag)
    this.liquid.registerTag('stylesheet', StylesheetTag)
    this.liquid.registerTag('script', ScriptTag)
    this.liquid.registerTag('javascript', JavaScriptTag)
    this.liquid.registerTag('form', FormTag)
  }

  /**
   * Compila y renderiza una plantilla con contexto
   * @param templateContent - Contenido de la plantilla Liquid
   * @param context - Variables para el renderizado
   * @param templatePath - Path para caché (opcional)
   * @returns HTML renderizado
   */
  public async render(
    templateContent: string,
    context: LiquidContext,
    templatePath?: string
  ): Promise<string> {
    try {
      // Registrar filtros específicos de la tienda si hay storeId en el contexto
      const storeId = context?.storeId || context?.store?.storeId || context?.shop?.storeId
      if (storeId) {
        this.registerStoreFilters(storeId)
      }

      // Renderizar directamente usando parseAndRender
      // LiquidJS maneja internamente el parsing y rendering
      const result = await this.liquid.parseAndRender(templateContent, context)

      return result
    } catch (error) {
      logger.error('Template rendering failed', error, 'LiquidEngine')

      const templateError: TemplateError = {
        type: 'RENDER_ERROR',
        message: `Template rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error,
        statusCode: 500,
      }

      throw templateError
    }
  }

  /**
   * Precompila una plantilla para optimización
   * @param templateContent - Contenido de la plantilla
   * @param templatePath - Path para identificar la plantilla
   * @returns Template compilado
   */
  public async compileTemplate(
    templateContent: string,
    templatePath: string
  ): Promise<CompiledTemplate> {
    try {
      const compiledTemplate = this.liquid.parse(templateContent)

      // Guardar en caché
      this.setCachedTemplate(templatePath, templateContent, compiledTemplate)

      return {
        liquid: this.liquid,
        template: compiledTemplate,
        cacheKey: templatePath,
        compiledAt: new Date(),
      }
    } catch (error) {
      logger.error('Template compilation failed', error, 'LiquidEngine')

      const templateError: TemplateError = {
        type: 'RENDER_ERROR',
        message: `Template compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error,
        statusCode: 500,
      }

      throw templateError
    }
  }

  /**
   * Renderiza una plantilla precompilada
   * @param compiled - Plantilla compilada
   * @param context - Variables para el renderizado
   * @returns HTML renderizado
   */
  public async renderCompiled(compiled: CompiledTemplate, context: LiquidContext): Promise<string> {
    try {
      return await compiled.liquid.render(compiled.template, context)
    } catch (error) {
      logger.error('Compiled template rendering failed', error, 'LiquidEngine')

      const templateError: TemplateError = {
        type: 'RENDER_ERROR',
        message: `Compiled template rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error,
        statusCode: 500,
      }

      throw templateError
    }
  }

  /**
   * Obtiene una plantilla del caché si existe y es válida
   */
  private getCachedTemplate(templatePath: string, content: string): any | null {
    const cacheKey = `template_${templatePath}`
    const cached = cacheManager.getCached(cacheKey) as TemplateCache | null

    if (!cached) {
      return null
    }

    // Verificar que el contenido no haya cambiado
    if (cached.content !== content) {
      cacheManager.invalidateTemplateCache(templatePath)
      return null
    }

    return cached.compiledTemplate
  }

  /**
   * Guarda una plantilla compilada en caché
   */
  private setCachedTemplate(templatePath: string, content: string, compiled: any): void {
    const cacheKey = `template_${templatePath}`
    const templateCache: TemplateCache = {
      content,
      compiledTemplate: compiled,
      lastUpdated: new Date(),
      ttl: cacheManager.TEMPLATE_CACHE_TTL,
    }

    cacheManager.setCached(cacheKey, templateCache, cacheManager.TEMPLATE_CACHE_TTL)
  }

  /**
   * Invalida el caché para una plantilla específica
   * @param templatePath - Path de la plantilla a invalidar
   */
  public invalidateCache(templatePath: string): void {
    cacheManager.invalidateTemplateCache(templatePath)
  }

  /**
   * Limpia todo el caché de plantillas
   */
  public clearCache(): void {
    cacheManager.clearCache()
    // Recrear la instancia de Liquid para limpiar su caché interno
    this.assetCollector = new AssetCollector()
    this.liquid = this.createEngine()
    this.registerFilters()
    this.registerCustomTags()
    // 🆕 Resetear el contexto de store
    this.currentStoreId = null
    logger.info('Cache y contexto de Liquid limpiados completamente', 'LiquidEngine')
  }

  /**
   * Limpia plantillas expiradas del caché
   */
  public cleanExpiredCache(): void {
    cacheManager.cleanExpiredCache()
  }

  /**
   * Obtiene estadísticas del caché para debugging
   */
  public getCacheStats(): { total: number; expired: number; active: number } {
    return cacheManager.getCacheStats()
  }

  /**
   * Registra un filtro personalizado adicional
   * @param name - Nombre del filtro
   * @param filterFunction - Función del filtro
   */
  public registerCustomFilter(name: string, filterFunction: (...args: any[]) => any): void {
    this.liquid.registerFilter(name, filterFunction)
  }

  /**
   * Obtiene la instancia de Liquid para uso avanzado
   */
  public getLiquidInstance(): Liquid {
    return this.liquid
  }
}

// Export singleton instance
export const liquidEngine = LiquidEngine.getInstance()

// Export class for testing
export { LiquidEngine }
