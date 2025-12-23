/**
 * Convertidor de templates JSON
 * Ajusta las referencias de type para incluir la carpeta (ej: sections/<file>)
 */

import type { ConversionContext, Transformation } from '../types/conversion-types';
import { TransformationType, IssueSeverity, IssueType } from '../types/conversion-types';
import type { ThemeFile } from '../types/theme-types';

export interface TemplateConversionResult {
  convertedContent: string;
  transformations: Transformation[];
  warnings: string[];
}

export class TemplateConverter {
  private context: ConversionContext;
  private typeLookup: Map<string, string>;

  constructor(context: ConversionContext, sections: ThemeFile[], snippets: ThemeFile[]) {
    this.context = context;
    this.typeLookup = new Map<string, string>();

    // Mapear secciones: hero -> sections/hero, etc.
    sections.forEach((file) => {
      const base = this.getBaseName(file);
      const rel = this.stripExtension(file.relativePath);
      this.typeLookup.set(base, rel);
    });

    // Mapear snippets: badge -> snippets/badge
    snippets.forEach((file) => {
      const base = this.getBaseName(file);
      const rel = this.stripExtension(file.relativePath);
      this.typeLookup.set(base, rel);
    });
  }

  convert(content: string, filePath?: string): TemplateConversionResult {
    const transformations: Transformation[] = [];
    const warnings: string[] = [];

    try {
      const json = JSON.parse(content);

      this.walk(json, (node) => {
        if (node && typeof node === 'object' && typeof node.type === 'string') {
          const originalType = node.type;
          const prefixed = this.prefixType(originalType);
          if (prefixed !== originalType) {
            node.type = prefixed;
            transformations.push({
              type: TransformationType.CUSTOM_LOGIC,
              original: originalType,
              converted: prefixed,
            });
            this.context.statistics.transformations.tags++;
          }
        }

        // Normalizar blocks: Shopify los define como objeto; el renderer espera array
        if (node && typeof node === 'object' && node.blocks && !Array.isArray(node.blocks)) {
          const blocksObj = node.blocks as Record<string, any>;
          const order = Array.isArray(node.block_order) ? node.block_order : Object.keys(blocksObj);
          const blocksArray = order
            .map((key: string) => {
              const blk = blocksObj[key];
              if (blk && typeof blk === 'object') {
                return { id: key, ...blk };
              }
              return null;
            })
            .filter(Boolean);
          node.blocks = blocksArray;
        }
      });

      return {
        convertedContent: JSON.stringify(json, null, 2),
        transformations,
        warnings,
      };
    } catch (error) {
      warnings.push('No se pudo parsear el template JSON');
      this.context.issues.push({
        type: IssueType.SYNTAX_ERROR,
        severity: IssueSeverity.ERROR,
        file: filePath || 'unknown',
        message: `No se pudo parsear el template JSON: ${(error as Error).message}`,
        suggestion: 'Verificar la estructura del template',
        requiresManualReview: true,
      });

      return { convertedContent: content, transformations, warnings };
    }
  }

  private getBaseName(file: ThemeFile): string {
    const normalized = file.relativePath.replace(/\\/g, '/');
    const name = normalized.split('/').pop() || normalized;
    return name.replace(/\.liquid$|\.json$/i, '');
  }

  private stripExtension(relativePath: string): string {
    return relativePath.replace(/\\/g, '/').replace(/\.liquid$|\.json$/i, '');
  }

  private prefixType(type: string): string {
    if (type.includes('/')) {
      return type; // ya tiene prefijo explícito
    }

    const mapped = this.typeLookup.get(type);
    if (mapped) {
      return mapped;
    }

    return type;
  }

  private walk(node: any, fn: (n: any) => void): void {
    fn(node);
    if (Array.isArray(node)) {
      node.forEach((item) => this.walk(item, fn));
    } else if (node && typeof node === 'object') {
      Object.values(node).forEach((value) => this.walk(value, fn));
    }
  }
}
