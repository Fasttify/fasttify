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

import { TemplateAnalysis } from '@/liquid-forge/exports';
import { RendererLogger } from '@/liquid-forge/lib/logger';
import { SchemaParser } from '@/liquid-forge/services/templates/parsing/schema-parser';
import { PostCSSProcessor } from '../optimization/postcss-processor';
import JSZip from 'jszip';
import type {
  ProcessedTheme,
  ThemeAsset,
  ThemeFile,
  ThemeProcessingOptions,
  ThemeSection,
  ThemeSettings,
  ThemeTemplate,
  ValidationResult,
} from '../types';

/**
 * Procesador de temas que extrae y organiza archivos
 */
export class ThemeProcessor {
  private static instance: ThemeProcessor;
  private logger = RendererLogger;
  private postcssProcessor = PostCSSProcessor.getInstance();

  private defaultOptions: ThemeProcessingOptions = {
    validateSyntax: true,
    optimizeAssets: true,
    generatePreview: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedFileTypes: [
      '.liquid',
      '.json',
      '.css',
      '.js',
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.svg',
      '.woff',
      '.woff2',
      '.ttf',
      '.eot',
    ],
    maxFiles: 1000,
  };

  private constructor() {}

  public static getInstance(): ThemeProcessor {
    if (!ThemeProcessor.instance) {
      ThemeProcessor.instance = new ThemeProcessor();
    }
    return ThemeProcessor.instance;
  }

  /**
   * Procesa un archivo ZIP de tema
   */
  public async processThemeFile(
    zipFile: File,
    storeId: string,
    options?: ThemeProcessingOptions
  ): Promise<ProcessedTheme> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      // 1. Extraer archivos del ZIP
      const files = await this.extractZipFiles(zipFile);

      // 2. Validar estructura del ZIP
      this.validateZipStructure(files);

      // 3. Procesar archivos
      const processedFiles = await this.processFiles(files);

      // 4. Extraer configuración
      const settings = this.extractThemeSettings(processedFiles);

      // 5. Organizar assets
      const assets = this.processAssets(processedFiles);

      // 6. Organizar secciones
      const sections = this.processSections(processedFiles);

      // 7. Organizar templates
      const templates = this.processTemplates(processedFiles);

      // 8. Generar ID único
      const themeId = this.generateThemeId(settings.name, storeId);

      // 9. Calcular tamaño total
      const totalSize = processedFiles.reduce((sum, file) => sum + file.size, 0);

      // 10. Crear tema procesado
      const processedTheme: ProcessedTheme = {
        id: themeId,
        name: settings.name,
        version: settings.version,
        author: settings.author,
        description: settings.description,
        files: processedFiles,
        assets,
        sections,
        templates,
        settings,
        analysis: null as unknown as TemplateAnalysis,
        validation: null as unknown as ValidationResult,
        preview: undefined,
        totalSize,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return processedTheme;
    } catch (error) {
      this.logger.error('Error processing theme file', error, 'ThemeProcessor');
      throw new Error(`Failed to process theme: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extrae archivos de un ZIP
   */
  private async extractZipFiles(zipFile: File): Promise<ThemeFile[]> {
    const files: ThemeFile[] = [];

    try {
      // Crear instancia de JSZip
      const zip = new JSZip();

      // Convertir File a ArrayBuffer para JSZip
      const arrayBuffer = await zipFile.arrayBuffer();

      // Cargar el archivo ZIP
      const zipContent = await zip.loadAsync(arrayBuffer);

      // Obtener todos los archivos del ZIP
      const zipFiles = zipContent.files;

      // Procesar cada archivo
      for (const [filePath, zipEntry] of Object.entries(zipFiles)) {
        // Ignorar directorios y archivos ocultos
        if (zipEntry.dir || filePath.startsWith('__MACOSX/') || filePath.startsWith('.DS_Store')) {
          continue;
        }

        try {
          // Extraer contenido del archivo
          let content: string | Buffer;
          const fileExtension = this.getFileExtension(filePath);

          // Determinar si es texto o binario
          if (this.isTextFile(fileExtension)) {
            content = await zipEntry.async('string');
          } else {
            content = await zipEntry.async('nodebuffer');
          }

          // Crear objeto ThemeFile
          const themeFile: ThemeFile = {
            path: filePath,
            content: content,
            type: this.determineFileType(filePath),
            size: content instanceof Buffer ? content.length : content.length,
            lastModified: new Date(zipEntry.date),
          };

          files.push(themeFile);
        } catch (error) {
          this.logger.warn(`Failed to extract file: ${filePath}`, error, 'ThemeProcessor');
        }
      }
    } catch (error) {
      this.logger.error('Failed to extract ZIP file', error, 'ThemeProcessor');
      throw new Error(`Failed to extract ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return files;
  }

  /**
   * Procesa archivos extraídos con PostCSS para optimización
   */
  private async processFiles(files: ThemeFile[]): Promise<ThemeFile[]> {
    const processedFiles: ThemeFile[] = [];

    for (const file of files) {
      const fileType = this.determineFileType(file.path);

      // Procesar archivos CSS, JS y Liquid con PostCSS
      if (this.isProcessableFile(file.path) && (fileType === 'css' || fileType === 'js' || fileType === 'liquid')) {
        try {
          // Convertir Buffer a string si es necesario
          const content = Buffer.isBuffer(file.content) ? file.content.toString('utf-8') : file.content;
          const result = await this.postcssProcessor.processAsset(content, file.path);

          processedFiles.push({
            ...file,
            content: result.content,
            type: fileType,
            size: result.processedSize,
            lastModified: new Date(),
          });
        } catch (error) {
          // Fallback al archivo original
          processedFiles.push({
            ...file,
            type: fileType,
            lastModified: new Date(),
          });
        }
      } else {
        // Para otros tipos de archivo, no procesar
        processedFiles.push({
          ...file,
          type: fileType,
          lastModified: new Date(),
        });
      }
    }

    return processedFiles;
  }

  private isProcessableFile(path: string): boolean {
    return (
      path.endsWith('.css') ||
      path.endsWith('.css.liquid') ||
      path.endsWith('.js') ||
      path.endsWith('.js.liquid') ||
      path.endsWith('.liquid')
    );
  }

  /**
   * Determina el tipo de archivo basado en la extensión
   */
  private determineFileType(path: string): 'liquid' | 'json' | 'css' | 'js' | 'image' | 'font' | 'other' {
    const extension = path.toLowerCase().split('.').pop() || '';

    if (extension === 'liquid') return 'liquid';
    if (extension === 'json') return 'json';
    if (extension === 'css') return 'css';
    if (extension === 'js') return 'js';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension)) return 'image';
    if (['woff', 'woff2', 'ttf', 'eot', 'otf'].includes(extension)) return 'font';

    return 'other';
  }

  /**
   * Extrae configuración del tema
   */
  private extractThemeSettings(files: ThemeFile[]): ThemeSettings {
    const settingsFile = files.find(
      (f) =>
        f.path === 'config/settings_schema.json' ||
        f.path.endsWith('/config/settings_schema.json') ||
        f.path.includes('/config/settings_schema.json')
    );

    if (!settingsFile) {
      throw new Error('Missing settings_schema.json file');
    }

    try {
      const schemaParser = new SchemaParser();
      const themeInfo = schemaParser.extractThemeInfo(settingsFile.content as string);

      return {
        name: themeInfo.name || 'Untitled Theme',
        version: themeInfo.version || '1.0.0',
        author: themeInfo.author,
        description: themeInfo.description,
        homepage: themeInfo.homepage,
        support: themeInfo.support,
        license: themeInfo.license,
        settings_schema: themeInfo.settings_schema || [],
        settings_defaults: themeInfo.settings_defaults || {},
        previewUrl: themeInfo.previewUrl,
      };
    } catch (error) {
      throw new Error(`Failed to parse theme settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Procesa assets del tema
   */
  private processAssets(files: ThemeFile[]): ThemeAsset[] {
    const assets: ThemeAsset[] = [];

    for (const file of files) {
      if (file.type === 'image' || file.type === 'font' || file.path.includes('assets/')) {
        assets.push({
          path: file.path,
          type:
            file.type === 'image' ? 'image' : file.type === 'font' ? 'font' : file.path.endsWith('.css') ? 'css' : 'js',
          size: file.size,
          optimized: false,
          originalSize: file.size,
        });
      }
    }

    return assets;
  }

  /**
   * Procesa secciones del tema
   */
  private processSections(files: ThemeFile[]): ThemeSection[] {
    const sections: ThemeSection[] = [];

    for (const file of files) {
      // Buscar en cualquier subcarpeta que contenga 'sections'
      if (file.path.includes('/sections/') && file.type === 'liquid') {
        const sectionName = file.path.split('/sections/')[1]?.replace('.liquid', '') || '';

        try {
          const schemaParser = new SchemaParser();
          const settings = schemaParser.extractSchemaSettings(file.content as string);

          sections.push({
            name: sectionName,
            content: file.content as string,
            settings: settings,
            blocks: settings.blocks || [],
          });
        } catch (error) {
          // Si no hay configuración, crear sección básica
          sections.push({
            name: sectionName,
            content: file.content as string,
            settings: {},
            blocks: [],
          });
        }
      }
    }

    return sections;
  }

  /**
   * Procesa templates del tema
   */
  private processTemplates(files: ThemeFile[]): ThemeTemplate[] {
    const templates: ThemeTemplate[] = [];

    for (const file of files) {
      // Buscar en cualquier subcarpeta que contenga 'templates'
      if (file.path.includes('/templates/') && file.type === 'json') {
        const templateName = file.path.split('/templates/')[1]?.replace('.json', '') || '';

        try {
          const templateConfig = JSON.parse(file.content as string);

          templates.push({
            name: templateName,
            content: file.content as string,
            type: this.determineTemplateType(templateName),
            settings: templateConfig,
          });
        } catch (error) {
          this.logger.warn(`Failed to parse template: ${file.path}`, error, 'ThemeProcessor');
        }
      }
    }

    return templates;
  }

  /**
   * Determina el tipo de template
   */
  private determineTemplateType(templateName: string): 'index' | 'product' | 'collection' | 'page' | 'cart' | '404' {
    if (templateName === 'index') return 'index';
    if (templateName === 'product') return 'product';
    if (templateName === 'collection') return 'collection';
    if (templateName === 'page') return 'page';
    if (templateName === 'cart') return 'cart';
    if (templateName === '404') return '404';

    return 'index'; // Por defecto
  }

  /**
   * Genera ID único para el tema
   */
  private generateThemeId(name: string, storeId: string): string {
    const timestamp = Date.now();
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${sanitizedName}-${storeId}-${timestamp}`;
  }

  /**
   * Optimiza assets del tema
   */
  public async optimizeAssets(assets: ThemeAsset[]): Promise<ThemeAsset[]> {
    const optimizedAssets: ThemeAsset[] = [];

    for (const asset of assets) {
      try {
        optimizedAssets.push({
          ...asset,
          optimized: true,
        });
      } catch (error) {
        this.logger.warn(`Failed to optimize asset: ${asset.path}`, error, 'ThemeProcessor');
        optimizedAssets.push(asset); // Mantener original si falla
      }
    }

    return optimizedAssets;
  }

  /**
   * Genera preview del tema
   */
  public async generatePreview(theme: ProcessedTheme): Promise<string> {
    try {
      return `data:image/png;base64,${Buffer.from('preview-placeholder').toString('base64')}`;
    } catch (error) {
      this.logger.error('Failed to generate theme preview', error, 'ThemeProcessor');
      return '';
    }
  }

  /**
   * Configura el procesador con opciones personalizadas
   */
  public configure(options: Partial<ThemeProcessingOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  /**
   * Obtiene la extensión de un archivo
   */
  private getFileExtension(path: string): string {
    const lastDot = path.lastIndexOf('.');
    return lastDot !== -1 ? path.substring(lastDot) : '';
  }

  /**
   * Determina si un archivo es de texto basado en su extensión
   */
  private isTextFile(extension: string): boolean {
    const textExtensions = ['.liquid', '.json', '.css', '.js', '.html', '.xml', '.txt', '.md'];
    return textExtensions.includes(extension.toLowerCase());
  }

  /**
   * Valida la estructura del ZIP
   */
  private validateZipStructure(files: ThemeFile[]): void {
    const requiredFiles = ['layout/theme.liquid', 'templates/index.json', 'config/settings_schema.json'];

    // Buscar archivos en cualquier nivel del ZIP (no solo en la raíz)
    const missingFiles = requiredFiles.filter((requiredFile) => {
      return !files.some((file) => {
        // Verificar si el archivo existe en cualquier nivel
        return (
          file.path === requiredFile || file.path.endsWith(`/${requiredFile}`) || file.path.includes(`/${requiredFile}`)
        );
      });
    });

    if (missingFiles.length > 0) {
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }

    // Verificar que no hay archivos en la raíz (debe estar en carpetas)
    const rootFiles = files.filter((file) => !file.path.includes('/'));
    if (rootFiles.length > 0) {
      this.logger.warn(
        'Found files in root directory',
        {
          files: rootFiles.map((f) => f.path),
        },
        'ThemeProcessor'
      );
    }
  }
}
