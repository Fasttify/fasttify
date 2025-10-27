/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { DataLoadOptions, DataRequirement, TemplateAnalysis } from '../analysis/template-analyzer';
import {
  LIQUID_OBJECT_PATTERNS,
  LIQUID_COLLECTION_ACCESS_PATTERNS,
  LIQUID_FILTER_PATTERNS,
  LIQUID_TAG_PATTERNS,
  LIQUID_PAGINATION_PATTERNS,
  LIQUID_OPTION_EXTRACTOR_PATTERNS,
} from '../../../lib/regex-patterns';

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
    const limitMatch = content.match(LIQUID_FILTER_PATTERNS.productsLimit);
    return {
      limit: limitMatch ? parseInt(limitMatch[1], 10) : undefined,
    };
  },

  collection_products: (content: string) => {
    const collectionMatch = content.match(
      new RegExp(`collections\\.([a-zA-Z0-9_-]+)\\.products[^}]*limit:\\s*(\\d+)`, 'i')
    );
    if (collectionMatch) {
      return {
        collectionHandle: collectionMatch[1],
        limit: parseInt(collectionMatch[2], 10),
      };
    }

    const collectionOnlyMatch = content.match(LIQUID_COLLECTION_ACCESS_PATTERNS.collectionProducts);
    return collectionOnlyMatch ? { collectionHandle: collectionOnlyMatch[1], limit: 8 } : { limit: 8 };
  },

  collections: (content: string) => {
    const limitMatch = content.match(LIQUID_FILTER_PATTERNS.collectionsLimit);
    return {
      limit: limitMatch ? parseInt(limitMatch[1], 10) : undefined,
    };
  },

  // Nuevos extractores para acceso específico
  specific_collection: (content: string) => {
    const handles: string[] = [];

    const bracketMatches = content.match(LIQUID_COLLECTION_ACCESS_PATTERNS.bracketNotation);
    if (bracketMatches) {
      bracketMatches.forEach((match) => {
        const handleMatch = match.match(LIQUID_COLLECTION_ACCESS_PATTERNS.bracketNotation);
        if (handleMatch) handles.push(handleMatch[1]);
      });
    }

    const dotMatches = content.match(LIQUID_COLLECTION_ACCESS_PATTERNS.dotNotation);
    if (dotMatches) {
      dotMatches.forEach((match) => {
        const handleMatch = match.match(LIQUID_COLLECTION_ACCESS_PATTERNS.extractCollectionHandle);
        if (handleMatch && !handles.includes(handleMatch[1])) {
          handles.push(handleMatch[1]);
        }
      });
    }

    return { handles };
  },

  specific_product: (content: string) => {
    const handles: string[] = [];

    const bracketMatches = content.match(LIQUID_COLLECTION_ACCESS_PATTERNS.specificProduct);
    if (bracketMatches) {
      bracketMatches.forEach((match) => {
        const handleMatch = match.match(LIQUID_COLLECTION_ACCESS_PATTERNS.specificProduct);
        if (handleMatch) handles.push(handleMatch[1]);
      });
    }

    return { handles };
  },

  products_by_collection: (content: string) => {
    const handles: string[] = [];
    const limitMatch = content.match(LIQUID_FILTER_PATTERNS.generalLimit);
    const limit = limitMatch ? parseInt(limitMatch[1], 10) : 8;

    const collectionRefs = content.match(LIQUID_COLLECTION_ACCESS_PATTERNS.collectionProducts);
    if (collectionRefs) {
      collectionRefs.forEach((ref) => {
        const handleMatch = ref.match(LIQUID_COLLECTION_ACCESS_PATTERNS.extractCollectionHandle);
        if (handleMatch && !handles.includes(handleMatch[1])) {
          handles.push(handleMatch[1]);
        }
      });
    }

    return { handles, limit };
  },

  related_products: (content: string) => {
    const limitMatch = content.match(LIQUID_FILTER_PATTERNS.productRelated);
    return {
      limit: limitMatch ? parseInt(limitMatch[1], 10) : 4,
    };
  },

  specific_page: (content: string) => {
    const handles: string[] = [];

    const bracketMatches = content.match(LIQUID_COLLECTION_ACCESS_PATTERNS.extractPagesBracket);
    if (bracketMatches) {
      bracketMatches.forEach((match) => {
        const handleMatch = match.match(LIQUID_COLLECTION_ACCESS_PATTERNS.pagesBracketExtract);
        if (handleMatch) handles.push(handleMatch[1]);
      });
    }

    const dotMatches = content.match(LIQUID_COLLECTION_ACCESS_PATTERNS.extractPagesDot);
    if (dotMatches) {
      dotMatches.forEach((match) => {
        const handleMatch = match.match(LIQUID_COLLECTION_ACCESS_PATTERNS.extractPagesHandle);
        if (handleMatch && !handles.includes(handleMatch[1])) {
          handles.push(handleMatch[1]);
        }
      });
    }

    return { handles };
  },

  pages: (content: string) => {
    const limitMatch = content.match(LIQUID_PAGINATION_PATTERNS.pagesLimit);
    return {
      limit: limitMatch ? parseInt(limitMatch[1], 10) : 10,
    };
  },

  policies: (content: string) => {
    // Las políticas generalmente no se paginan, se cargan todas.
    // Podríamos añadir un límite si fuera necesario en el futuro.
    return {};
  },

  product: () => ({}),
  collection: () => ({}),
  linklists: () => ({}),
  shop: () => ({}),
  page: (content: string) => {
    const handles: string[] = [];

    const bracketMatches = content.match(LIQUID_COLLECTION_ACCESS_PATTERNS.extractPagesBracket);
    if (bracketMatches) {
      bracketMatches.forEach((match) => {
        const handleMatch = match.match(LIQUID_COLLECTION_ACCESS_PATTERNS.pagesBracketExtract);
        if (handleMatch) handles.push(handleMatch[1]);
      });
    }

    const dotMatches = content.match(LIQUID_COLLECTION_ACCESS_PATTERNS.extractPagesDot);
    if (dotMatches) {
      dotMatches.forEach((match) => {
        const handleMatch = match.match(LIQUID_COLLECTION_ACCESS_PATTERNS.extractPagesHandle);
        if (handleMatch && !handles.includes(handleMatch[1])) {
          handles.push(handleMatch[1]);
        }
      });
    }

    return handles.length > 0 ? { handles } : {};
  },
  blog: () => ({}),
  pagination: () => ({}),
  checkout: () => ({}),
  checkout_confirmation: () => ({}),
};

/**
 * Detectores de objetos Liquid declarativos
 */
const objectDetectors: Record<DataRequirement, ObjectDetector> = {
  products: {
    pattern: LIQUID_OBJECT_PATTERNS.products,
    optionsExtractor: loadOptionsExtractors.products,
  },
  collection_products: {
    pattern: LIQUID_COLLECTION_ACCESS_PATTERNS.collectionProducts,
    optionsExtractor: loadOptionsExtractors.collection_products,
  },
  collections: {
    pattern: LIQUID_OBJECT_PATTERNS.collections,
    optionsExtractor: loadOptionsExtractors.collections,
  },
  specific_collection: {
    pattern: LIQUID_COLLECTION_ACCESS_PATTERNS.specificAccess,
    optionsExtractor: loadOptionsExtractors.specific_collection,
  },
  specific_product: {
    pattern: LIQUID_COLLECTION_ACCESS_PATTERNS.specificProduct,
    optionsExtractor: loadOptionsExtractors.specific_product,
  },
  products_by_collection: {
    pattern: LIQUID_COLLECTION_ACCESS_PATTERNS.collectionProducts,
    optionsExtractor: loadOptionsExtractors.products_by_collection,
  },
  related_products: {
    pattern: LIQUID_OBJECT_PATTERNS.relatedProducts,
    optionsExtractor: loadOptionsExtractors.related_products,
  },
  product: {
    pattern: LIQUID_OBJECT_PATTERNS.product,
    optionsExtractor: loadOptionsExtractors.product,
  },
  collection: {
    pattern: LIQUID_OBJECT_PATTERNS.collection,
    optionsExtractor: loadOptionsExtractors.collection,
  },
  linklists: {
    pattern: LIQUID_OBJECT_PATTERNS.linklists,
    optionsExtractor: loadOptionsExtractors.linklists,
  },
  shop: {
    pattern: LIQUID_OBJECT_PATTERNS.shop,
    optionsExtractor: loadOptionsExtractors.shop,
  },
  specific_page: {
    pattern: LIQUID_COLLECTION_ACCESS_PATTERNS.specificPage,
    optionsExtractor: loadOptionsExtractors.specific_page,
  },
  pages: {
    pattern: LIQUID_OBJECT_PATTERNS.pages,
    optionsExtractor: loadOptionsExtractors.pages,
  },
  policies: {
    pattern: LIQUID_PAGINATION_PATTERNS.policies,
    optionsExtractor: loadOptionsExtractors.policies,
  },
  page: {
    pattern: LIQUID_OBJECT_PATTERNS.page,
    optionsExtractor: loadOptionsExtractors.page,
  },
  blog: {
    pattern: LIQUID_OBJECT_PATTERNS.blog,
    optionsExtractor: loadOptionsExtractors.blog,
  },
  pagination: {
    pattern: LIQUID_OBJECT_PATTERNS.pagination,
    optionsExtractor: loadOptionsExtractors.pagination,
  },
  checkout: {
    pattern: LIQUID_OBJECT_PATTERNS.checkout,
    optionsExtractor: loadOptionsExtractors.checkout,
  },
  checkout_confirmation: {
    pattern: LIQUID_OBJECT_PATTERNS.checkout,
    optionsExtractor: loadOptionsExtractors.checkout_confirmation,
  },
};

export class LiquidSyntaxDetector {
  private static readonly TAG_PATTERNS = LIQUID_TAG_PATTERNS;

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
    const match = content.match(LIQUID_PAGINATION_PATTERNS.paginate);

    if (match) {
      analysis.hasPagination = true;
      const paginatedObject = match[1].split(LIQUID_FILTER_PATTERNS.paginateBy)[0];

      if (paginatedObject.includes('products')) {
        analysis.requiredData.set('products', {});
      } else if (paginatedObject.includes('collections')) {
        analysis.requiredData.set('collections', {});
      }
      analysis.requiredData.set('pagination', {});
    }
  }

  public static detectDependencies(content: string, analysis: TemplateAnalysis): void {
    this.extractMatches(content, this.TAG_PATTERNS.section, (match) => {
      const sectionName = this.extractName(match, LIQUID_OPTION_EXTRACTOR_PATTERNS.sectionName);
      if (sectionName) {
        analysis.usedSections.push(sectionName);
        analysis.dependencies.push(`sections/${sectionName}.liquid`);
      }
    });

    const snippetPatterns = [this.TAG_PATTERNS.render, this.TAG_PATTERNS.include];
    for (const pattern of snippetPatterns) {
      this.extractMatches(content, pattern, (match) => {
        const snippetName = this.extractName(match, LIQUID_OPTION_EXTRACTOR_PATTERNS.snippetName);
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
