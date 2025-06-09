import { Tag, TagToken, Context, TopLevelToken, Liquid, TokenKind } from 'liquidjs'

/**
 * Custom Paginate Tag para manejar {% paginate array by limit %} en LiquidJS
 * Simplificado para compatibilidad con LiquidJS API
 */
export class PaginateTag extends Tag {
  private arrayPath!: string
  private limit!: number
  private templateContent: string = ''

  constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(tagToken, remainTokens, liquid)
    this.parseArguments(tagToken)
    this.parseTemplateContent(remainTokens)
  }

  private parseArguments(tagToken: TagToken): void {
    const args = tagToken.args?.trim() || ''
    const match = args.match(/^(.+?)\s+by\s+(\d+)$/)

    if (!match) {
      throw new Error(`Invalid paginate syntax: ${args}. Expected: "array by limit"`)
    }

    this.arrayPath = match[1].trim()
    this.limit = Math.max(1, Math.min(50, parseInt(match[2])))
  }

  private parseTemplateContent(remainTokens: TopLevelToken[]): void {
    const contentTokens: string[] = []
    let closed = false

    while (remainTokens.length) {
      const token = remainTokens.shift()
      if (!token) break

      if (token.kind === TokenKind.Tag && (token as any).name === 'endpaginate') {
        closed = true
        break
      }

      if (token.kind === TokenKind.HTML) {
        // Acceder correctamente al contenido HTML usando begin y end
        const htmlToken = token as any
        const tokenContent = htmlToken.input
          ? htmlToken.input.substring(htmlToken.begin, htmlToken.end)
          : ''
        contentTokens.push(tokenContent)
      } else if (token.kind === TokenKind.Output) {
        const outputToken = token as any
        const tokenContent = outputToken.content || outputToken.value || ''
        contentTokens.push(`{{ ${tokenContent} }}`)
      } else if (token.kind === TokenKind.Tag) {
        const tagToken = token as any
        const tokenContent = tagToken.content || tagToken.value || ''
        contentTokens.push(`{% ${tokenContent} %}`)
      }
    }

    if (!closed) {
      throw new Error('tag {% paginate %} not closed')
    }

    this.templateContent = contentTokens.join('')
  }

  *render(ctx: Context, emitter: any): Generator<any, void, unknown> {
    // Obtener array del contexto usando el path
    const array = this.getNestedValue(ctx, this.arrayPath)
    if (!Array.isArray(array)) {
      return
    }

    const currentPage = 1 // Simplificado por ahora
    const totalPages = Math.ceil(array.length / this.limit)
    const startIndex = (currentPage - 1) * this.limit
    const endIndex = Math.min(startIndex + this.limit, array.length)

    // Crear slice paginado del array
    const paginatedArray = array.slice(startIndex, endIndex)

    // Crear objeto paginate
    const paginateObj = {
      paginate: {
        current_page: currentPage,
        pages: totalPages,
        items: array.length,
        parts: [{ title: 1, is_link: false }],
      },
    }

    // SIMPLIFICADO: Por ahora solo mostramos el contenido estático sin procesar
    // TODO: Implementar rendering completo sin bucle infinito
    emitter.write(`
    <div class="paginate-wrapper">
      <p>Paginación: ${paginatedArray.length} de ${array.length} elementos (página ${currentPage} de ${totalPages})</p>
      <div class="paginated-content">
        ${this.templateContent}
      </div>
      <div class="pagination-info">
        <span>Página ${currentPage} de ${totalPages}</span>
      </div>
    </div>
    `)
  }

  private getNestedValue(ctx: Context, path: string): unknown {
    const parts = path.split('.')
    let current: any = ctx.getAll()
    for (const part of parts) {
      current = current?.[part]
    }
    return current
  }

  private createPaginateObject(
    currentPage: number,
    totalPages: number,
    limit: number,
    totalItems: number,
    windowSize: number
  ) {
    const parts = this.generatePaginationParts(currentPage, totalPages, windowSize)

    return {
      paginate: {
        current_page: currentPage,
        current_offset: (currentPage - 1) * limit,
        items: totalItems,
        parts: parts,
        pages: totalPages,

        // Enlaces de navegación
        previous:
          currentPage > 1
            ? {
                title: currentPage - 1,
                url: this.generatePageUrl(currentPage - 1),
                is_link: true,
              }
            : null,

        next:
          currentPage < totalPages
            ? {
                title: currentPage + 1,
                url: this.generatePageUrl(currentPage + 1),
                is_link: true,
              }
            : null,

        // Métodos de utilidad
        first: {
          title: 1,
          url: this.generatePageUrl(1),
          is_link: currentPage !== 1,
        },

        last: {
          title: totalPages,
          url: this.generatePageUrl(totalPages),
          is_link: currentPage !== totalPages,
        },
      },
    }
  }

  private generatePaginationParts(currentPage: number, totalPages: number, windowSize: number) {
    const parts = []

    // Calcular rango de páginas a mostrar
    const halfWindow = Math.floor(windowSize / 2)
    let startPage = Math.max(1, currentPage - halfWindow)
    let endPage = Math.min(totalPages, currentPage + halfWindow)

    // Ajustar si estamos cerca del inicio o final
    if (endPage - startPage + 1 < windowSize) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + windowSize - 1)
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - windowSize + 1)
      }
    }

    // Agregar primera página y ellipsis si es necesario
    if (startPage > 1) {
      parts.push({
        title: 1,
        url: this.generatePageUrl(1),
        is_link: true,
      })

      if (startPage > 2) {
        parts.push({
          title: '…',
          url: null,
          is_link: false,
        })
      }
    }

    // Agregar páginas del rango principal
    for (let i = startPage; i <= endPage; i++) {
      parts.push({
        title: i,
        url: i === currentPage ? null : this.generatePageUrl(i),
        is_link: i !== currentPage,
      })
    }

    // Agregar ellipsis y última página si es necesario
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        parts.push({
          title: '…',
          url: null,
          is_link: false,
        })
      }

      parts.push({
        title: totalPages,
        url: this.generatePageUrl(totalPages),
        is_link: true,
      })
    }

    return parts
  }

  private generatePageUrl(page: number): string {
    // En un entorno real, esto generaría la URL correcta con parámetros
    // Por ahora, retornamos una URL básica
    return page === 1 ? '?' : `?page=${page}`
  }
}
