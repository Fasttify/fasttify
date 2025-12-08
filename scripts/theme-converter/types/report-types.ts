/**
 * Tipos para reportes de conversión
 */

import type { ConversionStatistics, ConversionIssue, Transformation } from './conversion-types';

export interface ConversionReport {
  metadata: ReportMetadata;
  summary: ConversionSummary;
  files: FileConversionReport[];
  issues: ConversionIssue[];
  statistics: ConversionStatistics;
  manualReviewItems: ManualReviewItem[];
  incompatibilities: Incompatibility[];
  recommendations: string[];
}

export interface ReportMetadata {
  generatedAt: string;
  sourceTheme: string;
  outputTheme: string;
  converterVersion: string;
  conversionTime: number;
}

export interface ConversionSummary {
  totalFiles: number;
  convertedFiles: number;
  skippedFiles: number;
  failedFiles: number;
  successRate: number;
  hasErrors: boolean;
  hasWarnings: boolean;
  requiresManualReview: boolean;
}

export interface FileConversionReport {
  originalPath: string;
  convertedPath: string;
  type: string;
  status: FileConversionStatus;
  transformations: Transformation[];
  warnings: string[];
  errors: string[];
  size: {
    original: number;
    converted: number;
  };
}

export enum FileConversionStatus {
  SUCCESS = 'success',
  PARTIAL = 'partial',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export interface ManualReviewItem {
  file: string;
  type: ManualReviewType;
  description: string;
  originalCode?: string;
  suggestions?: string[];
  priority: ReviewPriority;
}

export enum ManualReviewType {
  JAVASCRIPT = 'javascript',
  INCOMPATIBLE_FEATURE = 'incompatible_feature',
  CUSTOM_LOGIC = 'custom_logic',
  MISSING_REFERENCE = 'missing_reference',
  COMPLEX_TRANSFORMATION = 'complex_transformation',
}

export enum ReviewPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export interface Incompatibility {
  element: string;
  type: IncompatibilityType;
  description: string;
  impact: string;
  workaround?: string;
  file?: string;
}

export enum IncompatibilityType {
  UNSUPPORTED_FILTER = 'unsupported_filter',
  UNSUPPORTED_TAG = 'unsupported_tag',
  UNSUPPORTED_VARIABLE = 'unsupported_variable',
  UNSUPPORTED_FEATURE = 'unsupported_feature',
  STRUCTURE_DIFFERENCE = 'structure_difference',
}
