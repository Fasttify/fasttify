import { dataFetcher } from '@/renderer-engine/services/fetchers/data-fetcher'
import { templateAnalyzer } from '@/renderer-engine/services/templates/template-analyzer'
import { templateLoader } from '@/renderer-engine/services/templates/template-loader'
import { logger } from '@/renderer-engine/lib/logger'
import type { PageRenderOptions } from '@/renderer-engine/types/template'
import type {
  DataRequirement,
  DataLoadOptions,
  TemplateAnalysis,
} from '@/renderer-engine/services/templates/template-analyzer'

/**
 * Resultado de la carga dinámica de datos
 */
export interface DynamicLoadResult {
  products: any[]
  collections: any[]
  contextData: Record<string, any>
  metaData: Record<string, any>
  cartData: any
  analysis: TemplateAnalysis
}

/**
 * Cargador dinámico de datos basado en análisis de plantillas
 * Reemplaza la lógica hardcodeada con análisis inteligente
 */
export class DynamicDataLoader {
  private static instance: DynamicDataLoader

  private constructor() {}

  public static getInstance(): DynamicDataLoader {
    if (!DynamicDataLoader.instance) {
      DynamicDataLoader.instance = new DynamicDataLoader()
    }
    return DynamicDataLoader.instance
  }

  /**
   * Carga datos dinámicamente basándose en el análisis de plantillas
   */
  public async loadDynamicData(
    storeId: string,
    options: PageRenderOptions
  ): Promise<DynamicLoadResult> {
    try {
      // 1. Cargar y analizar las plantillas necesarias
      const analysis = await this.analyzeRequiredTemplates(storeId, options)

      // 2. Cargar datos básicos siempre necesarios (carrito para header)
      const cartData = dataFetcher.transformCartToContext(
        await dataFetcher.getCart(storeId)
      )

      // 3. Cargar datos específicos según el análisis
      const loadedData = await this.loadDataFromAnalysis(storeId, analysis, options)

      // 4. Construir contextData específico para el tipo de página
      const contextData = await this.buildContextData(storeId, options, loadedData)

      return {
        products: loadedData.products || [],
        collections: loadedData.collections || [],
        contextData,
        metaData: {},
        cartData,
        analysis,
      }
    } catch (error) {
      logger.error('Error in dynamic data loading', error, 'DynamicDataLoader')

      // Fallback a datos mínimos
      return this.createFallbackData(storeId, options)
    }
  }

  /**
   * Analiza las plantillas requeridas para la página
   */
  private async analyzeRequiredTemplates(
    storeId: string,
    options: PageRenderOptions
  ): Promise<TemplateAnalysis> {
    try {
      // Cargar plantillas principales
      const templatePath = this.getTemplatePath(options.pageType)
      const layout = await templateLoader.loadMainLayout(storeId)
      const pageTemplate = await templateLoader.loadTemplate(storeId, templatePath)

      // Cargar secciones que usa el layout
      const layoutSections = this.extractSectionNames(layout)
      const sections: Record<string, string> = {}

      for (const sectionName of layoutSections) {
        try {
          const sectionContent = await templateLoader.loadSection(storeId, sectionName)
          sections[sectionName] = sectionContent
        } catch (error) {
          logger.warn(`Could not load section ${sectionName}`, error, 'DynamicDataLoader')
        }
      }

      // Analizar el conjunto completo de plantillas
      const analysis = await templateAnalyzer.analyzeTemplateSet(
        storeId,
        { layout, page: pageTemplate, sections },
        { layout: 'layout/theme.liquid', page: templatePath }
      )

      logger.debug(
        `Dynamic analysis completed for ${options.pageType}`,
        {
          requiredData: Array.from(analysis.requiredData.keys()),
          hasPagination: analysis.hasPagination,
          dependencies: analysis.dependencies.length,
        },
        'DynamicDataLoader'
      )

      return analysis
    } catch (error) {
      logger.error('Error analyzing templates', error, 'DynamicDataLoader')
      // Retornar análisis vacío en caso de error
      return {
        requiredData: new Map(),
        hasPagination: false,
        usedSections: [],
        liquidObjects: [],
        dependencies: [],
      }
    }
  }

  /**
   * Carga datos basándose en el análisis de plantillas
   */
  private async loadDataFromAnalysis(
    storeId: string,
    analysis: TemplateAnalysis,
    options: PageRenderOptions
  ): Promise<Record<string, any>> {
    const loadedData: Record<string, any> = {}
    const loadPromises: Promise<void>[] = []

    // Cargar datos según los requerimientos detectados
    for (const [dataType, loadOptions] of analysis.requiredData) {
      const promise = this.loadSpecificData(storeId, dataType, loadOptions, options)
        .then(data => {
          if (data) {
            loadedData[dataType] = data
          }
        })
        .catch(error => {
          logger.warn(`Failed to load ${dataType}`, error, 'DynamicDataLoader')
        })

      loadPromises.push(promise)
    }

    // Esperar a que se carguen todos los datos en paralelo
    await Promise.all(loadPromises)

    return loadedData
  }

  /**
   * Carga un tipo específico de datos
   */
  private async loadSpecificData(
    storeId: string,
    dataType: DataRequirement,
    options: DataLoadOptions,
    pageOptions: PageRenderOptions
  ): Promise<any> {
    switch (dataType) {
      case 'products':
        return await dataFetcher.getStoreProducts(storeId, {
          limit: options.limit || 20,
          nextToken: options.nextToken,
        })

      case 'collection_products':
        return await dataFetcher.getFeaturedProducts(storeId, options.limit || 8)

      case 'collections':
        const collectionsResult = await dataFetcher.getStoreCollections(storeId, {
          limit: options.limit || 10,
          nextToken: options.nextToken,
        })
        return collectionsResult.collections

      case 'product':
        if (pageOptions.productId || pageOptions.handle) {
          const productId = pageOptions.productId || pageOptions.handle!
          return await dataFetcher.getProduct(storeId, productId)
        }
        return null

      case 'collection':
        if (pageOptions.collectionId) {
          return await dataFetcher.getCollection(storeId, pageOptions.collectionId)
        } else if (pageOptions.handle) {
          // Buscar colección por handle
          const collectionsResult = await dataFetcher.getStoreCollections(storeId, {
            limit: options.limit || 10,
            nextToken: options.nextToken,
          })
          const collectionRef = collectionsResult.collections.find(
            c =>
              c.slug === pageOptions.handle ||
              c.title.toLowerCase().replace(/\s+/g, '-') === pageOptions.handle
          )
          if (collectionRef) {
            return await dataFetcher.getCollection(storeId, collectionRef.id)
          }
        }
        return null

      case 'cart':
        const cart = await dataFetcher.getCart(storeId)
        return dataFetcher.transformCartToContext(cart)

      case 'linklists':
        return await dataFetcher.getStoreNavigationMenus(storeId)

      case 'shop':
        // Este se carga en el context builder, no necesita datos adicionales
        return null

      default:
        logger.warn(`Unknown data type: ${dataType}`, undefined, 'DynamicDataLoader')
        return null
    }
  }

  /**
   * Construye el contextData específico para el tipo de página
   */
  private async buildContextData(
    storeId: string,
    options: PageRenderOptions,
    loadedData: Record<string, any>
  ): Promise<Record<string, any>> {
    const contextData: Record<string, any> = {
      template: options.pageType,
    }

    // Agregar datos específicos según el tipo de página
    switch (options.pageType) {
      case 'index':
        contextData.page_title = 'Inicio'
        break

      case 'product':
        if (loadedData.product) {
          contextData.product = loadedData.product
          contextData.page_title = loadedData.product.name
        } else {
          contextData.page_title = 'Producto'
        }
        break

      case 'collection':
        if (loadedData.collection) {
          contextData.collection = loadedData.collection
          contextData.page_title = loadedData.collection.title
        } else {
          contextData.page_title = 'Colección'
        }
        break

      case 'cart':
        contextData.page_title = 'Carrito de Compras'
        if (loadedData.cart) {
          contextData.cart = loadedData.cart
        }
        break

      case '404':
        contextData.page_title = 'Página No Encontrada'
        contextData.error_message = 'La página que buscas no existe'
        break

      default:
        contextData.page_title =
          options.pageType.charAt(0).toUpperCase() + options.pageType.slice(1)
        break
    }

    return contextData
  }

  /**
   * Crea datos de fallback en caso de error
   */
  private async createFallbackData(
    storeId: string,
    options: PageRenderOptions
  ): Promise<DynamicLoadResult> {
    const cartData = dataFetcher.transformCartToContext(
      await dataFetcher.getCart(storeId)
    )

    return {
      products: [],
      collections: [],
      contextData: {
        template: options.pageType,
        page_title: options.pageType.charAt(0).toUpperCase() + options.pageType.slice(1),
      },
      metaData: {},
      cartData,
      analysis: {
        requiredData: new Map(),
        hasPagination: false,
        usedSections: [],
        liquidObjects: [],
        dependencies: [],
      },
    }
  }

  /**
   * Extrae nombres de secciones del layout
   */
  private extractSectionNames(layout: string): string[] {
    const sectionMatches = layout.match(/\{\%\s*section\s+['"]([^'"]+)['"]\s*\%\}/g) || []
    return sectionMatches
      .map(match => {
        const nameMatch = match.match(/section\s+['"]([^'"]+)['"]/i)
        return nameMatch ? nameMatch[1] : ''
      })
      .filter(Boolean)
  }

  /**
   * Obtiene el path de la plantilla según el tipo de página
   */
  private getTemplatePath(pageType: string): string {
    const templatePaths: Record<string, string> = {
      index: 'templates/index.json',
      product: 'templates/product.json',
      collection: 'templates/collection.json',
      cart: 'templates/cart.json',
      page: 'templates/page.json',
      search: 'templates/search.json',
      '404': 'templates/404.json',
    }

    return templatePaths[pageType] || `templates/${pageType}.json`
  }

  /**
   * Obtiene estadísticas del último análisis para debugging
   */
  public getLastAnalysisStats(): any {
    return {
      // Implementar estadísticas si es necesario
      message: 'Use loadDynamicData to get analysis results',
    }
  }
}

export const dynamicDataLoader = DynamicDataLoader.getInstance()
