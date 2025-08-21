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

import { cookiesClient } from '@/utils/server/AmplifyServer';
import type { CollectionData, CollectionQueryOptions, CollectionsResponse } from './types/collection-types';

export class CollectionQueryManager {
  /**
   * Obtiene colecciones de una tienda con filtros y paginación
   */
  public async queryStoreCollections(
    storeId: string,
    options: CollectionQueryOptions = {}
  ): Promise<CollectionsResponse> {
    const { limit = 10, nextToken, filter } = options;

    const response = await cookiesClient.models.Collection.listCollectionByStoreId(
      { storeId },
      {
        limit,
        nextToken,
        filter: {
          isActive: { eq: true },
          ...filter,
        },
      }
    );

    if (!response.data) {
      return { collections: [] };
    }

    const collections = response.data as CollectionData[];

    return {
      collections,
      nextToken: response.nextToken,
    };
  }

  /**
   * Obtiene una colección específica por ID
   */
  public async queryCollectionById(collectionId: string): Promise<CollectionData | null> {
    const { data: collection } = await cookiesClient.models.Collection.get({
      id: collectionId,
    });

    return (collection as CollectionData) || null;
  }
}

export const collectionQueryManager = new CollectionQueryManager();
