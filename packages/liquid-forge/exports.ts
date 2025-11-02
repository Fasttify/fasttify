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

export { StoreRendererFactory } from './factories/store-renderer-factory';
export { storeRenderer } from './instances';
export { logger } from './lib';
export { DynamicPageRenderer } from './renderers/dynamic-page-renderer';

export { liquidEngine } from './liquid/engine';
export { LiquidCompiler, compileTemplate, LiquidInstanceFactory, SharedLiquidInstance } from './compiler';

export { domainResolver } from './services/core/domain-resolver';
export { linkListService } from './services/core/navigation-service';

export { errorRenderer } from './services/errors/error-renderer';

export { dataFetcher } from './services/fetchers/data-fetcher';
export { navigationFetcher } from './services/fetchers/navigation';

export { templateAnalyzer } from './services/templates/analysis/template-analyzer';
export { templateLoader } from './services/templates/template-loader';
export { dataTransformer } from './services/core/data-transformer';
export { searchProductsByTerm } from './services/page/data-loader/search/search-data-loader';
export { dynamicDataLoader } from './services/page/dynamic-data-loader';

export { analyticsWebhookService } from './services/analytics';
export { storeViewsTracker } from './services/analytics/store-views-tracker.service';
export { pathToRenderOptions, routeMatchers } from './config/route-matchers';
export type { RouteMatcher } from './config/route-matchers';

export { PostCSSProcessor } from './services/themes/optimization/postcss-processor';
export type { PostCSSOptions, ProcessingResult } from './services/themes/optimization/postcss-processor';

export { ThemeValidator } from './services/themes/core/theme-validator';
export { ThemeProcessor } from './services/themes/core/theme-processor';

export { S3StorageService } from './services/themes/storage/s3-storage-service';

export { EmailNotificationService } from './services/notifications/email-notification-service';
export { EmailFormattingUtils } from './services/notifications/email-formatting-utils';

export { SchemaParser } from './services/templates/parsing/schema-parser';

export { getOrderStatus, getPaymentStatus } from './services/notifications/status-translations';

export type {
  ExtractionResult,
  ProcessingStep,
  ProcessingPipeline,
  FileProcessingOptions,
  AssetProcessingOptions,
  TemplateProcessingOptions,
} from './services/themes/types/processing-types';

export type {
  ThemeFile,
  ThemeFileType,
  ThemeAsset,
  ThemeSection,
  ThemeTemplate,
  ThemeSettings,
  ProcessedTheme,
  ThemeProcessingOptions,
  ThemeStorageResult,
  Theme,
} from './services/themes/types/theme-types';

export type {
  ValidationError,
  ValidationWarning,
  ValidationResult,
  ThemeValidationConfig,
  ValidationRule,
  ValidationRuleConfig,
} from './services/themes/types/validation-types';

export type { RenderResult } from './types';

export type { DynamicLoadResult } from './services/page/dynamic-data-loader';
export type {
  DataLoadOptions,
  DataRequirement,
  TemplateAnalysis,
} from './services/templates/analysis/template-analyzer';
