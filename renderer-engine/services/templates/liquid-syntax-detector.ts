import type {
  TemplateAnalysis,
  DataRequirement,
  DataLoadOptions,
} from '@/renderer-engine/services/templates/template-analyzer'

/**
 * Tipo para detectores de objetos Liquid
 */
type ObjectDetector = {
  pattern: RegExp
  optionsExtractor: (content: string) => DataLoadOptions
}

/**
 * Tipo para detectores de paginación
 */
type PaginationHandler = (match: string, analysis: TemplateAnalysis) => void

/**
 * Extractores de opciones declarativos para cada tipo de datos
 */
const loadOptionsExtractors: Record<
  DataRequirement,
  (content: string) => DataLoadOptions
> = {
  products: (content: string) => {
    const limitMatch = content.match(/products[^}]*limit:\s*(\d+)/i)
    return {
      limit: limitMatch ? parseInt(limitMatch[1], 10) : 20,
    }
  },

  collection_products: (content: string) => {
    const collectionMatch = content.match(
      /collections\.([a-zA-Z0-9_-]+)\.products[^}]*limit:\s*(\d+)/i
    )
    if (collectionMatch) {
      return {
        collectionHandle: collectionMatch[1],
        limit: parseInt(collectionMatch[2], 10),
      }
    }

    const collectionOnlyMatch = content.match(/collections\.([a-zA-Z0-9_-]+)\.products/i)
    return collectionOnlyMatch
      ? { collectionHandle: collectionOnlyMatch[1], limit: 8 }
      : { limit: 8 }
  },

  collections: (content: string) => {
    const limitMatch = content.match(/collections[^}]*limit:\s*(\d+)/i)
    return {
      limit: limitMatch ? parseInt(limitMatch[1], 10) : 10,
    }
  },

  product: () => ({}),
  collection: () => ({}),
  cart: () => ({}),
  linklists: () => ({}),
  shop: () => ({}),
  page: () => ({}),
  blog: () => ({}),
  pagination: () => ({}),
}

/**
 * Detectores de objetos Liquid declarativos
 */
const objectDetectors: Record<DataRequirement, ObjectDetector> = {
  products: {
    pattern: /\{\{\s*products\s*[\|\}]/g,
    optionsExtractor: loadOptionsExtractors.products,
  },
  collection_products: {
    pattern: /collections\.([a-zA-Z0-9_-]+)\.products/g,
    optionsExtractor: loadOptionsExtractors.collection_products,
  },
  collections: {
    pattern: /\{\{\s*collections\s*[\|\}]/g,
    optionsExtractor: loadOptionsExtractors.collections,
  },
  product: {
    pattern: /\{\{\s*product\./g,
    optionsExtractor: loadOptionsExtractors.product,
  },
  collection: {
    pattern: /\{\{\s*collection\./g,
    optionsExtractor: loadOptionsExtractors.collection,
  },
  cart: {
    pattern: /\{\{\s*cart\./g,
    optionsExtractor: loadOptionsExtractors.cart,
  },
  linklists: {
    pattern: /\{\{\s*linklists\./g,
    optionsExtractor: loadOptionsExtractors.linklists,
  },
  shop: {
    pattern: /\{\{\s*shop\./g,
    optionsExtractor: loadOptionsExtractors.shop,
  },
  page: {
    pattern: /\{\{\s*page\./g,
    optionsExtractor: loadOptionsExtractors.page,
  },
  blog: {
    pattern: /\{\{\s*blog\./g,
    optionsExtractor: loadOptionsExtractors.blog,
  },
  pagination: {
    pattern: /\{\%\s*paginate/g,
    optionsExtractor: loadOptionsExtractors.pagination,
  },
}

/**
 * Handlers para diferentes tipos de paginación
 */
const paginationHandlers: Record<string, PaginationHandler> = {
  'collection.products': (match: string, analysis: TemplateAnalysis) => {
    const limitMatch = match.match(/by\s+(\d+)/i)
    const limit = limitMatch ? parseInt(limitMatch[1], 10) : 20
    analysis.requiredData.set('collection', { limit })
  },

  products: (match: string, analysis: TemplateAnalysis) => {
    const limitMatch = match.match(/by\s+(\d+)/i)
    const limit = limitMatch ? parseInt(limitMatch[1], 10) : 20
    analysis.requiredData.set('products', { limit })
  },

  collections: (match: string, analysis: TemplateAnalysis) => {
    const limitMatch = match.match(/by\s+(\d+)/i)
    const limit = limitMatch ? parseInt(limitMatch[1], 10) : 10
    analysis.requiredData.set('collections', { limit })
  },
}

export class LiquidSyntaxDetector {
  private static readonly TAG_PATTERNS = {
    paginate: /\{\%\s*paginate\s+([^%]+)\%\}/g,
    section: /\{\%\s*section\s+['"]([^'"]+)['"]\s*\%\}/g,
    render: /\{\%\s*render\s+['"]([^'"]+)['"]/g,
    include: /\{\%\s*include\s+['"]([^'"]+)['"]/g,
  }

  public static detectLiquidObjects(content: string, analysis: TemplateAnalysis): void {
    for (const [objectType, detector] of Object.entries(objectDetectors)) {
      const matches = content.match(detector.pattern)
      if (matches && matches.length > 0) {
        analysis.liquidObjects.push(objectType)
        const loadOptions = detector.optionsExtractor(content)
        analysis.requiredData.set(objectType as DataRequirement, loadOptions)
      }
    }
  }

  public static detectPagination(content: string, analysis: TemplateAnalysis): void {
    const paginateMatches = content.match(this.TAG_PATTERNS.paginate)
    if (!paginateMatches?.length) return

    analysis.hasPagination = true

    for (const match of paginateMatches) {
      const paginateContent = match.match(/paginate\s+([^\s]+)\s+by\s+(\d+)/i)
      if (!paginateContent) continue

      const paginatedObject = paginateContent[1]

      // Buscar handler específico para el tipo de objeto paginado
      const handlerKey = Object.keys(paginationHandlers).find(key =>
        paginatedObject.includes(key)
      )

      if (handlerKey) {
        paginationHandlers[handlerKey](match, analysis)
      }
    }
  }

  public static detectDependencies(content: string, analysis: TemplateAnalysis): void {
    // Detectar secciones
    this.extractMatches(content, this.TAG_PATTERNS.section, match => {
      const sectionName = this.extractName(match, /section\s+['"]([^'"]+)['"]/i)
      if (sectionName) {
        analysis.usedSections.push(sectionName)
        analysis.dependencies.push(`sections/${sectionName}.liquid`)
      }
    })

    // Detectar snippets (render e include)
    const snippetPatterns = [this.TAG_PATTERNS.render, this.TAG_PATTERNS.include]
    for (const pattern of snippetPatterns) {
      this.extractMatches(content, pattern, match => {
        const snippetName = this.extractName(
          match,
          /(?:render|include)\s+['"]([^'"]+)['"]/i
        )
        if (snippetName) {
          analysis.dependencies.push(`snippets/${snippetName}.liquid`)
        }
      })
    }
  }

  /**
   * Utilidad para extraer matches y procesarlos
   */
  private static extractMatches(
    content: string,
    pattern: RegExp,
    processor: (match: string) => void
  ): void {
    const matches = content.match(pattern)
    if (matches) {
      matches.forEach(processor)
    }
  }

  /**
   * Utilidad para extraer nombres de matches
   */
  private static extractName(match: string, pattern: RegExp): string | null {
    const nameMatch = match.match(pattern)
    return nameMatch ? nameMatch[1] : null
  }
}
