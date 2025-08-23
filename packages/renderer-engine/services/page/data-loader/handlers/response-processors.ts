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

import type { DataRequirement } from '@/renderer-engine/services/templates/analysis/template-analyzer';
import type { PaginationInfo } from '@/renderer-engine/types/template';

/**
 * Tipo para procesadores de respuesta de datos
 */
export type ResponseProcessor = (
  data: any,
  dataType: DataRequirement,
  loadedData: Record<string, any>,
  paginationInfo: PaginationInfo
) => void;

/**
 * Procesadores declarativos para respuestas de datos
 */
export const responseProcessors: Record<DataRequirement, ResponseProcessor> = {
  products: (data, dataType, loadedData, paginationInfo) => {
    if (typeof data === 'object' && 'products' in data) {
      loadedData[dataType] = data.products;
      if (data.nextToken) paginationInfo.nextToken = data.nextToken;
      if (data.totalCount) paginationInfo.totalItems = data.totalCount;
    } else {
      loadedData[dataType] = data;
    }
  },

  collections: (data, dataType, loadedData, paginationInfo) => {
    if (typeof data === 'object' && 'collections' in data) {
      loadedData[dataType] = data.collections;
      if (data.nextToken) paginationInfo.nextToken = data.nextToken;
      if (data.totalCount) paginationInfo.totalItems = data.totalCount;
    } else {
      loadedData[dataType] = data;
    }
  },

  collection: (data, dataType, loadedData, paginationInfo) => {
    if (typeof data === 'object' && 'nextToken' in data) {
      loadedData.collection = data;
      if (data.nextToken) paginationInfo.nextToken = data.nextToken;
    } else {
      loadedData[dataType] = data;
    }
  },

  specific_collection: (data, dataType, loadedData) => {
    if (!loadedData.collections_map) {
      loadedData.collections_map = {};
    }
    Object.assign(loadedData.collections_map, data);
  },

  specific_product: (data, dataType, loadedData) => {
    if (!loadedData.products_map) {
      loadedData.products_map = {};
    }
    Object.assign(loadedData.products_map, data);
  },

  products_by_collection: (data, dataType, loadedData) => {
    if (!loadedData.collection_products_map) {
      loadedData.collection_products_map = {};
    }
    Object.assign(loadedData.collection_products_map, data);
  },

  // Para estos tipos, simplemente asignar directamente
  collection_products: (data, dataType, loadedData) => {
    loadedData[dataType] = data;
  },

  product: (data, dataType, loadedData) => {
    loadedData[dataType] = data;
  },

  linklists: (data, dataType, loadedData) => {
    loadedData[dataType] = data;
  },

  shop: (data, dataType, loadedData) => {
    loadedData[dataType] = data;
  },

  page: (data, dataType, loadedData) => {
    loadedData[dataType] = data;
  },

  policies: (data, dataType, loadedData) => {
    loadedData[dataType] = data;
  },

  blog: (data, dataType, loadedData) => {
    loadedData[dataType] = data;
  },

  pagination: (data, dataType, loadedData) => {},

  related_products: (data, dataType, loadedData) => {
    loadedData[dataType] = data;
  },

  specific_page: (data, dataType, loadedData) => {
    if (!loadedData.pages_map) {
      loadedData.pages_map = {};
    }
    Object.assign(loadedData.pages_map, data);
  },

  pages: (data, dataType, loadedData, paginationInfo) => {
    if (typeof data === 'object' && 'pages' in data) {
      loadedData[dataType] = data.pages;
      if (data.nextToken) paginationInfo.nextToken = data.nextToken;
      if (data.totalCount) paginationInfo.totalItems = data.totalCount;
    } else {
      loadedData[dataType] = data;
    }
  },

  checkout: (data, dataType, loadedData) => {
    loadedData[dataType] = data;
  },
};
