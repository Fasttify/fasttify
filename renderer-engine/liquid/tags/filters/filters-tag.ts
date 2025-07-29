import { logger } from '@/renderer-engine/lib/logger';
import { Context, Emitter, Liquid, Tag, TagToken, TopLevelToken } from 'liquidjs';
import {
  FiltersDataFetcher,
  FiltersHtmlRenderer,
  FiltersJavaScriptGenerator,
  FiltersOptions,
  FiltersOptionsParser,
} from '@/renderer-engine/liquid/tags/filters';

export class FiltersTag extends Tag {
  private options: FiltersOptions = {};

  constructor(tagToken: TagToken, remainTokens: TopLevelToken[], liquid: Liquid) {
    super(tagToken, remainTokens, liquid);
    this.options = FiltersOptionsParser.parse(tagToken);
  }

  *render(ctx: Context, emitter: Emitter): Generator<any, void, unknown> {
    try {
      // Obtener storeId de forma síncrona sin async
      const storeId =
        ctx.getSync(['storeId']) || ctx.getSync(['shop', 'storeId']) || ctx.getSync(['shop', 'id']) || 'fallback-store';

      // Extraer configuración del template
      const storeTemplate = ctx.getSync(['_store_template']);
      const productsPerPage = FiltersDataFetcher.extractProductsPerPage(storeTemplate);

      // Agregar configuración extraída a las opciones
      const optionsWithLimits = {
        ...this.options,
        productsPerPage,
      };

      // Renderizar usando los nuevos módulos - el formateo de moneda se maneja globalmente
      const filtersHTML = FiltersHtmlRenderer.generateStaticHTML(storeId as string, optionsWithLimits);
      const jsScript = FiltersJavaScriptGenerator.generateScript(storeId as string, optionsWithLimits);

      emitter.write(filtersHTML + jsScript);
    } catch (error) {
      logger.error('Error rendering filters tag', error, 'FiltersTag');
      emitter.write('<!-- filters tag: sync error -->');
    }
  }
}
