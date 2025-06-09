import { Liquid } from 'liquidjs'
import type {
  LiquidEngineConfig,
  CompiledTemplate,
  TemplateCache,
  LiquidContext,
  TemplateError,
} from '@/lib/store-renderer/types'
import { ecommerceFilters } from '@/lib/store-renderer/liquid/filters'
import { SchemaTag } from '@/lib/store-renderer/liquid/tags/schema-tag'
import { ScriptTag } from '@/lib/store-renderer/liquid/tags/script-tag'
import { SectionTag } from '@/lib/store-renderer/liquid/tags/section-tag'
import { PaginateTag } from '@/lib/store-renderer/liquid/tags/paginate-tag'
import { RenderTag, IncludeTag } from '@/lib/store-renderer/liquid/tags/render-tag'
import { StyleTag, StylesheetTag } from '@/lib/store-renderer/liquid/tags/style-tag'
import { JavaScriptTag } from '@/lib/store-renderer/liquid/tags/javascript-tag'
import { FormTag } from '@/lib/store-renderer/liquid/tags/form-tag'
import { cacheManager } from '@/lib/store-renderer/services/core/cache-manager'

class LiquidEngine {
  private static instance: LiquidEngine
  private liquid: Liquid

  private constructor() {
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
      cache: true, // Caché interno de LiquidJS
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
    }

    return new Liquid(config)
  }

  /**
   * Registra todos los filtros personalizados
   */
  private registerFilters(): void {
    ecommerceFilters.forEach(({ name, filter }) => {
      this.liquid.registerFilter(name, filter)
    })
  }

  /**
   * Registra filtros específicos del contexto de una tienda
   */
  private registerStoreFilters(storeId: string): void {
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
      console.error('Liquid render error:', error)

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
      console.error('Template compilation error:', error)

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
      console.error('Compiled template render error:', error)

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
    this.liquid = this.createEngine()
    this.registerFilters()
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
