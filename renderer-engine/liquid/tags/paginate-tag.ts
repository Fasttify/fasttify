import { Tag, TopLevelToken, Liquid, Context, Value, TagToken, Emitter, TokenKind } from 'liquidjs';
import { logger } from '@/renderer-engine/lib/logger';
import type { PaginationContext } from '@/renderer-engine/types';

/**
 * Custom Paginate Tag para Shopify Liquid.
 * RESPONSABILIDAD ÚNICA: Gestionar la presentación de datos ya cargados por DynamicDataLoader.
 * NO carga datos, solo los presenta con paginación.
 */
export class PaginateTag extends Tag {
  private collectionExpression: string;
  private pageSizeExpression: Value;
  private templateContent: string = '';

  constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(tagToken, remainTokens, liquid);
    const args = tagToken.args.trim();
    const match = args.match(/^(.+?)\s+by\s+(.+)$/i);
    if (!match) {
      throw new Error(`Invalid paginate syntax. Use: {% paginate items by number %}`);
    }
    this.collectionExpression = match[1].trim();
    this.pageSizeExpression = new Value(match[2].trim(), liquid);
    this.parseContent(remainTokens);
  }

  private parseContent(remainTokens: TopLevelToken[]): void {
    const contentTokens: string[] = [];
    let closed = false;
    while (remainTokens.length > 0) {
      const token = remainTokens.shift()!;
      if (token.kind === TokenKind.Tag && (token as TagToken).name === 'endpaginate') {
        closed = true;
        break;
      }
      contentTokens.push(token.getText());
    }
    if (!closed) throw new Error('tag {% paginate %} not closed');
    this.templateContent = contentTokens.join('');
  }

  public *render(ctx: Context, emitter: Emitter): Generator<unknown, void, unknown> {
    try {
      // 1. Obtener el tamaño de página esperado
      const pageSizeValue = (yield this.pageSizeExpression.value(ctx, false)) as number;
      const expectedPageSize = Math.max(1, Math.min(50, pageSizeValue || 20));

      // 2. Obtener la lista de elementos YA CARGADA desde el contexto principal
      const expressionParts = this.collectionExpression.split('.');
      const items = this.getItemsFromContext(ctx, expressionParts);

      // 3. Obtener tokens de paginación del contexto principal
      const currentToken = String(ctx.getSync(['current_token']) || '');
      const nextToken = String(ctx.getSync(['next_token']) || '');
      const request = ctx.getSync(['request']) as { searchParams: URLSearchParams } | undefined;
      const hasToken = !!request?.searchParams.get('token');

      // 4. Crear el objeto 'paginate' para compatibilidad con Shopify
      const pagination: Omit<PaginationContext, 'parts' | 'total_items' | 'total_pages' | 'current_offset'> = {
        current_page: 1, // En token-based pagination, siempre es "página 1"
        items_per_page: expectedPageSize,
        next:
          nextToken && nextToken !== currentToken
            ? {
                title: 'Siguiente',
                url: this.generatePageUrl({ token: nextToken }),
              }
            : undefined,

        previous: hasToken ? { title: 'Anterior', url: 'javascript:history.back()' } : undefined,
      };

      // 5. Crear scope local para el contenido del tag
      const scope: { [key: string]: any } = {
        paginate: pagination,
      };

      // 6. Poner los elementos disponibles en el scope local
      this.setItemsInScope(scope, expressionParts, items, ctx);

      // 7. Renderizar el contenido con el scope local
      ctx.push(scope);
      try {
        const templates = this.liquid.parse(this.templateContent);
        yield this.liquid.renderer.renderTemplates(templates, ctx, emitter);
      } finally {
        ctx.pop(); // Garantizar limpieza del scope
      }

      logger.debug(
        `Paginate tag rendered successfully`,
        {
          expression: this.collectionExpression,
          itemCount: items.length,
          hasNext: !!nextToken,
        },
        'PaginateTag'
      );
    } catch (error) {
      logger.error('Error in paginate tag render', { error, expression: this.collectionExpression }, 'PaginateTag');

      // Fallback: renderizar contenido sin paginación
      try {
        const templates = this.liquid.parse(this.templateContent);
        yield this.liquid.renderer.renderTemplates(templates, ctx, emitter);
      } catch (renderError) {
        logger.error('Failed to render paginate content as fallback', renderError, 'PaginateTag');
        emitter.write(`<!-- Error in paginate tag: ${error instanceof Error ? error.message : 'Unknown error'} -->`);
      }
    }
  }

  /**
   * Obtiene los elementos del contexto siguiendo la expresión (ej: products, collection.products)
   */
  private getItemsFromContext(ctx: Context, expressionParts: string[]): any[] {
    try {
      if (expressionParts.length === 1) {
        // Expresión simple: "products"
        const items = ctx.getSync([expressionParts[0]]) as any[];
        return Array.isArray(items) ? items : [];
      } else {
        // Expresión anidada: "collection.products"
        const parentPath = expressionParts[0];
        const childKey = expressionParts[expressionParts.length - 1];
        const parentObject = ctx.getSync([parentPath]) as any;

        if (parentObject && parentObject[childKey]) {
          const items = parentObject[childKey] as any[];
          return Array.isArray(items) ? items : [];
        }
        return [];
      }
    } catch (error) {
      logger.warn(
        `Could not retrieve items from context for expression: ${this.collectionExpression}`,
        { error, expressionParts },
        'PaginateTag'
      );
      return [];
    }
  }

  /**
   * Coloca los elementos en el scope local para que estén disponibles en el contenido del tag
   */
  private setItemsInScope(scope: { [key: string]: any }, expressionParts: string[], items: any[], ctx: Context): void {
    if (expressionParts.length === 1) {
      // Expresión simple: poner directamente
      scope[expressionParts[0]] = items;
    } else {
      // Expresión anidada: recrear la estructura
      const parentPath = expressionParts[0];
      const childKey = expressionParts[expressionParts.length - 1];
      const originalParent = (ctx.getSync([parentPath]) as any) || {};

      // Crear una copia del objeto padre con los elementos actualizados
      scope[parentPath] = {
        ...originalParent,
        [childKey]: items,
      };
    }
  }

  /**
   * Genera URL de paginación con un token.
   */
  private generatePageUrl(params: Record<string, string>): string {
    const searchParams = new URLSearchParams(params);
    return `?${searchParams.toString()}`;
  }
}
