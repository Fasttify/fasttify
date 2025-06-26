import { Tag, TagToken, Context, TopLevelToken, Liquid } from 'liquidjs'

/**
 * Tag Paginate que solo modifica el contexto sin consumir contenido
 * Funciona como un modificador de datos transparente
 */
export class PaginateTag extends Tag {
  private arrayPath: string
  private limit: number

  constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(tagToken, remainTokens, liquid)

    // Parsear argumentos
    const args = tagToken.args?.trim() || ''
    const match = args.match(/^(.+?)\s+by\s+(\d+)$/)

    if (!match) {
      throw new Error(`Invalid paginate syntax. Expected: "array by number"`)
    }

    this.arrayPath = match[1].trim()
    this.limit = parseInt(match[2]) || 12

    // NO consumir tokens - dejar que el contenido se renderice normalmente
  }

  *render(ctx: Context, emitter: any): Generator<any, void, unknown> {
    // Obtener array del contexto
    const contextData = ctx.getAll() as any
    let targetArray = contextData

    // Navegar por el path (ej: collection.products)
    const pathParts = this.arrayPath.split('.')
    for (const part of pathParts) {
      targetArray = targetArray?.[part]
    }

    if (!Array.isArray(targetArray)) {
      return // No hay array válido, no hacer nada
    }

    // Calcular paginación - obtener número de página del contexto o URL
    let currentPage = 1
    const pageFromContext = contextData.page || contextData.current_page
    if (pageFromContext) {
      currentPage = parseInt(String(pageFromContext)) || 1
    }

    const totalItems = targetArray.length
    const totalPages = Math.ceil(totalItems / this.limit)
    const startIndex = (currentPage - 1) * this.limit
    const endIndex = Math.min(startIndex + this.limit, totalItems)

    // Crear array paginado
    const paginatedItems = targetArray.slice(startIndex, endIndex)

    // Actualizar el array en el contexto original
    let contextTarget = contextData
    for (let i = 0; i < pathParts.length - 1; i++) {
      contextTarget = contextTarget[pathParts[i]]
    }
    contextTarget[pathParts[pathParts.length - 1]] = paginatedItems

    // Obtener parámetros de query existentes para preservarlos
    const existingQueryParams = this.getExistingQueryParams(contextData)

    // Crear objeto paginate COMPLETO con propiedad parts
    contextData.paginate = {
      current_page: currentPage,
      current_offset: startIndex,
      items: totalItems,
      pages: totalPages,
      previous:
        currentPage > 1
          ? {
              url: this.buildPaginationUrl(currentPage - 1, existingQueryParams),
              title: '← Anterior',
            }
          : null,
      next:
        currentPage < totalPages
          ? {
              url: this.buildPaginationUrl(currentPage + 1, existingQueryParams),
              title: 'Siguiente →',
            }
          : null,
      parts: this.generatePaginationParts(currentPage, totalPages, existingQueryParams),
    }
  }

  /**
   * Obtiene los parámetros de query existentes del contexto
   */
  private getExistingQueryParams(contextData: any): URLSearchParams {
    const params = new URLSearchParams()

    // Preservar sort_by si existe
    if (contextData.collection?.sort_by && contextData.collection.sort_by !== 'manual') {
      params.set('sort_by', contextData.collection.sort_by)
    }

    // Preservar otros parámetros comunes si existen
    if (contextData.q || contextData.query) {
      params.set('q', contextData.q || contextData.query)
    }

    return params
  }

  /**
   * Construye una URL de paginación preservando otros parámetros
   */
  private buildPaginationUrl(page: number, existingParams: URLSearchParams): string {
    const params = new URLSearchParams(existingParams.toString())

    if (page > 1) {
      params.set('page', page.toString())
    } else {
      params.delete('page') // No mostrar page=1 en la URL
    }

    const queryString = params.toString()
    return queryString ? `?${queryString}` : ''
  }

  /**
   * Genera las partes de paginación para el filtro default_pagination
   * Algoritmo mejorado similar a Shopify
   */
  private generatePaginationParts(
    currentPage: number,
    totalPages: number,
    existingParams: URLSearchParams
  ) {
    const parts: Array<{
      title: string
      url: string
      is_link: boolean
    }> = []

    if (totalPages <= 1) {
      return parts
    }

    // Configuración
    const WINDOW_SIZE = 2 // Páginas a mostrar a cada lado de la actual
    const EDGE_COUNT = 1 // Páginas a mostrar al inicio y final

    // Calcular rangos
    const leftEdge = EDGE_COUNT
    const rightEdge = totalPages - EDGE_COUNT + 1
    const windowStart = Math.max(leftEdge + 1, currentPage - WINDOW_SIZE)
    const windowEnd = Math.min(rightEdge - 1, currentPage + WINDOW_SIZE)

    // Primera(s) página(s)
    for (let i = 1; i <= Math.min(leftEdge, totalPages); i++) {
      parts.push({
        title: i.toString(),
        url: this.buildPaginationUrl(i, existingParams),
        is_link: i !== currentPage,
      })
    }

    // Ellipsis izquierda
    if (windowStart > leftEdge + 1) {
      parts.push({
        title: '…',
        url: '',
        is_link: false,
      })
    }

    // Ventana central
    for (let i = windowStart; i <= windowEnd; i++) {
      if (i > leftEdge && i < rightEdge) {
        parts.push({
          title: i.toString(),
          url: this.buildPaginationUrl(i, existingParams),
          is_link: i !== currentPage,
        })
      }
    }

    // Ellipsis derecha
    if (windowEnd < rightEdge - 1) {
      parts.push({
        title: '…',
        url: '',
        is_link: false,
      })
    }

    // Última(s) página(s)
    for (let i = Math.max(rightEdge, leftEdge + 1); i <= totalPages; i++) {
      parts.push({
        title: i.toString(),
        url: this.buildPaginationUrl(i, existingParams),
        is_link: i !== currentPage,
      })
    }

    return parts
  }
}

/**
 * Tag EndPaginate - no hace nada, solo marca el final del bloque
 */
export class EndPaginateTag extends Tag {
  constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(tagToken, remainTokens, liquid)
  }

  *render(ctx: Context, emitter: any): Generator<any, void, unknown> {
    // No hacer nada - solo es un marcador de fin
  }
}
