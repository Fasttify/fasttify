/**
 * Tipos para el proceso de conversión
 */

import type { ThemeFile } from './theme-types';

export interface ConversionContext {
  sourcePath: string;
  outputPath: string;
  fileMap: Map<string, FileReference>;
  conversionRules: ConversionRules;
  statistics: ConversionStatistics;
  issues: ConversionIssue[];
  interactiveMode: boolean;
}

export interface FileReference {
  originalPath: string;
  originalName: string;
  convertedPath: string;
  convertedName: string;
  type: string;
}

export interface ConversionRules {
  variables: VariableMapping;
  filters: FilterMapping;
  tags: TagMapping;
  sections: SectionMapping;
  deprecated: DeprecatedElements;
  custom: CustomRules;
}

export interface VariableMapping {
  [objectType: string]: {
    [shopifyProperty: string]: string | VariableTransformer;
  };
}

export interface FilterMapping {
  [shopifyFilter: string]: string | FilterTransformer;
}

export interface TagMapping {
  [shopifyTag: string]: string | TagTransformer;
}

export interface SectionMapping {
  [shopifySection: string]: string | SectionTransformer;
}

export interface DeprecatedElements {
  variables: string[];
  filters: string[];
  tags: string[];
}

export interface CustomRules {
  skipFiles?: string[];
  renameFiles?: Record<string, string>;
  transformPaths?: Record<string, string>;
}

export type VariableTransformer = (value: string, context: ConversionContext) => string;
export type FilterTransformer = (value: string, context: ConversionContext) => string;
export type TagTransformer = (content: string, context: ConversionContext) => string;
export type SectionTransformer = (file: ThemeFile, context: ConversionContext) => ThemeFile;

export interface ConversionResult {
  file: ThemeFile;
  converted: ThemeFile;
  success: boolean;
  warnings: string[];
  errors: string[];
  transformations: Transformation[];
}

export interface Transformation {
  type: TransformationType;
  original: string;
  converted: string;
  line?: number;
  column?: number;
}

export enum TransformationType {
  VARIABLE = 'variable',
  FILTER = 'filter',
  TAG = 'tag',
  SECTION_REFERENCE = 'section_reference',
  SNIPPET_REFERENCE = 'snippet_reference',
  PATH = 'path',
  ASSET_REFERENCE = 'asset_reference',
  OTHER = 'other',
}

export interface ConversionStatistics {
  totalFiles: number;
  convertedFiles: number;
  skippedFiles: number;
  failedFiles: number;
  transformations: {
    variables: number;
    filters: number;
    tags: number;
    sections: number;
  };
  warnings: number;
  errors: number;
}

export interface ConversionIssue {
  type: IssueType;
  severity: IssueSeverity;
  file: string;
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
  requiresManualReview: boolean;
}

export enum IssueType {
  INCOMPATIBLE_ELEMENT = 'incompatible_element',
  DEPRECATED_ELEMENT = 'deprecated_element',
  MISSING_REFERENCE = 'missing_reference',
  SYNTAX_ERROR = 'syntax_error',
  STRUCTURE_ERROR = 'structure_error',
  UNKNOWN_ELEMENT = 'unknown_element',
  JAVASCRIPT_REVIEW = 'javascript_review',
  CUSTOM_LOGIC = 'custom_logic',
  COMPLEX_TRANSFORMATION = 'complex_transformation',
}

export enum IssueSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}
