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
export { StoreRendererFactory } from '@/renderer-engine/factories/store-renderer-factory';
export { storeRenderer } from '@/renderer-engine/instances';

// ===== RENDERERS =====
export { DynamicPageRenderer } from '@/renderer-engine/renderers/dynamic-page-renderer';

// ===== LIQUID ENGINE =====
export { liquidEngine } from '@/renderer-engine/liquid/engine';

// ===== SERVICIOS CORE =====
export { domainResolver } from '@/renderer-engine/services/core/domain-resolver';
export { linkListService } from '@/renderer-engine/services/core/navigation-service';

// ===== SERVICIOS DE ERRORES =====
export { errorRenderer } from '@/renderer-engine/services/errors/error-renderer';

// ===== SERVICIOS DE DATOS =====
export { dataFetcher } from '@/renderer-engine/services/fetchers/data-fetcher';
export { navigationFetcher } from '@/renderer-engine/services/fetchers/navigation-fetcher';

// ===== SERVICIOS DE PLANTILLAS =====
export { templateAnalyzer } from '@/renderer-engine/services/templates/analysis/template-analyzer';
export { templateLoader } from '@/renderer-engine/services/templates/template-loader';

// ===== SERVICIOS DINÁMICOS =====
export { dynamicDataLoader } from '@/renderer-engine/services/page/dynamic-data-loader';

// ===== CONFIGURACIÓN =====
export { pathToRenderOptions, routeMatchers } from '@/renderer-engine/config/route-matchers';
export type { RouteMatcher } from '@/renderer-engine/config/route-matchers';

// ===== TIPOS PRINCIPALES =====
export type { RenderResult } from '@/renderer-engine/types';

// ===== TIPOS DEL SISTEMA DINÁMICO =====
export type { DynamicLoadResult } from '@/renderer-engine/services/page/dynamic-data-loader';
export type {
  DataLoadOptions,
  DataRequirement,
  TemplateAnalysis,
} from '@/renderer-engine/services/templates/analysis/template-analyzer';
