import { Tag, TagToken, Context, TopLevelToken, Liquid } from 'liquidjs';
import { logger } from '@/renderer-engine/lib/logger';

/**
 * Custom Section Tag para manejar {% section 'section-name' %} en LiquidJS
 * Este tag replica la funcionalidad de Shopify para incluir secciones
 */
export class SectionTag extends Tag {
  private sectionName: string = '';

  constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(tagToken, remainTokens, liquid);

    // Parsear el nombre de la sección del token
    this.parseSectionName(tagToken);
  }

  private parseSectionName(tagToken: TagToken): void {
    // El token viene como: {% section 'section-name' %}
    // Necesitamos extraer el nombre de la sección
    const args = tagToken.args?.trim() || '';

    if (!args) {
      throw new Error('Section tag requires a section name');
    }

    // Buscar texto entre comillas simples o dobles
    const quotedMatch = args.match(/['"](.*?)['"]/);
    if (quotedMatch) {
      this.sectionName = quotedMatch[1];
    } else {
      // Si no hay comillas, tomar el primer argumento
      this.sectionName = args.split(/\s+/)[0] || '';
    }

    if (!this.sectionName) {
      throw new Error('Section tag requires a section name');
    }
  }

  /**
   * Renderiza la sección usando las secciones pre-cargadas o fallback
   */
  *render(ctx: Context, emitter: any): Generator<any, void, unknown> {
    try {
      if (!this.sectionName) {
        emitter.write(`<!-- Error: Section tag requires a section name -->`);
        return;
      }

      // Intentar obtener sección pre-cargada del contexto
      const contextData = ctx.getAll() as any;
      const preloadedSections = contextData.preloaded_sections || {};

      if (preloadedSections[this.sectionName]) {
        emitter.write(preloadedSections[this.sectionName]);
        return;
      }

      // Fallback: mostrar mensaje de sección no encontrada
      emitter.write(`<!-- Section '${this.sectionName}' not preloaded -->`);
    } catch (error) {
      logger.error(`Error rendering section '${this.sectionName}'`, error, 'SectionTag');
      emitter.write(
        `<!-- Error loading section '${this.sectionName}': ${error instanceof Error ? error.message : 'Unknown error'} -->`
      );
    }
  }

  /**
   * Obtiene el nombre de la sección que este tag renderiza
   */
  public getSectionName(): string {
    return this.sectionName;
  }
}
