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

// ===== FACTORY PRINCIPAL =====
export { StoreRendererFactory } from './factories/store-renderer-factory';
export { storeRenderer } from './instances';

// ===== RENDERERS =====
export { DynamicPageRenderer } from './renderers/dynamic-page-renderer';

// ===== LIQUID ENGINE =====
export { liquidEngine } from './liquid/engine';

// ===== SERVICIOS CORE =====
export { domainResolver } from './services/core/domain-resolver';
export { linkListService } from './services/core/navigation-service';

// ===== SERVICIOS DE ERRORES =====
export { errorRenderer } from './services/errors/error-renderer';

// ===== SERVICIOS DE DATOS =====
export { dataFetcher } from './services/fetchers/data-fetcher';
export { navigationFetcher } from './services/fetchers/navigation-fetcher';

// ===== SERVICIOS DE PLANTILLAS =====
export { templateAnalyzer } from './services/templates/analysis/template-analyzer';
export { templateLoader } from './services/templates/template-loader';

// ===== SERVICIOS DINÁMICOS =====
export { dynamicDataLoader } from './services/page/dynamic-data-loader';

// ===== CONFIGURACIÓN =====
export { pathToRenderOptions, routeMatchers } from './config/route-matchers';
export type { RouteMatcher } from './config/route-matchers';

// ===== TIPOS PRINCIPALES =====
export type { RenderResult } from './types';

// ===== TIPOS DEL SISTEMA DINÁMICO =====
export type { DynamicLoadResult } from './services/page/dynamic-data-loader';
export type {
  DataLoadOptions,
  DataRequirement,
  TemplateAnalysis,
} from './services/templates/analysis/template-analyzer';
