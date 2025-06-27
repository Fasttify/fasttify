import {
  Tag,
  TopLevelToken,
  Liquid,
  Context,
  Value,
  TagToken,
  Emitter,
  TokenKind,
} from 'liquidjs'
import { productFetcher } from '@/renderer-engine/services/fetchers/product-fetcher'
import { collectionFetcher } from '@/renderer-engine/services/fetchers/collection-fetcher'
import { logger } from '@/renderer-engine/lib/logger'
import type { PaginationContext } from '@/renderer-engine/types'

/**
 * Custom Paginate Tag para Shopify Liquid.
 * Extensible para manejar diferentes tipos de datos (productos, artículos, etc.).
 */
export class PaginateTag extends Tag {
  private collectionExpression: string
  private pageSizeExpression: Value
  private templateContent: string = ''

  constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(tagToken, remainTokens, liquid)
    const args = tagToken.args.trim()
    const match = args.match(/^(.+?)\s+by\s+(.+)$/i)
    if (!match) {
      throw new Error(`Invalid paginate syntax. Use: {% paginate items by number %}`)
    }
    this.collectionExpression = match[1].trim()
    this.pageSizeExpression = new Value(match[2].trim(), liquid)
    this.parseContent(remainTokens)
  }

  private parseContent(remainTokens: TopLevelToken[]): void {
    const contentTokens: string[] = []
    let closed = false
    while (remainTokens.length > 0) {
      const token = remainTokens.shift()!
      if (token.kind === TokenKind.Tag && (token as TagToken).name === 'endpaginate') {
        closed = true
        break
      }
      contentTokens.push(token.getText())
    }
    if (!closed) throw new Error('tag {% paginate %} not closed')
    this.templateContent = contentTokens.join('')
  }

  private *fetchData(
    ctx: Context,
    pageSize: number,
    token: string | undefined
  ): Generator<
    unknown,
    { items: any[]; nextToken?: string; parentObject: any; childKey: string },
    unknown
  > {
    const expressionParts = this.collectionExpression.split('.')
    const parentPath = expressionParts[0]
    const childKey = expressionParts.length > 1 ? expressionParts.pop()! : parentPath
    const parentObject = ctx.getSync([parentPath]) as any

    // Caso 1: Productos de una colección específica (collection.products)
    if (childKey === 'products' && parentObject?.id) {
      const { products, nextToken } = (yield productFetcher.getProductsByCollection(
        parentObject.storeId,
        parentObject.id,
        { limit: pageSize, nextToken: token }
      )) as { products: any[]; nextToken?: string }
      return { items: products, nextToken, parentObject, childKey }
    }
    // Caso 2: Todos los productos de la tienda (products)
    else if (childKey === 'products' && !parentObject?.id) {
      // Obtener el storeId del contexto global
      const storeId = ctx.getSync(['store', 'id']) || ctx.getSync(['storeId'])
      if (!storeId) {
        logger.error(
          'No storeId found in context for products pagination',
          undefined,
          'PaginateTag'
        )
        return { items: [], parentObject: {}, childKey }
      }

      const { products, nextToken } = (yield productFetcher.getStoreProducts(
        storeId as string,
        {
          limit: pageSize,
          nextToken: token,
        }
      )) as { products: any[]; nextToken?: string }

      return { items: products, nextToken, parentObject: { storeId }, childKey }
    }
    // Caso 3: Colecciones de la tienda (collections)
    else if (childKey === 'collections' && parentObject?.storeId) {
      const collections = (yield collectionFetcher.getStoreCollections(
        parentObject.storeId,
        {
          limit: pageSize,
          nextToken: token,
        }
      )) as any[]
      // La API de getStoreCollections no devuelve un nextToken directamente,
      // así que asumimos que no hay más páginas si devuelve menos de `pageSize` items.
      const nextToken = collections.length === pageSize ? 'has_more' : undefined
      return { items: collections, nextToken, parentObject, childKey }
    }

    // Futuro: Añadir casos para 'blog.articles', 'search.results', etc.
    // else if (childKey === 'articles' && parentObject?.id) { ... }

    logger.warn(
      `Pagination not implemented for '${this.collectionExpression}'`,
      undefined,
      'PaginateTag'
    )
    return { items: [], parentObject, childKey }
  }

  public *render(ctx: Context, emitter: Emitter): Generator<unknown, void, unknown> {
    try {
      const pageSize = ((yield this.pageSizeExpression.value(ctx, false)) as number) || 20
      const currentToken = String(ctx.getSync(['current_token']) || '')
      const previousToken = String(ctx.getSync(['previous_token']) || '')

      const { items, nextToken, parentObject, childKey } = yield* this.fetchData(
        ctx,
        pageSize,
        currentToken
      )

      const pagination: Omit<
        PaginationContext,
        'parts' | 'total_items' | 'total_pages' | 'current_offset'
      > = {
        current_page: 1,
        items_per_page: pageSize,
        previous: previousToken
          ? { title: 'Anterior', url: this.generatePageUrl(previousToken) }
          : undefined,
        next: nextToken
          ? { title: 'Siguiente', url: this.generatePageUrl(nextToken, currentToken) }
          : undefined,
      }

      const newParentObject = { ...parentObject, [childKey]: items }
      const scope = {
        paginate: pagination,
        [this.collectionExpression.split('.')[0]]: newParentObject,
      }

      ctx.push(scope)
      const templates = this.liquid.parse(this.templateContent)
      yield this.liquid.renderer.renderTemplates(templates, ctx, emitter)
      ctx.pop()
    } catch (error) {
      logger.error('Error in paginate tag', error, 'PaginateTag')
    }
  }

  private generatePageUrl(token: string, previous?: string): string {
    const params = new URLSearchParams()
    if (token) params.set('token', token)
    if (previous) params.set('previous_token', previous)
    return `?${params.toString()}`
  }
}
