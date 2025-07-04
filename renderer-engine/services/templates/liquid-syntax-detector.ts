import type {
  DataLoadOptions,
  DataRequirement,
  TemplateAnalysis,
} from '@/renderer-engine/services/templates/template-analyzer';

/**
 * Tipo para detectores de objetos Liquid
 */
type ObjectDetector = {
  pattern: RegExp;
  optionsExtractor: (content: string) => DataLoadOptions;
};

/**
 * Tipo para detectores de paginación
 */
type PaginationHandler = (match: string, analysis: TemplateAnalysis) => void;

/**
 * Extractores de opciones declarativos para cada tipo de datos
 */
const loadOptionsExtractors: Record<DataRequirement, (content: string) => DataLoadOptions> = {
  products: (content: string) => {
    const limitMatch = content.match(/products[^}]*limit:\s*(\d+)/i);
    return {
      limit: limitMatch ? parseInt(limitMatch[1], 10) : 20,
    };
  },

  collection_products: (content: string) => {
    const collectionMatch = content.match(/collections\.([a-zA-Z0-9_-]+)\.products[^}]*limit:\s*(\d+)/i);
    if (collectionMatch) {
      return {
        collectionHandle: collectionMatch[1],
        limit: parseInt(collectionMatch[2], 10),
      };
    }

    const collectionOnlyMatch = content.match(/collections\.([a-zA-Z0-9_-]+)\.products/i);
    return collectionOnlyMatch ? { collectionHandle: collectionOnlyMatch[1], limit: 8 } : { limit: 8 };
  },

  collections: (content: string) => {
    const limitMatch = content.match(/collections[^}]*limit:\s*(\d+)/i);
    return {
      limit: limitMatch ? parseInt(limitMatch[1], 10) : 10,
    };
  },

  // Nuevos extractores para acceso específico
  specific_collection: (content: string) => {
    const handles: string[] = [];

    // Detectar collections['handle'] y collections["handle"]
    const bracketMatches = content.match(/collections\[['"]([^'"]+)['"]\]/g);
    if (bracketMatches) {
      bracketMatches.forEach((match) => {
        const handleMatch = match.match(/collections\[['"]([^'"]+)['"]\]/);
        if (handleMatch) handles.push(handleMatch[1]);
      });
    }

    // Detectar collections.handle (acceso directo por propiedad)
    const dotMatches = content.match(/collections\.([a-zA-Z0-9_-]+)(?!\.\w)/g);
    if (dotMatches) {
      dotMatches.forEach((match) => {
        const handleMatch = match.match(/collections\.([a-zA-Z0-9_-]+)/);
        if (handleMatch && !handles.includes(handleMatch[1])) {
          handles.push(handleMatch[1]);
        }
      });
    }

    return { handles };
  },

  specific_product: (content: string) => {
    const handles: string[] = [];

    // Detectar products['handle'] y products["handle"]
    const bracketMatches = content.match(/products\[['"]([^'"]+)['"]\]/g);
    if (bracketMatches) {
      bracketMatches.forEach((match) => {
        const handleMatch = match.match(/products\[['"]([^'"]+)['"]\]/);
        if (handleMatch) handles.push(handleMatch[1]);
      });
    }

    return { handles };
  },

  products_by_collection: (content: string) => {
    const handles: string[] = [];
    const limitMatch = content.match(/limit:\s*(\d+)/i);
    const limit = limitMatch ? parseInt(limitMatch[1], 10) : 8;

    // Extraer handles de colecciones mencionadas para cargar sus productos
    const collectionRefs = content.match(/collections\.([a-zA-Z0-9_-]+)\.products/g);
    if (collectionRefs) {
      collectionRefs.forEach((ref) => {
        const handleMatch = ref.match(/collections\.([a-zA-Z0-9_-]+)/);
        if (handleMatch && !handles.includes(handleMatch[1])) {
          handles.push(handleMatch[1]);
        }
      });
    }

    return { handles, limit };
  },

  related_products: (content: string) => {
    const limitMatch = content.match(/related_products[^}]*limit:\s*(\d+)/i);
    return {
      limit: limitMatch ? parseInt(limitMatch[1], 10) : 4,
    };
  },

  specific_page: (content: string) => {
    const handles: string[] = [];

    // Detectar pages['handle'] y pages["handle"]
    const bracketMatches = content.match(/pages\[['"]([^'"]+)['"]\]/g);
    if (bracketMatches) {
      bracketMatches.forEach((match) => {
        const handleMatch = match.match(/pages\[['"]([^'"]+)['"]\]/);
        if (handleMatch) handles.push(handleMatch[1]);
      });
    }

    // Detectar pages.handle (acceso directo por propiedad)
    const dotMatches = content.match(/pages\.([a-zA-Z0-9_-]+)(?!\.\w)/g);
    if (dotMatches) {
      dotMatches.forEach((match) => {
        const handleMatch = match.match(/pages\.([a-zA-Z0-9_-]+)/);
        if (handleMatch && !handles.includes(handleMatch[1])) {
          handles.push(handleMatch[1]);
        }
      });
    }

    return { handles };
  },

  pages: (content: string) => {
    const limitMatch = content.match(/pages[^}]*limit:\s*(\d+)/i);
    return {
      limit: limitMatch ? parseInt(limitMatch[1], 10) : 10,
    };
  },

  product: () => ({}),
  collection: () => ({}),
  cart: () => ({}),
  linklists: () => ({}),
  shop: () => ({}),
  page: (content: string) => {
    const handles: string[] = [];

    // Detectar pages['handle'] y pages["handle"]
    const bracketMatches = content.match(/pages\[['"]([^'"]+)['"]\]/g);
    if (bracketMatches) {
      bracketMatches.forEach((match) => {
        const handleMatch = match.match(/pages\[['"]([^'"]+)['"]\]/);
        if (handleMatch) handles.push(handleMatch[1]);
      });
    }

    // Detectar pages.handle (acceso directo por propiedad)
    const dotMatches = content.match(/pages\.([a-zA-Z0-9_-]+)(?!\.\w)/g);
    if (dotMatches) {
      dotMatches.forEach((match) => {
        const handleMatch = match.match(/pages\.([a-zA-Z0-9_-]+)/);
        if (handleMatch && !handles.includes(handleMatch[1])) {
          handles.push(handleMatch[1]);
        }
      });
    }

    return handles.length > 0 ? { handles } : {};
  },
  blog: () => ({}),
  pagination: () => ({}),
};

/**
 * Detectores de objetos Liquid declarativos
 */
const objectDetectors: Record<DataRequirement, ObjectDetector> = {
  products: {
    pattern: /\{\{\s*products\s*[\|\}]/g,
    optionsExtractor: loadOptionsExtractors.products,
  },
  collection_products: {
    pattern: /collections\.([a-zA-Z0-9_-]+)\.products/g,
    optionsExtractor: loadOptionsExtractors.collection_products,
  },
  collections: {
    pattern: /\{\{\s*collections\s*[\|\}]/g,
    optionsExtractor: loadOptionsExtractors.collections,
  },

  // Nuevos detectores para acceso específico
  specific_collection: {
    pattern: /collections\[['"]([^'"]+)['"]\]|collections\.([a-zA-Z0-9_-]+)(?!\.\w)/g,
    optionsExtractor: loadOptionsExtractors.specific_collection,
  },
  specific_product: {
    pattern: /products\[['"]([^'"]+)['"]\]/g,
    optionsExtractor: loadOptionsExtractors.specific_product,
  },
  products_by_collection: {
    pattern: /collections\.([a-zA-Z0-9_-]+)\.products/g,
    optionsExtractor: loadOptionsExtractors.products_by_collection,
  },
  related_products: {
    pattern: /related_products|product\s*\|\s*related/g,
    optionsExtractor: loadOptionsExtractors.related_products,
  },
  product: {
    pattern: /\{\{\s*product\./g,
    optionsExtractor: loadOptionsExtractors.product,
  },
  collection: {
    pattern: /\{\{\s*collection\./g,
    optionsExtractor: loadOptionsExtractors.collection,
  },
  cart: {
    pattern: /\{\{\s*cart\./g,
    optionsExtractor: loadOptionsExtractors.cart,
  },
  linklists: {
    pattern: /\{\{\s*linklists\./g,
    optionsExtractor: loadOptionsExtractors.linklists,
  },
  shop: {
    pattern: /\{\{\s*shop\./g,
    optionsExtractor: loadOptionsExtractors.shop,
  },
  specific_page: {
    pattern: /pages\[['"]([^'"]+)['"]\]|pages\.([a-zA-Z0-9_-]+)(?!\.\w)/g,
    optionsExtractor: loadOptionsExtractors.specific_page,
  },
  pages: {
    pattern: /\{\{\s*pages\s*[\|\}]/g,
    optionsExtractor: loadOptionsExtractors.pages,
  },
  page: {
    pattern: /\{\{\s*page\./g,
    optionsExtractor: loadOptionsExtractors.page,
  },
  blog: {
    pattern: /\{\{\s*blog\./g,
    optionsExtractor: loadOptionsExtractors.blog,
  },
  pagination: {
    pattern: /\{\%\s*paginate/g,
    optionsExtractor: loadOptionsExtractors.pagination,
  },
};

/**
 * Handlers para diferentes tipos de paginación
 */
const paginationHandlers: Record<string, PaginationHandler> = {
  'collection.products': (match: string, analysis: TemplateAnalysis) => {
    const limitMatch = match.match(/by\s+(\d+)/i);
    const limit = limitMatch ? parseInt(limitMatch[1], 10) : 20;
    analysis.requiredData.set('collection', { limit });
  },

  products: (match: string, analysis: TemplateAnalysis) => {
    const limitMatch = match.match(/by\s+(\d+)/i);
    const limit = limitMatch ? parseInt(limitMatch[1], 10) : 20;
    analysis.requiredData.set('products', { limit });
  },

  collections: (match: string, analysis: TemplateAnalysis) => {
    const limitMatch = match.match(/by\s+(\d+)/i);
    const limit = limitMatch ? parseInt(limitMatch[1], 10) : 10;
    analysis.requiredData.set('collections', { limit });
  },
};

export class LiquidSyntaxDetector {
  private static readonly TAG_PATTERNS = {
    paginate: /\{\%\s*paginate\s+([^%]+)\%\}/g,
    section: /\{\%\s*section\s+['"]([^'"]+)['"]\s*\%\}/g,
    render: /\{\%\s*render\s+['"]([^'"]+)['"]/g,
    include: /\{\%\s*include\s+['"]([^'"]+)['"]/g,
  };

  public static detectLiquidObjects(content: string, analysis: TemplateAnalysis): void {
    for (const [objectType, detector] of Object.entries(objectDetectors)) {
      const matches = content.match(detector.pattern);
      if (matches && matches.length > 0) {
        analysis.liquidObjects.push(objectType);
        const loadOptions = detector.optionsExtractor(content);
        analysis.requiredData.set(objectType as DataRequirement, loadOptions);
      }
    }
  }

  public static detectPagination(content: string, analysis: TemplateAnalysis): void {
    const paginateMatches = content.match(this.TAG_PATTERNS.paginate);
    if (!paginateMatches?.length) return;

    analysis.hasPagination = true;

    for (const match of paginateMatches) {
      const paginateContent = match.match(/paginate\s+([^\s]+)\s+by\s+(\d+)/i);
      if (!paginateContent) continue;

      const paginatedObject = paginateContent[1];

      // Buscar handler específico para el tipo de objeto paginado
      const handlerKey = Object.keys(paginationHandlers).find((key) => paginatedObject.includes(key));

      if (handlerKey) {
        paginationHandlers[handlerKey](match, analysis);
      }
    }
  }

  public static detectDependencies(content: string, analysis: TemplateAnalysis): void {
    // Detectar secciones
    this.extractMatches(content, this.TAG_PATTERNS.section, (match) => {
      const sectionName = this.extractName(match, /section\s+['"]([^'"]+)['"]/i);
      if (sectionName) {
        analysis.usedSections.push(sectionName);
        analysis.dependencies.push(`sections/${sectionName}.liquid`);
      }
    });

    // Detectar snippets (render e include)
    const snippetPatterns = [this.TAG_PATTERNS.render, this.TAG_PATTERNS.include];
    for (const pattern of snippetPatterns) {
      this.extractMatches(content, pattern, (match) => {
        const snippetName = this.extractName(match, /(?:render|include)\s+['"]([^'"]+)['"]/i);
        if (snippetName) {
          analysis.dependencies.push(`snippets/${snippetName}.liquid`);
        }
      });
    }
  }

  /**
   * Utilidad para extraer matches y procesarlos
   */
  private static extractMatches(content: string, pattern: RegExp, processor: (match: string) => void): void {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(processor);
    }
  }

  /**
   * Utilidad para extraer nombres de matches
   */
  private static extractName(match: string, pattern: RegExp): string | null {
    const nameMatch = match.match(pattern);
    return nameMatch ? nameMatch[1] : null;
  }
}
