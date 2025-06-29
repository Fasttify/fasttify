import type {
  TemplateAnalysis,
  DataRequirement,
  DataLoadOptions,
} from './template-analyzer'
import { logger } from '@/renderer-engine/lib/logger'

export class LiquidSyntaxDetector {
  private static readonly LIQUID_OBJECT_PATTERNS = {
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

  private static readonly TAG_PATTERNS = {
    paginate: /\{\%\s*paginate\s+([^%]+)\%\}/g,
    section: /\{\%\s*section\s+['"]([^'"]+)['"]\s*\%\}/g,
    render: /\{\%\s*render\s+['"]([^'"]+)['"]/g,
    include: /\{\%\s*include\s+['"]([^'"]+)['"]/g,
  }

  public static detectLiquidObjects(content: string, analysis: TemplateAnalysis): void {
    for (const [objectType, pattern] of Object.entries(this.LIQUID_OBJECT_PATTERNS)) {
      const matches = content.match(pattern)
      if (matches && matches.length > 0) {
        analysis.liquidObjects.push(objectType)
        const loadOptions = this.determineLoadOptions(
          objectType as DataRequirement,
          content
        )
        analysis.requiredData.set(objectType as DataRequirement, loadOptions)
      }
    }
  }

  public static detectPagination(content: string, analysis: TemplateAnalysis): void {
    const paginateMatches = content.match(this.TAG_PATTERNS.paginate)
    if (paginateMatches && paginateMatches.length > 0) {
      analysis.hasPagination = true
      for (const match of paginateMatches) {
        const paginateContent = match.match(/paginate\s+([^\s]+)\s+by\s+(\d+)/i)
        if (paginateContent) {
          const paginatedObject = paginateContent[1]
          const limit = parseInt(paginateContent[2], 10)

          if (paginatedObject.includes('collection.products')) {
            analysis.requiredData.set('collection', { limit })
          } else if (paginatedObject.includes('products')) {
            analysis.requiredData.set('products', { limit })
          } else if (paginatedObject.includes('collections')) {
            analysis.requiredData.set('collections', { limit })
          }
        }
      }
    }
  }

  public static detectDependencies(content: string, analysis: TemplateAnalysis): void {
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

    const renderMatches = content.match(this.TAG_PATTERNS.render) || []
    const includeMatches = content.match(this.TAG_PATTERNS.include) || []

    for (const match of [...renderMatches, ...includeMatches]) {
      const snippetNameMatch = match.match(/(?:render|include)\s+['"]([^'"]+)['"]/i)
      if (snippetNameMatch) {
        analysis.dependencies.push(`snippets/${snippetNameMatch[1]}.liquid`)
      }
    }
  }

  private static determineLoadOptions(
    objectType: DataRequirement,
    content: string
  ): DataLoadOptions {
    const options: DataLoadOptions = {}
    switch (objectType) {
      case 'products':
        const limitMatch = content.match(/products[^}]*limit:\s*(\d+)/i)
        if (limitMatch) {
          options.limit = parseInt(limitMatch[1], 10)
        } else {
          options.limit = 20
        }
        break
      case 'collection_products':
        const collectionMatch = content.match(
          /collections\.([a-zA-Z0-9_-]+)\.products[^}]*limit:\s*(\d+)/i
        )
        if (collectionMatch) {
          options.collectionHandle = collectionMatch[1]
          options.limit = parseInt(collectionMatch[2], 10)
        } else {
          const collectionOnlyMatch = content.match(
            /collections\.([a-zA-Z0-9_-]+)\.products/i
          )
          if (collectionOnlyMatch) {
            options.collectionHandle = collectionOnlyMatch[1]
            options.limit = 8
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
        break
      default:
        break
    }
    return options
  }
}
