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

// Exportar el fetcher principal
export { collectionFetcher } from './collection-fetcher';

// Exportar managers y utilities
export { collectionCacheManager } from './collection-cache-manager';
export { collectionQueryManager } from './collection-query-manager';
export { collectionTransformer } from './collection-transformer';

// Exportar tipos
export type * from './types/collection-types';
