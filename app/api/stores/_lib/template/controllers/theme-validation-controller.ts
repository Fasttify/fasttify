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

import { SchemaParser } from '@/liquid-forge/services/templates/parsing/schema-parser';
import { ThemeValidator } from '@/liquid-forge/services/themes';
import type { ThemeFile, ValidationResult } from '@/liquid-forge/services/themes/types';
import { cookiesClient } from '@/utils/client/AmplifyUtils';
import { getCdnBaseUrl } from '@/utils/server';
import type { StoreConfig } from '@/api/stores/template/types';

export class ThemeValidationController {
  private validator: ThemeValidator;

  constructor() {
    this.validator = ThemeValidator.getInstance();
  }

  /**
   * Valida archivos de tema y extrae información del schema
   */
  async validateAndExtractThemeInfo(
    themeFiles: ThemeFile[],
    storeId: string
  ): Promise<{
    validation: ValidationResult;
    themeInfo: any;
  }> {
    // Validar los archivos del tema
    const validation = await this.validator.validateThemeFiles(themeFiles, storeId);

    // Extraer metadatos del tema desde config/settings_schema.json
    const themeInfo = this.extractThemeInfoFromSchema(themeFiles);

    return {
      validation,
      themeInfo,
    };
  }

  /**
   * Crea un registro de tema en la base de datos
   */
  async createThemeRecord(
    storeId: string,
    storeConfig: StoreConfig,
    themeFiles: ThemeFile[],
    validation: ValidationResult,
    themeInfo: any,
    previewUrl: string | null,
    fileCount: number,
    username: string
  ): Promise<void> {
    try {
      const s3FolderKey = `templates/${storeId}`;
      const baseUrl = getCdnBaseUrl();

      const totalBytes = themeFiles.reduce((sum, f) => sum + (Number(f.size) || 0), 0);

      const themeRecord = {
        storeId,
        name: themeInfo.name || `${storeConfig.storeData?.theme || 'Default'} Theme`,
        version: themeInfo.version || '1.0.0',
        author: themeInfo.author || 'System',
        description: themeInfo.description || storeConfig.storeData?.description || 'Tema inicial de la tienda',
        s3Key: s3FolderKey,
        cdnUrl: `${baseUrl}/${s3FolderKey}/theme.zip`,
        fileCount,
        totalSize: totalBytes,
        isActive: true,
        settings: JSON.stringify({
          name: themeInfo.name || `${storeConfig.storeData?.theme || 'Default'} Theme`,
          version: themeInfo.version || '1.0.0',
          settings_schema: themeInfo.settings_schema || [],
          settings_defaults: themeInfo.settings_defaults || {},
        }),
        validation: JSON.stringify(validation),
        analysis: JSON.stringify(validation.analysis || {}),
        preview: previewUrl,
        owner: username,
      };

      await cookiesClient.models.UserTheme.create(themeRecord as any);
    } catch (error) {
      console.error('Failed to create initial theme record in DB:', error);
      throw error;
    }
  }

  /**
   * Extrae información del tema desde el archivo de schema
   */
  private extractThemeInfoFromSchema(themeFiles: ThemeFile[]): any {
    const settingsFile = themeFiles.find(
      (f) =>
        f.path === 'config/settings_schema.json' ||
        f.path.endsWith('/config/settings_schema.json') ||
        f.path.includes('/config/settings_schema.json')
    );

    if (!settingsFile || typeof settingsFile.content !== 'string') {
      return {};
    }

    try {
      const parser = new SchemaParser();
      return parser.extractThemeInfo(settingsFile.content as string);
    } catch (error) {
      console.error('Failed to parse theme schema:', error);
      return {};
    }
  }
}
