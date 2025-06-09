export class SchemaParser {
  /**
   * Extrae los settings del schema de un template usando expresiones regulares
   */
  public extractSchemaSettings(templateContent: string): Record<string, any> {
    try {
      // Buscar el bloque {% schema %}...{% endschema %}
      const schemaRegex = /{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/i
      const match = templateContent.match(schemaRegex)

      if (!match || !match[1]) {
        return {}
      }

      // Parsear el JSON del schema
      const schemaJSON = JSON.parse(match[1].trim())

      if (!schemaJSON.settings) {
        return {}
      }

      // Convertir settings a valores por defecto
      const settings: Record<string, any> = {}

      for (const setting of schemaJSON.settings) {
        if (setting.id) {
          settings[setting.id] = setting.default || this.getDefaultValueForType(setting.type)
        }
      }

      return settings
    } catch (error) {
      console.warn('Error extracting schema settings:', error)
      return {}
    }
  }

  /**
   * Extrae los blocks del schema
   */
  public extractSchemaBlocks(templateContent: string): any[] {
    try {
      const schemaRegex = /{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/i
      const match = templateContent.match(schemaRegex)

      if (!match || !match[1]) {
        return []
      }

      const schemaJSON = JSON.parse(match[1].trim())
      return schemaJSON.blocks || []
    } catch (error) {
      console.warn('Error extracting schema blocks:', error)
      return []
    }
  }

  /**
   * Obtiene valores por defecto basados en el tipo de setting
   */
  public getDefaultValueForType(type: string): any {
    switch (type) {
      case 'text':
      case 'textarea':
      case 'richtext':
      case 'html':
      case 'url':
        return ''
      case 'number':
      case 'range':
        return 0
      case 'checkbox':
        return false
      case 'color':
        return '#000000'
      case 'select':
      case 'radio':
        return ''
      case 'image_picker':
      case 'video':
      case 'file':
        return null
      default:
        return ''
    }
  }

  /**
   * Extrae el schema completo del template
   */
  public extractFullSchema(templateContent: string): any {
    try {
      const schemaRegex = /{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/i
      const match = templateContent.match(schemaRegex)

      if (!match || !match[1]) {
        return {}
      }

      return JSON.parse(match[1].trim())
    } catch (error) {
      console.warn('Error extracting schema:', error)
      return {}
    }
  }
}

export const schemaParser = new SchemaParser()
