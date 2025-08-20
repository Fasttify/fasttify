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

// Exportaciones principales
export { loadDataFromAnalysis } from './data-fetcher-helper';

// Exportaciones de handlers
export { dataHandlers, loadSpecificData, type DataHandler } from './handlers/data-handlers';

// Exportaciones de procesadores
export { responseProcessors, type ResponseProcessor } from './handlers/response-processors';

// Exportaciones de límites de búsqueda
export { extractSearchLimitsFromSettings } from './search/search-limits-extractor';

// Exportaciones de cargadores especializados
export { coreDataLoader } from './core/core-data-loader';
export { searchDataLoader } from './search/search-data-loader';
