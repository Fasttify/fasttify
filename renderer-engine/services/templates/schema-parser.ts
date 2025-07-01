export class SchemaParser {
  private static readonly SCHEMA_REGEX = /{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/i

  /**
   * Extrae y parsea el schema completo de un template (una sola vez)
   */
  private parseSchema(templateContent: string): any {
    const match = templateContent.match(SchemaParser.SCHEMA_REGEX)
    if (!match?.[1]) return null

    const rawContent = match[1].trim()

    // Intentar parseo directo primero (caso más común)
    try {
      return JSON.parse(rawContent)
    } catch {
      // Fallback: limpiar y parsear
      try {
        return JSON.parse(this.cleanJSON(rawContent))
      } catch {
        return null
      }
    }
  }

  /**
   * Limpia JSON con caracteres inválidos (versión optimizada)
   */
  private cleanJSON(content: string): string {
    return content
      .replace(/\/\/.*$/gm, '') // Comentarios //
      .replace(/\/\*[\s\S]*?\*\//g, '') // Comentarios /* */
      .replace(/,(\s*[}\]])/g, '$1') // Comas finales
      .replace(/,,+/g, ',') // Comas dobles
      .replace(/\s+/g, ' ') // Espacios extra
      .trim()
  }

  /**
   * Obtiene valor por defecto según tipo
   */
  private getDefaultValue(type: string): any {
    switch (type) {
      case 'text':
      case 'textarea':
      case 'richtext':
      case 'html':
      case 'url':
      case 'select':
      case 'radio':
        return ''
      case 'number':
      case 'range':
        return 0
      case 'checkbox':
        return false
      case 'color':
        return '#000000'
      case 'image_picker':
      case 'video':
      case 'file':
        return null
      default:
        return ''
    }
  }

  /**
   * Extrae settings del schema con valores por defecto
   */
  public extractSchemaSettings(templateContent: string): Record<string, any> {
    const schema = this.parseSchema(templateContent)
    if (!schema?.settings) return {}

    const settings: Record<string, any> = {}
    for (const setting of schema.settings) {
      if (setting.id) {
        settings[setting.id] = setting.default ?? this.getDefaultValue(setting.type)
      }
    }
    return settings
  }

  /**
   * Extrae blocks del schema
   */
  public extractSchemaBlocks(templateContent: string): any[] {
    const schema = this.parseSchema(templateContent)
    return schema?.blocks || []
  }

  /**
   * Extrae el schema completo
   */
  public extractFullSchema(templateContent: string): any {
    return this.parseSchema(templateContent) || {}
  }

  /**
   * Obtiene valor por defecto para un tipo (método público para compatibilidad)
   */
  public getDefaultValueForType(type: string): any {
    return this.getDefaultValue(type)
  }
}

export const schemaParser = new SchemaParser()
