import { logger } from '@/renderer-engine/lib/logger';
import { LiquidSyntaxDetector } from '@/renderer-engine/services/templates/liquid-syntax-detector';

/**
 * Tipo de datos que pueden ser detectados en una plantilla
 */
export type DataRequirement =
  | 'products' // {{ products }}
  | 'collection_products' // collections.CUALQUIER_NOMBRE.products
  | 'collections' // {{ collections }}
  | 'product' // {{ product }} (página individual)
  | 'collection' // {{ collection }} (página individual)
  | 'cart' // {{ cart }}
  | 'linklists' // {{ linklists.main-menu }}
  | 'shop' // {{ shop }}
  | 'page' // {{ page }}
  | 'blog' // {{ blog }}
  | 'pagination' // {% paginate %}
  | 'specific_collection' // collections['handle'] o collections.handle
  | 'specific_product' // products['handle'] o product por handle específico
  | 'products_by_collection' // Productos de una colección específica
  | 'related_products' // Productos relacionados
  | 'specific_page' // pages['handle'] o pages.handle
  | 'pages' // {{ pages }} - todas las páginas
  | 'policies'; // {{ policies }} - todas las páginas de políticas

/**
 * Opciones de carga para cada tipo de dato
 */
export interface DataLoadOptions {
  limit?: number;
  offset?: number;
  handle?: string;
  id?: string;
  nextToken?: string;
  collectionHandle?: string;
  handles?: string[];
  productId?: string;
  category?: string;
}

/**
 * Resultado del análisis de una plantilla
 */
export interface TemplateAnalysis {
  requiredData: Map<DataRequirement, DataLoadOptions>;
  hasPagination: boolean;
  usedSections: string[];
  liquidObjects: string[];
  dependencies: string[];
}

/**
 * Analizador de plantillas Liquid para detectar dependencias de datos
 */
export class TemplateAnalyzer {
  private static instance: TemplateAnalyzer;

  private constructor() {}

  public static getInstance(): TemplateAnalyzer {
    if (!TemplateAnalyzer.instance) {
      TemplateAnalyzer.instance = new TemplateAnalyzer();
    }
    return TemplateAnalyzer.instance;
  }

  /**
   * Analiza una plantilla y detecta qué datos necesita
   */
  public analyzeTemplate(templateContent: string, templatePath: string): TemplateAnalysis {
    const analysis: TemplateAnalysis = {
      requiredData: new Map(),
      hasPagination: false,
      usedSections: [],
      liquidObjects: [],
      dependencies: [],
    };

    try {
      // Usar el detector para poblar el objeto de análisis
      LiquidSyntaxDetector.detectLiquidObjects(templateContent, analysis);
      LiquidSyntaxDetector.detectPagination(templateContent, analysis);
      LiquidSyntaxDetector.detectDependencies(templateContent, analysis);

      // Inferir datos adicionales basados en el tipo de plantilla
      this.inferDataFromTemplatePath(templatePath, analysis);

      logger.debug(
        `Template analysis for ${templatePath}:`,
        {
          requiredData: Array.from(analysis.requiredData.keys()),
          dependencies: analysis.dependencies,
        },
        'TemplateAnalyzer'
      );
    } catch (error) {
      logger.error('Error analyzing template', error, 'TemplateAnalyzer');
    }

    return analysis;
  }

  /**
   * Analiza un conjunto de plantillas de forma recursiva, siguiendo las dependencias.
   */
  public async analyzeTemplateSet(
    storeId: string,
    initialTemplates: { [path: string]: string }
  ): Promise<TemplateAnalysis> {
    const { templateLoader } = await import('@/renderer-engine/services/templates/template-loader');

    const combinedAnalysis: TemplateAnalysis = {
      requiredData: new Map(),
      hasPagination: false,
      usedSections: [],
      liquidObjects: [],
      dependencies: [],
    };

    const analyzedPaths = new Set<string>();
    const templatesToAnalyze = new Map<string, string>(Object.entries(initialTemplates));

    while (templatesToAnalyze.size > 0) {
      const entry = templatesToAnalyze.entries().next().value;
      if (!entry) break;

      const [path, content] = entry;
      templatesToAnalyze.delete(path);

      if (analyzedPaths.has(path)) {
        continue;
      }
      analyzedPaths.add(path);

      const analysis = this.analyzeTemplate(content, path);
      this.mergeAnalysis(combinedAnalysis, analysis);

      // Añadir nuevas dependencias a la cola para ser analizadas
      for (const depPath of analysis.dependencies) {
        if (!analyzedPaths.has(depPath)) {
          try {
            const depContent = await templateLoader.loadTemplate(storeId, depPath);
            templatesToAnalyze.set(depPath, depContent);
          } catch (error) {
            logger.warn(`Could not load template dependency: ${depPath}`, error, 'TemplateAnalyzer');
          }
        }
      }
    }

    return combinedAnalysis;
  }

  /**
   * Infiere datos adicionales basado en el path de la plantilla
   */
  private inferDataFromTemplatePath(templatePath: string, analysis: TemplateAnalysis): void {
    if (templatePath.includes('index')) {
      if (!analysis.requiredData.has('collections')) {
        analysis.requiredData.set('collections', { limit: 6 });
      }
    } else if (templatePath.includes('product')) {
      if (!analysis.requiredData.has('product') && !analysis.requiredData.has('products')) {
        analysis.requiredData.set('product', {});
      }
    } else if (templatePath.includes('collection')) {
      if (!analysis.requiredData.has('collection')) {
        analysis.requiredData.set('collection', {});
      }
    } else if (templatePath.includes('cart')) {
      // Página de carrito necesita datos del carrito
      analysis.requiredData.set('cart', {});
    } else if (templatePath.includes('page')) {
      // Página estática necesita datos de la página específica
      if (!analysis.requiredData.has('page')) {
        analysis.requiredData.set('page', {});
      }
    }

    // El carrito siempre es necesario para el header
    if (!analysis.requiredData.has('cart')) {
      analysis.requiredData.set('cart', {});
    }

    // Los linklists siempre son necesarios para navegación
    if (!analysis.requiredData.has('linklists')) {
      analysis.requiredData.set('linklists', {});
    }

    // Shop/store info siempre es necesaria
    if (!analysis.requiredData.has('shop')) {
      analysis.requiredData.set('shop', {});
    }
  }

  /**
   * Combina dos análisis en uno
   */
  private mergeAnalysis(target: TemplateAnalysis, source: TemplateAnalysis): void {
    // Combinar datos requeridos
    for (const [dataType, options] of source.requiredData) {
      if (!target.requiredData.has(dataType)) {
        target.requiredData.set(dataType, options);
      } else {
        // Simplemente sobrescribir o combinar de forma básica por ahora.
        // La lógica del límite de paginación se centralizará en el data-loader.
        const existingOptions = target.requiredData.get(dataType)!;
        const mergedOptions = { ...existingOptions, ...options };
        target.requiredData.set(dataType, mergedOptions);
      }
    }

    // Combinar otras propiedades
    target.hasPagination = target.hasPagination || source.hasPagination;
    target.usedSections = [...new Set([...target.usedSections, ...source.usedSections])];
    target.liquidObjects = [...new Set([...target.liquidObjects, ...source.liquidObjects])];
    target.dependencies = [...new Set([...target.dependencies, ...source.dependencies])];
  }
}

export const templateAnalyzer = TemplateAnalyzer.getInstance();
