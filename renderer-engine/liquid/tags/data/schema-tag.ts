import { Tag, TagToken, Context, TopLevelToken, Liquid, TokenKind } from 'liquidjs';
import { logger } from '@/renderer-engine/lib/logger';

/**
 * Custom Schema Tag para manejar {% schema %} de Shopify en LiquidJS
 * Este tag extrae las configuraciones JSON y las inyecta en el contexto
 */
export class SchemaTag extends Tag {
  private schemaContent: string = '';
  private parsedSchema: any = null;

  constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(tagToken, remainTokens, liquid);

    // Parsear el contenido entre {% schema %} y {% endschema %}
    this.parseSchemaContent(remainTokens);
  }

  private parseSchemaContent(remainTokens: TopLevelToken[]): void {
    const contentTokens: string[] = [];
    let closed = false;

    while (remainTokens.length) {
      const token = remainTokens.shift();

      if (!token) break;

      // Verificar si encontramos el tag de cierre
      if (token.kind === TokenKind.Tag && (token as any).name === 'endschema') {
        closed = true;
        break;
      }

      // Acumular contenido del schema
      if (token.kind === TokenKind.HTML) {
        contentTokens.push((token as any).value);
      } else if (token.kind === TokenKind.Output) {
        contentTokens.push(`{{ ${(token as any).content} }}`);
      }
    }

    if (!closed) {
      throw new Error('tag {% schema %} not closed');
    }

    // Unir todo el contenido y parsear JSON
    this.schemaContent = contentTokens.join('').trim();
    this.parseJSON();
  }

  private parseJSON(): void {
    try {
      if (this.schemaContent) {
        this.parsedSchema = JSON.parse(this.schemaContent);
      }
    } catch (error) {
      logger.warn('Error parsing schema JSON', error, 'SchemaTag');
      logger.warn('Schema content', this.schemaContent, 'SchemaTag');
      this.parsedSchema = {};
    }
  }

  /**
   * Extrae los settings del schema con sus valores por defecto
   */
  public getSettings(): Record<string, any> {
    if (!this.parsedSchema || !this.parsedSchema.settings) {
      return {};
    }

    const settings: Record<string, any> = {};

    for (const setting of this.parsedSchema.settings) {
      if (setting.id) {
        // Usar valor por defecto si está definido
        settings[setting.id] = setting.default || this.getDefaultValueForType(setting.type);
      }
    }

    return settings;
  }

  /**
   * Obtiene valores por defecto basados en el tipo de setting
   */
  private getDefaultValueForType(type: string): any {
    switch (type) {
      case 'text':
      case 'textarea':
      case 'richtext':
      case 'html':
      case 'url':
        return '';
      case 'number':
      case 'range':
        return 0;
      case 'checkbox':
        return false;
      case 'color':
        return '#000000';
      case 'select':
      case 'radio':
        return '';
      case 'image_picker':
      case 'video':
      case 'file':
        return null;
      default:
        return '';
    }
  }

  /**
   * Obtiene los blocks del schema
   */
  public getBlocks(): any[] {
    if (!this.parsedSchema || !this.parsedSchema.blocks) {
      return [];
    }
    return this.parsedSchema.blocks;
  }

  /**
   * Obtiene el nombre de la sección
   */
  public getSectionName(): string {
    return this.parsedSchema?.name || 'Untitled Section';
  }

  /**
   * El render del tag schema no produce output HTML
   * Solo extrae y procesa los metadatos
   */
  *render(ctx: Context): Generator<unknown, string, unknown> {
    // Schema tag no renderiza contenido, solo procesa metadatos
    return '';
  }
}
