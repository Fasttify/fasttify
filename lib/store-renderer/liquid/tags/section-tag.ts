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

    // Buscar texto entre comillas simples o dobles
    const quotedMatch = args.match(/['"](.*?)['"]/)
    if (quotedMatch) {
      this.sectionName = quotedMatch[1]
    } else {
      // Si no hay comillas, tomar el primer argumento
      this.sectionName = args.split(/\s+/)[0] || ''
    }
  }

  /**
   * Renderiza la sección cargando su contenido y ejecutándolo
   */
  async *render(ctx: Context): AsyncGenerator<unknown, string, unknown> {
    try {
      if (!this.sectionName) {
        return `<!-- Error: No section name specified -->`
      }

      // Intentar cargar el contenido de la sección
      const sectionContent = yield this.loadSectionContent(this.sectionName, ctx)

      if (!sectionContent) {
        return `<!-- Section '${this.sectionName}' not found -->`
      }

      // Renderizar el contenido de la sección con el contexto actual
      const template = this.liquid.parse(sectionContent as string)
      const result = yield this.liquid.render(template, ctx)

      return result as string
    } catch (error) {
      console.error(`Error rendering section '${this.sectionName}':`, error)
      return `<!-- Error rendering section '${this.sectionName}' -->`
    }
  }

  /**
   * Carga el contenido de una sección
   * En un entorno real, esto cargaría desde el sistema de archivos o base de datos
   */
  private async loadSectionContent(sectionName: string, ctx: Context): Promise<string | null> {
    try {
      // Usar el TemplateLoader para cargar la sección
      const { TemplateLoader } = await import('../../services/template-loader')
      const templateLoader = TemplateLoader.getInstance()

      // Por ahora usar un storeId por defecto, en el futuro esto se puede mejorar
      // para obtener el storeId correcto del contexto
      const storeId = 'default'

      return await templateLoader.loadSection(storeId, sectionName)
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
