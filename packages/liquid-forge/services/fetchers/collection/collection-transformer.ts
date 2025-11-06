/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { dataTransformer } from '../../core/data-transformer';
import type { CollectionContext, ProductContext } from '../../../types';
import type { CollectionData } from './types/collection-types';

export class CollectionTransformer {
  /**
   * Transforma una colección de Amplify al formato Liquid
   */
  public transformCollection(
    collection: CollectionData,
    products: ProductContext[],
    nextToken: string | null | undefined,
    totalCount?: number | undefined
  ): CollectionContext {
    const handle = dataTransformer.createHandle(
      collection.slug || collection.name || collection.title || `collection-${collection.id}`
    );

    // Preservar URL completa de imagen si existe, de lo contrario usar fallback
    const imageValue = collection.image && collection.image.trim() !== '' ? collection.image : 'collection-img';

    return {
      id: collection.id,
      storeId: collection.storeId,
      title: collection.title,
      description: collection.description,
      slug: handle,
      url: `/collections/${handle}`,
      image: imageValue,
      products,
      nextToken,
      owner: collection.owner,
      sortOrder: collection.sortOrder,
      isActive: collection.isActive,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      products_count: totalCount,
    };
  }

  /**
   * Transforma múltiples colecciones
   */
  public transformCollections(collections: CollectionData[]): CollectionContext[] {
    return collections.map((collection) => this.transformCollection(collection, [], null, 0));
  }
}

export const collectionTransformer = new CollectionTransformer();
