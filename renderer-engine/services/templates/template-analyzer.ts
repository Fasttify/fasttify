import { logger } from '@/renderer-engine/lib/logger'

/**
 * Tipo de datos que pueden ser detectados en una plantilla
 */
export type DataRequirement =
  | 'products' // {{ products }}
  | 'collection_products' // collections.CUALQUIER_NOMBRE.products
  | 'collections' // {{ collections }}
  | 'product' // {{ product }} (página individual)
  | 'collection' // {{ collection }} (página individual)
  | 'cart' // {{ cart }}
  | 'linklists' // {{ linklists.main-menu }}
  | 'shop' // {{ shop }}
  | 'page' // {{ page }}
  | 'blog' // {{ blog }}
  | 'pagination' // {% paginate %}

/**
 * Opciones de carga para cada tipo de dato
 */
export interface DataLoadOptions {
  limit?: number
  offset?: number
  handle?: string
  id?: string
  nextToken?: string
  collectionHandle?: string // Para collections.NOMBRE.products
}

/**
 * Resultado del análisis de una plantilla
 */
export interface TemplateAnalysis {
  requiredData: Map<DataRequirement, DataLoadOptions>
  hasPagination: boolean
  usedSections: string[]
  liquidObjects: string[]
  dependencies: string[] // Snippets/secciones que también necesitan análisis
}

/**
 * Analizador de plantillas Liquid para detectar dependencias de datos
 */
export class TemplateAnalyzer {
  private static instance: TemplateAnalyzer

  // Regex patterns para detectar objetos Liquid
  private readonly LIQUID_OBJECT_PATTERNS = {
    products: /\{\{\s*products\s*[\|\}]/g,
    collection_products: /collections\.([a-zA-Z0-9_-]+)\.products/g,
    collections: /\{\{\s*collections\s*[\|\}]/g,
    product: /\{\{\s*product\./g,
    collection: /\{\{\s*collection\./g,
    cart: /\{\{\s*cart\./g,
    linklists: /\{\{\s*linklists\./g,
    shop: /\{\{\s*shop\./g,
    page: /\{\{\s*page\./g,
    blog: /\{\{\s*blog\./g,
  }

  // Patterns para detectar tags especiales
  private readonly TAG_PATTERNS = {
    paginate: /\{\%\s*paginate\s+([^%]+)\%\}/g,
    section: /\{\%\s*section\s+['"]([^'"]+)['"]\s*\%\}/g,
    render: /\{\%\s*render\s+['"]([^'"]+)['"]/g,
    include: /\{\%\s*include\s+['"]([^'"]+)['"]/g,
  }

  private constructor() {}

  public static getInstance(): TemplateAnalyzer {
    if (!TemplateAnalyzer.instance) {
      TemplateAnalyzer.instance = new TemplateAnalyzer()
    }
    return TemplateAnalyzer.instance
  }

  /**
   * Analiza una plantilla y detecta qué datos necesita
   */
  public analyzeTemplate(templateContent: string, templatePath: string): TemplateAnalysis {
    const analysis: TemplateAnalysis = {
      requiredData: new Map(),
      hasPagination: false,
      usedSections: [],
      liquidObjects: [],
      dependencies: [],
    }

    try {
      // Detectar objetos Liquid básicos
      this.detectLiquidObjects(templateContent, analysis)

      // Detectar paginación
      this.detectPagination(templateContent, analysis)

      // Detectar secciones y snippets
      this.detectDependencies(templateContent, analysis)

      // Inferir datos adicionales basados en el tipo de plantilla
      this.inferDataFromTemplatePath(templatePath, analysis)

      logger.debug(
        `Template analysis for ${templatePath}:`,
        {
          requiredData: Array.from(analysis.requiredData.keys()),
          dependencies: analysis.dependencies,
        },
        'TemplateAnalyzer'
      )
    } catch (error) {
      logger.error('Error analyzing template', error, 'TemplateAnalyzer')
    }

    return analysis
  }

  /**
   * Analiza múltiples plantillas (layout + página + secciones)
   */
  public async analyzeTemplateSet(
    storeId: string,
    templates: { layout: string; page: string; sections: Record<string, string> },
    templatePaths: { layout: string; page: string }
  ): Promise<TemplateAnalysis> {
    const combinedAnalysis: TemplateAnalysis = {
      requiredData: new Map(),
      hasPagination: false,
      usedSections: [],
      liquidObjects: [],
      dependencies: [],
    }

    // Analizar layout
    const layoutAnalysis = this.analyzeTemplate(templates.layout, templatePaths.layout)
    this.mergeAnalysis(combinedAnalysis, layoutAnalysis)

    // Analizar plantilla de página
    const pageAnalysis = this.analyzeTemplate(templates.page, templatePaths.page)
    this.mergeAnalysis(combinedAnalysis, pageAnalysis)

    // Analizar secciones
    for (const [sectionName, sectionContent] of Object.entries(templates.sections)) {
      const sectionAnalysis = this.analyzeTemplate(sectionContent, `sections/${sectionName}.liquid`)
      this.mergeAnalysis(combinedAnalysis, sectionAnalysis)
    }

    return combinedAnalysis
  }

  /**
   * Detecta objetos Liquid en el contenido
   */
  private detectLiquidObjects(content: string, analysis: TemplateAnalysis): void {
    for (const [objectType, pattern] of Object.entries(this.LIQUID_OBJECT_PATTERNS)) {
      const matches = content.match(pattern)
      if (matches && matches.length > 0) {
        analysis.liquidObjects.push(objectType)

        // Determinar opciones de carga según el contexto
        const loadOptions = this.determineLoadOptions(objectType as DataRequirement, content)
        analysis.requiredData.set(objectType as DataRequirement, loadOptions)
      }
    }
  }

  /**
   * Detecta paginación en el contenido
   */
  private detectPagination(content: string, analysis: TemplateAnalysis): void {
    const paginateMatches = content.match(this.TAG_PATTERNS.paginate)
    if (paginateMatches && paginateMatches.length > 0) {
      analysis.hasPagination = true

      // Extraer qué se está paginando
      for (const match of paginateMatches) {
        const paginateContent = match.match(/paginate\s+([^\s]+)\s+by\s+(\d+)/i)
        if (paginateContent) {
          const paginatedObject = paginateContent[1]
          const limit = parseInt(paginateContent[2], 10)

          // Agregar el objeto paginado a los requerimientos
          if (paginatedObject.includes('products')) {
            analysis.requiredData.set('products', { limit })
          } else if (paginatedObject.includes('collections')) {
            analysis.requiredData.set('collections', { limit })
          }
        }
      }
    }
  }

  /**
   * Detecta dependencias (secciones y snippets)
   */
  private detectDependencies(content: string, analysis: TemplateAnalysis): void {
    // Detectar secciones
    const sectionMatches = content.match(this.TAG_PATTERNS.section)
    if (sectionMatches) {
      for (const match of sectionMatches) {
        const sectionNameMatch = match.match(/section\s+['"]([^'"]+)['"]/i)
        if (sectionNameMatch) {
          analysis.usedSections.push(sectionNameMatch[1])
          analysis.dependencies.push(`sections/${sectionNameMatch[1]}.liquid`)
        }
      }
    }

    // Detectar snippets (render/include)
    const renderMatches = content.match(this.TAG_PATTERNS.render) || []
    const includeMatches = content.match(this.TAG_PATTERNS.include) || []

    for (const match of [...renderMatches, ...includeMatches]) {
      const snippetNameMatch = match.match(/(?:render|include)\s+['"]([^'"]+)['"]/i)
      if (snippetNameMatch) {
        analysis.dependencies.push(`snippets/${snippetNameMatch[1]}.liquid`)
      }
    }
  }

  /**
   * Determina opciones de carga según el contexto del objeto
   */
  private determineLoadOptions(objectType: DataRequirement, content: string): DataLoadOptions {
    const options: DataLoadOptions = {}

    switch (objectType) {
      case 'products':
        // Buscar límites explícitos en filtros
        const limitMatch = content.match(/products[^}]*limit:\s*(\d+)/i)
        if (limitMatch) {
          options.limit = parseInt(limitMatch[1], 10)
        } else {
          options.limit = 20
        }
        break

      case 'collection_products':
        // Extraer el nombre de la colección y el límite
        const collectionMatch = content.match(
          /collections\.([a-zA-Z0-9_-]+)\.products[^}]*limit:\s*(\d+)/i
        )
        if (collectionMatch) {
          options.collectionHandle = collectionMatch[1]
          options.limit = parseInt(collectionMatch[2], 10)
        } else {
          // Buscar sin límite explícito
          const collectionOnlyMatch = content.match(/collections\.([a-zA-Z0-9_-]+)\.products/i)
          if (collectionOnlyMatch) {
            options.collectionHandle = collectionOnlyMatch[1]
            options.limit = 8 // Default para productos de colección
          }
        }
        break

      case 'collections':
        const collectionLimitMatch = content.match(/collections[^}]*limit:\s*(\d+)/i)
        if (collectionLimitMatch) {
          options.limit = parseInt(collectionLimitMatch[1], 10)
        } else {
          options.limit = 10
        }
        break

      case 'product':
      case 'collection':
        // Para objetos individuales, el handle/id se determinará en runtime
        break

      default:
        break
    }

    return options
  }

  /**
   * Infiere datos adicionales basado en el path de la plantilla
   */
  private inferDataFromTemplatePath(templatePath: string, analysis: TemplateAnalysis): void {
    if (templatePath.includes('index')) {
      // Homepage típicamente necesita colecciones (pero no asumimos cuáles)
      if (!analysis.requiredData.has('collections')) {
        analysis.requiredData.set('collections', { limit: 6 })
      }
    } else if (templatePath.includes('product')) {
      // Página de producto necesita el objeto product
      analysis.requiredData.set('product', {})
    } else if (templatePath.includes('collection')) {
      // Página de colección necesita el objeto collection
      analysis.requiredData.set('collection', {})
    } else if (templatePath.includes('cart')) {
      // Página de carrito necesita datos del carrito
      analysis.requiredData.set('cart', {})
    }

    // El carrito siempre es necesario para el header
    if (!analysis.requiredData.has('cart')) {
      analysis.requiredData.set('cart', {})
    }

    // Los linklists siempre son necesarios para navegación
    if (!analysis.requiredData.has('linklists')) {
      analysis.requiredData.set('linklists', {})
    }

    // Shop/store info siempre es necesaria
    if (!analysis.requiredData.has('shop')) {
      analysis.requiredData.set('shop', {})
    }
  }

  /**
   * Combina dos análisis en uno
   */
  private mergeAnalysis(target: TemplateAnalysis, source: TemplateAnalysis): void {
    // Combinar datos requeridos
    for (const [dataType, options] of source.requiredData) {
      if (!target.requiredData.has(dataType)) {
        target.requiredData.set(dataType, options)
      } else {
        // Merge options (usar el límite más alto, etc.)
        const existingOptions = target.requiredData.get(dataType)!
        const mergedOptions = {
          ...existingOptions,
          ...options,
          limit: Math.max(existingOptions.limit || 0, options.limit || 0),
        }
        target.requiredData.set(dataType, mergedOptions)
      }
    }

    // Combinar otras propiedades
    target.hasPagination = target.hasPagination || source.hasPagination
    target.usedSections = [...new Set([...target.usedSections, ...source.usedSections])]
    target.liquidObjects = [...new Set([...target.liquidObjects, ...source.liquidObjects])]
    target.dependencies = [...new Set([...target.dependencies, ...source.dependencies])]
  }
}

export const templateAnalyzer = TemplateAnalyzer.getInstance()
