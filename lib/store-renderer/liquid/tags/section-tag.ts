import { Tag, TagToken, Context, TopLevelToken, Liquid } from 'liquidjs'

/**
 * Custom Section Tag para manejar {% section 'section-name' %} en LiquidJS
 * Este tag replica la funcionalidad de Shopify para incluir secciones
 */
export class SectionTag extends Tag {
  private sectionName: string = ''

  constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(tagToken, remainTokens, liquid)

    // Parsear el nombre de la sección del token
    this.parseSectionName(tagToken)
  }

  private parseSectionName(tagToken: TagToken): void {
    // El token viene como: {% section 'section-name' %}
    // Necesitamos extraer el nombre de la sección
    const args = tagToken.args?.trim() || ''

    if (!args) {
      throw new Error('Section tag requires a section name')
    }

    // Buscar texto entre comillas simples o dobles
    const quotedMatch = args.match(/['"](.*?)['"]/)
    if (quotedMatch) {
      this.sectionName = quotedMatch[1]
    } else {
      // Si no hay comillas, tomar el primer argumento
      this.sectionName = args.split(/\s+/)[0] || ''
    }

    if (!this.sectionName) {
      throw new Error('Section tag requires a section name')
    }
  }

  /**
   * Renderiza la sección cargando su contenido y ejecutándolo
   */
  *render(ctx: Context, emitter: any): Generator<any, void, unknown> {
    try {
      if (!this.sectionName) {
        emitter.write(`<!-- Error: Section tag requires a section name -->`)
        return
      }

      // Intentar cargar el contenido de la sección
      const sectionContent = this.loadSectionContent(this.sectionName, ctx)

      if (!sectionContent) {
        emitter.write(`<!-- Section '${this.sectionName}' not found -->`)
        return
      }

      // SIMPLIFICADO: Por ahora solo mostrar que la sección fue encontrada
      // TODO: Implementar renderizado sin bucles infinitos
      emitter.write(`<!-- Section '${this.sectionName}' rendered -->`)
    } catch (error) {
      console.error(`Error rendering section '${this.sectionName}':`, error)
      emitter.write(
        `<!-- Error loading section '${this.sectionName}': ${error instanceof Error ? error.message : 'Unknown error'} -->`
      )
    }
  }

  /**
   * Carga el contenido de una sección
   * SIMPLIFICADO: Por ahora solo simular que encontró la sección
   */
  private loadSectionContent(sectionName: string, ctx: Context): string | null {
    try {
      // Obtener storeId del contexto
      const contextData = ctx.getAll() as any
      const storeId = contextData.storeId || 'default'

      // SIMPLIFICADO: Solo retornar que se encontró la sección
      // TODO: Implementar carga real de secciones
      return `<div class="section-${sectionName}">Section ${sectionName} content</div>`
    } catch (error) {
      console.warn(`Could not load section '${sectionName}':`, error)
      return null
    }
  }

  /**
   * Obtiene el nombre de la sección que este tag renderiza
   */
  public getSectionName(): string {
    return this.sectionName
  }
}
