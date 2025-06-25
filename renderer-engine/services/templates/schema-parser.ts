import { logger } from '@/renderer-engine/lib/logger'

export class SchemaParser {
  /**
   * Limpia y valida el contenido JSON de un schema
   */
  private cleanSchemaJSON(jsonContent: string): string {
    try {
      // Remover comentarios tipo // (no válidos en JSON)
      let cleaned = jsonContent.replace(/\/\/.*$/gm, '')

      // Remover comentarios tipo /* */ (no válidos en JSON)
      cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '')

      // Arreglar comas finales antes de } o ]
      cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1')

      // Arreglar comas dobles
      cleaned = cleaned.replace(/,,+/g, ',')

      // Remover espacios extra y saltos de línea extra
      cleaned = cleaned.replace(/\s+/g, ' ').trim()

      // Intentar validar brackets (pero no fallar si hay problemas)
      try {
        this.validateBracketsBalance(cleaned)
      } catch (bracketError) {
        const errorMessage =
          bracketError instanceof Error ? bracketError.message : 'Unknown bracket error'
        logger.warn(
          'Schema has unbalanced brackets, but continuing with parsing',
          errorMessage,
          'SchemaParser'
        )
        // No retornamos error, intentamos parsear el JSON de todas formas
      }

      return cleaned
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.warn('Error cleaning schema JSON, using original', errorMessage, 'SchemaParser')
      // Si hay error en la limpieza, devolver el contenido original
      return jsonContent
    }
  }

  /**
   * Valida que los brackets estén balanceados en el JSON
   */
  private validateBracketsBalance(jsonContent: string): void {
    let braceCount = 0
    let bracketCount = 0
    let inString = false
    let escapeNext = false

    for (let i = 0; i < jsonContent.length; i++) {
      const char = jsonContent[i]

      if (escapeNext) {
        escapeNext = false
        continue
      }

      if (char === '\\') {
        escapeNext = true
        continue
      }

      if (char === '"' && !escapeNext) {
        inString = !inString
        continue
      }

      if (!inString) {
        if (char === '{') braceCount++
        else if (char === '}') braceCount--
        else if (char === '[') bracketCount++
        else if (char === ']') bracketCount--
      }
    }

    if (braceCount !== 0) {
      throw new Error(`Unbalanced braces: ${braceCount > 0 ? 'missing }' : 'extra }'}`)
    }
    if (bracketCount !== 0) {
      throw new Error(`Unbalanced brackets: ${bracketCount > 0 ? 'missing ]' : 'extra ]'}`)
    }
  }

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

      // Limpiar el contenido del schema antes de parsear
      const rawSchemaContent = match[1].trim()

      // Intentar parsear directamente primero
      let schemaJSON: any
      try {
        schemaJSON = JSON.parse(rawSchemaContent)
      } catch (directParseError) {
        // Si falla el parseo directo, intentar con limpieza
        try {
          const cleanedSchemaContent = this.cleanSchemaJSON(rawSchemaContent)

          // Log para debug solo en desarrollo
          if (process.env.NODE_ENV === 'development') {
            console.log(
              'Schema content to parse (first 200 chars):',
              cleanedSchemaContent.substring(0, 200) + '...'
            )
          }

          schemaJSON = JSON.parse(cleanedSchemaContent)
        } catch (cleanParseError) {
          console.warn('Failed to parse schema JSON after cleaning, skipping schema settings')
          return {}
        }
      }

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
      logger.error('Error extracting schema settings', error, 'SchemaParser')

      // Buscar nuevamente el match para el log de error
      const schemaRegex = /{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/i
      const errorMatch = templateContent.match(schemaRegex)
      if (errorMatch?.[1]) {
        logger.error(
          'Schema content that failed',
          errorMatch[1].substring(0, 500) + '...',
          'SchemaParser'
        )
      }

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

      const rawContent = match[1].trim()

      // Intentar parseo directo primero
      let schemaJSON: any
      try {
        schemaJSON = JSON.parse(rawContent)
      } catch (directError) {
        // Intentar con limpieza
        try {
          const cleanedContent = this.cleanSchemaJSON(rawContent)
          schemaJSON = JSON.parse(cleanedContent)
        } catch (cleanError) {
          logger.warn('Error extracting schema blocks', cleanError, 'SchemaParser')
          return []
        }
      }

      return schemaJSON.blocks || []
    } catch (error) {
      logger.warn('Error extracting schema blocks', error, 'SchemaParser')
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

      const rawContent = match[1].trim()

      try {
        return JSON.parse(rawContent)
      } catch (directError) {
        try {
          const cleanedContent = this.cleanSchemaJSON(rawContent)
          return JSON.parse(cleanedContent)
        } catch (cleanError) {
          logger.warn('Error extracting full schema', cleanError, 'SchemaParser')
          return {}
        }
      }
    } catch (error) {
      logger.warn('Error extracting schema', error, 'SchemaParser')
      return {}
    }
  }
}

export const schemaParser = new SchemaParser()
