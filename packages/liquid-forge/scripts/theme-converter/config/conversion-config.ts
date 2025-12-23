/**
 * Carga y maneja la configuración de conversión
 */

import fs from 'fs';
import path from 'path';
import type { ConversionRules } from '../types/conversion-types';
import { logger } from '../utils/logger';

export interface ConversionConfig {
  rules: ConversionRules;
  interactive: boolean;
  skipJavaScript: boolean;
  skipIncompatible: boolean;
  outputStructure: 'preserve' | 'reorganize';
}

const DEFAULT_MAPPINGS_PATH = path.join(__dirname, 'default-mappings.json');

export class ConversionConfigLoader {
  /**
   * Carga la configuración de conversión
   */
  static load(configPath?: string): ConversionConfig {
    const mappingsPath = configPath || DEFAULT_MAPPINGS_PATH;

    if (!fs.existsSync(mappingsPath)) {
      logger.warn(`Archivo de mapeos no encontrado: ${mappingsPath}, usando valores por defecto`);
      return this.getDefaultConfig();
    }

    try {
      const content = fs.readFileSync(mappingsPath, 'utf8');
      const mappings = JSON.parse(content);

      const rules: ConversionRules = {
        variables: mappings.variables || {},
        filters: mappings.filters || {},
        tags: mappings.tags || {},
        sections: mappings.sections || {},
        deprecated: mappings.deprecated || {
          variables: [],
          filters: [],
          tags: [],
        },
        custom: mappings.custom || {},
      };

      return {
        rules,
        interactive: false,
        skipJavaScript: true,
        skipIncompatible: false,
        outputStructure: 'preserve',
      };
    } catch (error) {
      logger.error(`Error cargando configuración desde ${mappingsPath}:`, error);
      return this.getDefaultConfig();
    }
  }

  /**
   * Retorna configuración por defecto
   */
  private static getDefaultConfig(): ConversionConfig {
    return {
      rules: {
        variables: {},
        filters: {},
        tags: {},
        sections: {},
        deprecated: {
          variables: [],
          filters: [],
          tags: [],
        },
        custom: {},
      },
      interactive: false,
      skipJavaScript: true,
      skipIncompatible: false,
      outputStructure: 'preserve',
    };
  }

  /**
   * Carga configuración personalizada desde archivo JSON
   */
  static loadCustomConfig(configPath: string): Partial<ConversionConfig> {
    if (!fs.existsSync(configPath)) {
      throw new Error(`Archivo de configuración no encontrado: ${configPath}`);
    }

    try {
      const content = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      logger.error(`Error cargando configuración personalizada:`, error);
      throw error;
    }
  }
}
