import type {
  ThemeFile,
  ThemeValidationConfig,
  ValidationError,
  ValidationResult,
  ValidationWarning,
} from '../../types';
import { filterAssetFiles, filterTextFiles } from '../utils/file-filters';

export class PerformanceRules {
  /**
   * Valida el tamaño de los assets
   */
  static validateAssetSizes(files: ThemeFile[], config: ThemeValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const assetFiles = filterAssetFiles(files);

    for (const asset of assetFiles) {
      // Verificar tamaño máximo de asset
      if (asset.size > config.maxAssetSize) {
        errors.push({
          type: 'performance',
          message: `Asset too large: ${asset.path} (${(asset.size / 1024 / 1024).toFixed(2)}MB)`,
          file: asset.path,
          severity: 'error',
        });
      }

      // Verificar optimización de imágenes
      if (asset.type === 'image' && asset.size > 500 * 1024) {
        // 500KB
        warnings.push({
          type: 'performance',
          message: `Large image file: ${asset.path} (${(asset.size / 1024).toFixed(2)}KB)`,
          file: asset.path,
          suggestion: 'Consider optimizing image for web',
        });
      }

      // Verificar archivos CSS grandes
      if (asset.type === 'css' && asset.size > 100 * 1024) {
        // 100KB
        warnings.push({
          type: 'performance',
          message: `Large CSS file: ${asset.path} (${(asset.size / 1024).toFixed(2)}KB)`,
          file: asset.path,
          suggestion: 'Consider splitting CSS into smaller files',
        });
      }

      // Verificar archivos JS grandes
      if (asset.type === 'js' && asset.size > 200 * 1024) {
        // 200KB
        warnings.push({
          type: 'performance',
          message: `Large JavaScript file: ${asset.path} (${(asset.size / 1024).toFixed(2)}KB)`,
          file: asset.path,
          suggestion: 'Consider splitting JavaScript into smaller files',
        });
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Valida la cantidad de archivos por tipo
   */
  static validateFileDistribution(files: ThemeFile[], config: ThemeValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const fileTypes = files.reduce(
      (acc, file) => {
        acc[file.type] = (acc[file.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Verificar demasiados archivos CSS
    if (fileTypes.css > 20) {
      warnings.push({
        type: 'performance',
        message: `Too many CSS files: ${fileTypes.css}`,
        suggestion: 'Consider consolidating CSS files',
      });
    }

    // Verificar demasiados archivos JS
    if (fileTypes.js > 15) {
      warnings.push({
        type: 'performance',
        message: `Too many JavaScript files: ${fileTypes.js}`,
        suggestion: 'Consider consolidating JavaScript files',
      });
    }

    // Verificar demasiadas imágenes
    if (fileTypes.image > 50) {
      warnings.push({
        type: 'performance',
        message: `Too many image files: ${fileTypes.image}`,
        suggestion: 'Consider optimizing and reducing image count',
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Valida el uso de recursos externos
   */
  static validateExternalResources(files: ThemeFile[], config: ThemeValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Filtrar solo archivos basados en texto
    const textFiles = filterTextFiles(files);

    for (const file of textFiles) {
      const content = file.content as string;

      // Contar recursos externos
      const externalScripts = (content.match(/<script[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/gi) || []).length;
      const externalCss = (content.match(/<link[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>/gi) || []).length;
      const externalImages = (content.match(/src=["'](https?:\/\/[^"']+)["']/gi) || []).length;

      if (externalScripts > 5) {
        warnings.push({
          type: 'performance',
          message: `Too many external scripts in ${file.path}: ${externalScripts}`,
          file: file.path,
          suggestion: 'Consider hosting scripts locally for better performance',
        });
      }

      if (externalCss > 3) {
        warnings.push({
          type: 'performance',
          message: `Too many external CSS files in ${file.path}: ${externalCss}`,
          file: file.path,
          suggestion: 'Consider hosting CSS locally for better performance',
        });
      }

      if (externalImages > 10) {
        warnings.push({
          type: 'performance',
          message: `Too many external images in ${file.path}: ${externalImages}`,
          file: file.path,
          suggestion: 'Consider hosting images locally for better performance',
        });
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Valida la estructura de carpetas para rendimiento
   */
  static validateFolderStructure(files: ThemeFile[], config: ThemeValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Verificar que los assets estén organizados
    const assetFiles = files.filter((f) => f.path.includes('assets/'));
    const unorganizedAssets = assetFiles.filter(
      (f) => !f.path.includes('assets/css/') && !f.path.includes('assets/js/') && !f.path.includes('assets/images/')
    );

    if (unorganizedAssets.length > 0) {
      warnings.push({
        type: 'performance',
        message: 'Assets not organized in subfolders',
        suggestion: 'Organize assets in css/, js/, images/ subfolders',
      });
    }

    // Verificar profundidad de carpetas
    const deepFiles = files.filter((f) => f.path.split('/').length > 4);
    if (deepFiles.length > 0) {
      warnings.push({
        type: 'performance',
        message: 'Some files are in deeply nested folders',
        suggestion: 'Consider flattening folder structure for better performance',
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Valida el uso de CDN y recursos optimizados
   */
  static validateOptimizationOpportunities(files: ThemeFile[], config: ThemeValidationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Filtrar solo archivos basados en texto
    const textFiles = filterTextFiles(files);

    for (const file of textFiles) {
      const content = file.content as string;

      // Verificar imágenes sin optimización
      const imageMatches = content.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi);
      if (imageMatches) {
        for (const match of imageMatches) {
          const src = match.match(/src=["']([^"']+)["']/)?.[1];
          if (src && !src.includes('webp') && !src.includes('optimized')) {
            warnings.push({
              type: 'performance',
              message: `Image without optimization: ${src}`,
              file: file.path,
              suggestion: 'Consider using WebP format and image optimization',
            });
          }
        }
      }

      // Verificar CSS sin minificar
      if (file.type === 'css' && content.length > 1000) {
        const hasComments = content.includes('/*') || content.includes('//');
        const hasSpaces = content.match(/\s{2,}/g);

        if (hasComments || hasSpaces) {
          warnings.push({
            type: 'performance',
            message: `CSS file not minified: ${file.path}`,
            file: file.path,
            suggestion: 'Consider minifying CSS for better performance',
          });
        }
      }

      // Verificar JS sin minificar
      if (file.type === 'js' && content.length > 1000) {
        const hasComments = content.includes('//') || content.includes('/*');
        const hasSpaces = content.match(/\s{2,}/g);

        if (hasComments || hasSpaces) {
          warnings.push({
            type: 'performance',
            message: `JavaScript file not minified: ${file.path}`,
            file: file.path,
            suggestion: 'Consider minifying JavaScript for better performance',
          });
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }
}
