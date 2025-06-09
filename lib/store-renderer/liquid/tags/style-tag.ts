import { Tag, TagToken, Context, TopLevelToken, Liquid, TokenKind } from 'liquidjs'

/**
 * Custom Style Tag para manejar {% style %} en LiquidJS
 * Genera CSS dinámico con variables Liquid
 */
export class StyleTag extends Tag {
  private cssContent: string = ''

  constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(tagToken, remainTokens, liquid)

    // Parsear el contenido CSS entre {% style %} y {% endstyle %}
    this.parseCSSContent(remainTokens)
  }

  private parseCSSContent(remainTokens: TopLevelToken[]): void {
    let depth = 1
    let content = ''

    for (let i = 0; i < remainTokens.length; i++) {
      const token = remainTokens[i]

      if (token.kind === TokenKind.Tag) {
        const tagToken = token as any
        if (tagToken.name === 'style') {
          depth++
        } else if (tagToken.name === 'endstyle') {
          depth--
          if (depth === 0) {
            // Remover los tokens procesados
            remainTokens.splice(0, i + 1)
            break
          }
        }
      }

      if (depth > 0) {
        // Capturar todo el contenido, incluyendo texto y expresiones Liquid
        if (token.kind === TokenKind.HTML) {
          // Acceder correctamente al contenido HTML usando begin y end
          const htmlToken = token as any
          const tokenContent = htmlToken.input
            ? htmlToken.input.substring(htmlToken.begin, htmlToken.end)
            : ''
          content += tokenContent
        } else if (token.kind === TokenKind.Output) {
          // Reconstruir la expresión de output
          const outputToken = token as any
          const tokenContent = outputToken.content || outputToken.value || ''
          content += `{{ ${tokenContent} }}`
        } else if (token.kind === TokenKind.Tag) {
          // Reconstruir la tag completa
          const tagToken = token as any
          const tokenContent = tagToken.content || tagToken.value || ''
          content += `{% ${tokenContent} %}`
        }
      }
    }

    this.cssContent = content.trim()
  }

  *render(ctx: Context, emitter: any): Generator<any, void, unknown> {
    // Si no hay contenido CSS, no renderizar nada
    if (!this.cssContent.trim()) {
      return
    }

    try {
      // Procesar el contenido CSS evaluando las expresiones Liquid
      const template = this.liquid.parse(this.cssContent)
      const processedCSS = (yield this.liquid.render(template, ctx.getAll())) as string

      // Limpiar y optimizar el CSS
      const optimizedCSS = this.optimizeCSS(processedCSS)

      // Generar el tag style HTML con atributo data-shopify
      emitter.write(`<style data-shopify>\n${optimizedCSS}\n</style>`)
    } catch (error) {
      console.error('Error processing CSS in style tag:', error)
      // Fallback al CSS original optimizado
      const fallbackCSS = this.optimizeCSS(this.cssContent)
      emitter.write(`<style data-shopify>\n${fallbackCSS}\n</style>`)
    }
  }

  /**
   * Optimiza y limpia el CSS generado
   */
  private optimizeCSS(css: string): string {
    return (
      css
        // Remover comentarios CSS
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remover espacios múltiples
        .replace(/\s+/g, ' ')
        // Remover espacios antes y después de llaves y dos puntos
        .replace(/\s*{\s*/g, ' { ')
        .replace(/\s*}\s*/g, ' } ')
        .replace(/\s*:\s*/g, ': ')
        .replace(/\s*;\s*/g, '; ')
        // Limpiar líneas vacías
        .replace(/^\s*[\r\n]/gm, '')
        .trim()
    )
  }
}

/**
 * Stylesheet Tag - Para CSS en secciones
 * Similar a Style Tag pero con funcionalidades adicionales
 */
export class StylesheetTag extends Tag {
  private cssContent: string = ''

  constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(tagToken, remainTokens, liquid)

    // Parsear el contenido CSS entre {% stylesheet %} y {% endstylesheet %}
    this.parseCSSContent(remainTokens)
  }

  private parseCSSContent(remainTokens: TopLevelToken[]): void {
    let depth = 1
    let content = ''

    for (let i = 0; i < remainTokens.length; i++) {
      const token = remainTokens[i]

      if (token.kind === TokenKind.Tag) {
        const tagToken = token as any
        if (tagToken.name === 'stylesheet') {
          depth++
        } else if (tagToken.name === 'endstylesheet') {
          depth--
          if (depth === 0) {
            // Remover los tokens procesados
            remainTokens.splice(0, i + 1)
            break
          }
        }
      }

      if (depth > 0) {
        // Capturar todo el contenido
        if (token.kind === TokenKind.HTML) {
          // Acceder correctamente al contenido HTML usando begin y end
          const htmlToken = token as any
          const tokenContent = htmlToken.input
            ? htmlToken.input.substring(htmlToken.begin, htmlToken.end)
            : ''
          content += tokenContent
        } else if (token.kind === TokenKind.Output) {
          // Reconstruir la expresión de output
          const outputToken = token as any
          const tokenContent = outputToken.content || outputToken.value || ''
          content += `{{ ${tokenContent} }}`
        } else if (token.kind === TokenKind.Tag) {
          // Reconstruir la tag completa
          const tagToken = token as any
          const tokenContent = tagToken.content || tagToken.value || ''
          content += `{% ${tokenContent} %}`
        }
      }
    }

    this.cssContent = content.trim()
  }

  *render(ctx: Context, emitter: any): Generator<any, void, unknown> {
    // Si no hay contenido CSS, no renderizar nada
    if (!this.cssContent.trim()) {
      return
    }

    try {
      // Procesar el contenido CSS evaluando las expresiones Liquid
      const template = this.liquid.parse(this.cssContent)
      const processedCSS = (yield this.liquid.render(template, ctx.getAll())) as string

      // Generar el tag style HTML con atributo data-shopify
      // El tag stylesheet normalmente se usa en secciones y puede tener ID único
      const sectionId = 'stylesheet'

      emitter.write(
        `<style data-shopify data-section-id="${sectionId}">\n${processedCSS}\n</style>`
      )
    } catch (error) {
      console.error('Error processing CSS in stylesheet tag:', error)
      // Fallback al CSS original
      const sectionId = 'stylesheet'
      emitter.write(
        `<style data-shopify data-section-id="${sectionId}">\n${this.cssContent}\n</style>`
      )
    }
  }
}
