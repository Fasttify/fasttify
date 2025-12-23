/**
 * Escáner de estructura de temas Shopify
 */

import fs from 'fs';
import path from 'path';
import type { ThemeFile, ThemeStructure, ShopifyTheme } from '../types/theme-types';
import { FileType } from '../types/theme-types';
import { detectFileType, readFile, findFiles, isDirectory, getRelativePath } from '../utils/file-utils';
import { logger } from '../utils/logger';

const SHOPIFY_DIRECTORIES = ['layout', 'templates', 'sections', 'snippets', 'assets', 'config', 'locales'] as const;

const SHOPIFY_FILE_PATTERNS = {
  layout: ['layout/**/*.liquid'],
  templates: ['templates/**/*.{liquid,json}'],
  sections: ['sections/**/*.{liquid,json}'],
  snippets: ['snippets/**/*.liquid'],
  assets: ['assets/**/*'],
  config: ['config/**/*.json'],
  locales: ['locales/**/*.json'],
};

export class ThemeScanner {
  /**
   * Escanea un tema Shopify y retorna su estructura
   */
  async scanTheme(themePath: string): Promise<ShopifyTheme> {
    logger.info(`Escaneando tema Shopify en: ${themePath}`);

    if (!fs.existsSync(themePath)) {
      throw new Error(`El directorio del tema no existe: ${themePath}`);
    }

    if (!isDirectory(themePath)) {
      throw new Error(`La ruta proporcionada no es un directorio: ${themePath}`);
    }

    const structure: ThemeStructure = {
      layout: [],
      templates: [],
      sections: [],
      snippets: [],
      assets: [],
      config: [],
      locales: [],
    };

    // Escanear cada directorio
    for (const dir of SHOPIFY_DIRECTORIES) {
      const dirPath = path.join(themePath, dir);
      if (!fs.existsSync(dirPath)) {
        logger.debug(`Directorio no encontrado: ${dir}`);
        continue;
      }

      const patterns = SHOPIFY_FILE_PATTERNS[dir];
      const files = await findFiles(themePath, patterns, { recursive: true });

      for (const file of files) {
        const fullPath = path.join(themePath, file);
        const relativePath = getRelativePath(fullPath, themePath);
        const type = detectFileType(fullPath);

        try {
          const content = type === FileType.IMAGE || type === FileType.FONT ? '' : readFile(fullPath);

          const themeFile: ThemeFile = {
            path: fullPath,
            relativePath,
            content,
            type,
          };

          structure[dir].push(themeFile);
          logger.debug(`Archivo encontrado: ${relativePath}`);
        } catch (error) {
          logger.warn(`Error leyendo archivo ${fullPath}:`, error);
        }
      }
    }

    // Leer metadata si existe
    const metadata = this.readMetadata(themePath);

    const totalFiles =
      structure.layout.length +
      structure.templates.length +
      structure.sections.length +
      structure.snippets.length +
      structure.assets.length +
      structure.config.length +
      structure.locales.length;

    logger.info(`Tema escaneado: ${totalFiles} archivos encontrados`);
    logger.info(`  - Layout: ${structure.layout.length}`);
    logger.info(`  - Templates: ${structure.templates.length}`);
    logger.info(`  - Sections: ${structure.sections.length}`);
    logger.info(`  - Snippets: ${structure.snippets.length}`);
    logger.info(`  - Assets: ${structure.assets.length}`);
    logger.info(`  - Config: ${structure.config.length}`);
    logger.info(`  - Locales: ${structure.locales.length}`);

    return {
      path: themePath,
      structure,
      metadata,
    };
  }

  /**
   * Lee metadata del tema desde config/settings_schema.json si existe
   */
  private readMetadata(themePath: string): ShopifyTheme['metadata'] {
    const settingsSchemaPath = path.join(themePath, 'config', 'settings_schema.json');
    if (!fs.existsSync(settingsSchemaPath)) {
      return undefined;
    }

    try {
      const content = readFile(settingsSchemaPath);
      const schema = JSON.parse(content);

      // Buscar theme_info en el schema
      const themeInfo = Array.isArray(schema)
        ? schema.find((item: { name?: string }) => item.name === 'theme_info')
        : null;

      if (themeInfo) {
        return {
          name: themeInfo.theme_name,
          version: themeInfo.theme_version,
          author: themeInfo.theme_author,
          description: themeInfo.theme_description,
        };
      }
    } catch (error) {
      logger.warn('Error leyendo metadata del tema:', error);
    }

    return undefined;
  }
}
