import { Liquid } from 'liquidjs'
import type {
  LiquidEngineConfig,
  CompiledTemplate,
  TemplateCache,
  LiquidContext,
  TemplateError,
} from '../types'
import { ecommerceFilters } from './filters'
import { SchemaTag } from './tags/schema-tag'

interface EngineCache {
  [templatePath: string]: TemplateCache
}

class LiquidEngine {
  private static instance: LiquidEngine
  private liquid: Liquid
  private cache: EngineCache = {}
  private readonly TEMPLATE_CACHE_TTL = 60 * 60 * 1000 // 1 hora en ms

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
   * Registra tags personalizados para compatibilidad con Shopify
   */
  private registerCustomTags(): void {
    // Registrar el tag schema
    this.liquid.registerTag('schema', SchemaTag)
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
    const cached = this.cache[templatePath]
    if (!cached) {
      return null
    }

    const now = Date.now()
    if (now > cached.lastUpdated.getTime() + cached.ttl) {
      // Caché expirado
      delete this.cache[templatePath]
      return null
    }

    // Verificar que el contenido no haya cambiado
    if (cached.content !== content) {
      delete this.cache[templatePath]
      return null
    }

    return cached.compiledTemplate
  }

  /**
   * Guarda una plantilla compilada en caché
   */
  private setCachedTemplate(templatePath: string, content: string, compiled: any): void {
    this.cache[templatePath] = {
      content,
      compiledTemplate: compiled,
      lastUpdated: new Date(),
      ttl: this.TEMPLATE_CACHE_TTL,
    }
  }

  /**
   * Invalida el caché para una plantilla específica
   * @param templatePath - Path de la plantilla a invalidar
   */
  public invalidateCache(templatePath: string): void {
    delete this.cache[templatePath]
  }

  /**
   * Limpia todo el caché de plantillas
   */
  public clearCache(): void {
    this.cache = {}
    // Recrear la instancia de Liquid para limpiar su caché interno
    this.liquid = this.createEngine()
    this.registerFilters()
  }

  /**
   * Limpia plantillas expiradas del caché
   */
  public cleanExpiredCache(): void {
    const now = Date.now()
    Object.keys(this.cache).forEach(templatePath => {
      const cached = this.cache[templatePath]
      if (now > cached.lastUpdated.getTime() + cached.ttl) {
        delete this.cache[templatePath]
      }
    })
  }

  /**
   * Obtiene estadísticas del caché para debugging
   */
  public getCacheStats(): { total: number; expired: number; active: number } {
    const now = Date.now()
    let total = 0
    let expired = 0
    let active = 0

    Object.values(this.cache).forEach(cached => {
      total++
      if (now > cached.lastUpdated.getTime() + cached.ttl) {
        expired++
      } else {
        active++
      }
    })

    return { total, expired, active }
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
