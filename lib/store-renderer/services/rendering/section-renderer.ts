import { liquidEngine } from '../../liquid/engine'
import { templateLoader } from '../templates/template-loader'
import { schemaParser } from '../templates/schema-parser'
import type { RenderContext } from '../../types'

export class SectionRenderer {
  /**
   * Renderiza una sección extrayendo primero los settings del schema
   */
  public async renderSectionWithSchema(
    sectionName: string,
    templateContent: string,
    baseContext: RenderContext
  ): Promise<string> {
    try {
      // Crear contexto específico para esta sección
      const sectionContext = {
        ...baseContext,
        section: {
          id: sectionName,
          settings: schemaParser.extractSchemaSettings(templateContent),
          blocks: schemaParser.extractSchemaBlocks(templateContent),
        },
      }

      // Renderizar la sección con el contexto enriquecido
      return await liquidEngine.render(templateContent, sectionContext, `section_${sectionName}`)
    } catch (error) {
      console.error(`Error rendering section ${sectionName}:`, error)
      return `<!-- Error rendering ${sectionName} section -->`
    }
  }

  /**
   * Carga una sección de forma segura sin fallar si no existe
   */
  public async loadSectionSafely(
    storeId: string,
    sectionName: string,
    context: RenderContext
  ): Promise<string> {
    try {
      const sectionContent = await templateLoader.loadTemplate(
        storeId,
        `sections/${sectionName}.liquid`
      )
      return await this.renderSectionWithSchema(sectionName, sectionContent, context)
    } catch (error) {
      console.warn(`Section ${sectionName} not found or failed to render:`, error)
      return `<!-- Section '${sectionName}' not found -->`
    }
  }

  /**
   * Extrae automáticamente los nombres de las secciones del layout
   * Busca todos los {% section 'nombre' %} en el contenido
   */
  public extractSectionNamesFromLayout(layoutContent: string): string[] {
    const sectionRegex = /{%\s*section\s+['"]([^'"]+)['"]\s*%}/g
    const sectionNames: string[] = []
    let match

    while ((match = sectionRegex.exec(layoutContent)) !== null) {
      const sectionName = match[1]
      if (!sectionNames.includes(sectionName)) {
        sectionNames.push(sectionName)
      }
    }

    return sectionNames
  }
}

export const sectionRenderer = new SectionRenderer()
