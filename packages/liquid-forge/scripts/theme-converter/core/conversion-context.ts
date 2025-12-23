/**
 * Contexto de conversión que mantiene el estado durante el proceso
 */

import type {
  ConversionContext,
  ConversionStatistics,
  ConversionIssue,
  FileReference,
  ConversionRules,
} from '../types/conversion-types';
import { IssueType, IssueSeverity } from '../types/conversion-types';
import type { ThemeFile } from '../types/theme-types';

export class ConversionContextManager {
  private context: ConversionContext;

  constructor(sourcePath: string, outputPath: string, rules: ConversionRules, interactiveMode: boolean = false) {
    this.context = {
      sourcePath,
      outputPath,
      fileMap: new Map<string, FileReference>(),
      conversionRules: rules,
      statistics: this.createEmptyStatistics(),
      issues: [],
      interactiveMode,
    };
  }

  /**
   * Agrega una referencia de archivo al mapa
   */
  addFileReference(originalPath: string, file: ThemeFile, convertedPath?: string): void {
    const fileName = file.relativePath.split('/').pop() || '';
    const fileNameWithoutExt = fileName.split('.').slice(0, -1).join('.');

    const reference: FileReference = {
      originalPath: file.path,
      originalName: fileName,
      convertedPath: convertedPath || originalPath,
      convertedName: fileName,
      type: file.type,
    };

    this.context.fileMap.set(fileName, reference);
    this.context.fileMap.set(fileNameWithoutExt, reference);
    this.context.fileMap.set(file.relativePath, reference);
  }

  /**
   * Obtiene referencia de archivo
   */
  getFileReference(key: string): FileReference | undefined {
    return this.context.fileMap.get(key);
  }

  /**
   * Registra un problema/issue
   */
  addIssue(issue: Omit<ConversionIssue, 'requiresManualReview'>): void {
    const fullIssue: ConversionIssue = {
      ...issue,
      requiresManualReview: this.requiresManualReview(issue.type),
    };

    this.context.issues.push(fullIssue);

    // Actualizar estadísticas
    if (fullIssue.severity === IssueSeverity.ERROR) {
      this.context.statistics.errors++;
    } else if (fullIssue.severity === IssueSeverity.WARNING) {
      this.context.statistics.warnings++;
    }
  }

  /**
   * Actualiza estadísticas
   */
  incrementStatistic(stat: keyof ConversionStatistics, value: number = 1): void {
    if (typeof this.context.statistics[stat] === 'number') {
      (this.context.statistics[stat] as number) += value;
    }
  }

  /**
   * Registra una transformación
   */
  recordTransformation(type: 'variables' | 'filters' | 'tags' | 'sections'): void {
    this.context.statistics.transformations[type]++;
  }

  /**
   * Obtiene el contexto completo
   */
  getContext(): ConversionContext {
    return this.context;
  }

  /**
   * Determina si un tipo de issue requiere revisión manual
   */
  private requiresManualReview(issueType: IssueType): boolean {
    return [
      IssueType.JAVASCRIPT_REVIEW,
      IssueType.INCOMPATIBLE_ELEMENT,
      IssueType.CUSTOM_LOGIC,
      IssueType.COMPLEX_TRANSFORMATION,
    ].includes(issueType);
  }

  /**
   * Crea estadísticas vacías
   */
  private createEmptyStatistics(): ConversionStatistics {
    return {
      totalFiles: 0,
      convertedFiles: 0,
      skippedFiles: 0,
      failedFiles: 0,
      transformations: {
        variables: 0,
        filters: 0,
        tags: 0,
        sections: 0,
      },
      warnings: 0,
      errors: 0,
    };
  }
}
