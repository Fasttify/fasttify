import { Tag, TagToken, Context, TopLevelToken, Liquid, TokenKind } from 'liquidjs'
import { AssetCollector } from '@/renderer-engine/services/rendering/asset-collector'

/**
 * Custom JavaScript Tag para manejar {% javascript %} en LiquidJS
 * Genera JavaScript dinámico con variables Liquid en secciones
 */
export class JavaScriptTag extends Tag {
  private jsContent: string = ''

  constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(tagToken, remainTokens, liquid)

    // Parsear el contenido JS entre {% javascript %} y {% endjavascript %}
    this.parseJSContent(remainTokens)
  }

  private parseJSContent(remainTokens: TopLevelToken[]): void {
    let depth = 1
    let content = ''

    for (let i = 0; i < remainTokens.length; i++) {
      const token = remainTokens[i]

      if (token.kind === TokenKind.Tag) {
        const tagToken = token as any
        if (tagToken.name === 'javascript') {
          depth++
        } else if (tagToken.name === 'endjavascript') {
          depth--
          if (depth === 0) {
            // Remover los tokens procesados
            remainTokens.splice(0, i + 1)
            break
          }
        }
      }

      if (depth > 0) {
        // Capturar todo el contenido JavaScript
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

    this.jsContent = content.trim()
  }

  *render(ctx: Context): Generator<any, void, unknown> {
    const assetCollector = (this.liquid.options.globals as any)._assetCollector as
      | AssetCollector
      | undefined
    const sectionId = ctx.get(['section', 'id']) as string | undefined

    if (!assetCollector || !this.jsContent.trim()) {
      return
    }

    try {
      const template = this.liquid.parse(this.jsContent)
      const processedJS = (yield this.liquid.render(template, ctx.getAll())) as string
      const uniqueId = sectionId || `javascript-${Math.random().toString(36).substring(2, 9)}`
      assetCollector.addJs(processedJS, uniqueId)
    } catch (error) {
      console.error('Error processing JavaScript in javascript tag:', error)
    }
  }

  /**
   * Envuelve el JavaScript para evitar conflictos y agregar contexto
   */
  private wrapJavaScript(js: string, ctx: Context): string {
    const sectionId = 'global'
    const sectionType = 'unknown'

    return `
// Section: ${sectionType} (${sectionId})
(function() {
  'use strict';
  
  // Variables de contexto disponibles
  var section = {
    id: '${sectionId}',
    type: '${sectionType}',
    settings: ${JSON.stringify({})}
  };
  
  // Código del usuario
  ${js}
})();`
  }
}

/**
 * Filtro liquid_script para generar scripts seguros
 */
export class LiquidScriptFilter {
  static apply(input: unknown): string {
    if (typeof input !== 'string') {
      return ''
    }

    // Escapar caracteres especiales para uso seguro en JavaScript
    return input
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
  }
}

/**
 * Helper para generar scripts de sección
 */
export class SectionScriptHelper {
  static generateSectionScript(
    sectionId: string,
    code: string,
    settings: Record<string, unknown> = {}
  ): string {
    return `
<script type="text/javascript" data-section-id="${sectionId}">
(function() {
  'use strict';
  
  var sectionId = '${sectionId}';
  var sectionSettings = ${JSON.stringify(settings)};
  
  // Utilidades de sección
  function getSectionElement() {
    return document.querySelector('[data-section-id="' + sectionId + '"]');
  }
  
  function on(event, selector, callback) {
    var element = typeof selector === 'string' ? getSectionElement().querySelector(selector) : selector;
    if (element) {
      element.addEventListener(event, callback);
    }
  }
  
  // Código de la sección
  ${code}
  
  // Auto-inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    // El código ya se ejecutó arriba
  }
})();
</script>`
  }
}
