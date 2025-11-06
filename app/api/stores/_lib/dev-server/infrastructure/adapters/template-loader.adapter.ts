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

import { templateLoader } from '@/liquid-forge/services/templates/template-loader';
import type { ITemplateLoader } from '../../domain/ports/template-loader.port';
import type { Template, TemplateType } from '@fasttify/theme-studio';
import { S3Client, CopyObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const TEMPLATE_PATHS: Record<string, string> = {
  index: 'templates/index.json',
  product: 'templates/product.json',
  collection: 'templates/collection.json',
  cart: 'templates/cart.json',
  page: 'templates/page.json',
  policies: 'templates/policies.json',
  search: 'templates/search.json',
  '404': 'templates/404.json',
  checkout: 'templates/checkout.json',
  checkout_confirmation: 'templates/checkout_confirmation.json',
};

function getTemplatePath(templateType: TemplateType): string {
  return TEMPLATE_PATHS[templateType] || `templates/${templateType}.json`;
}

/**
 * Adaptador: Template Loader
 * Implementación concreta para cargar templates desde S3 usando templateLoader de liquid-forge
 */
export class TemplateLoaderAdapter implements ITemplateLoader {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.BUCKET_NAME || '';
    this.s3Client = new S3Client({
      region: process.env.REGION_BUCKET,
    });
  }

  async loadTemplate(storeId: string, templateType: TemplateType): Promise<Template> {
    const templatePath = getTemplatePath(templateType);
    const templateContent = await templateLoader.loadTemplate(storeId, templatePath);
    const templateConfig = JSON.parse(templateContent.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1'));

    return {
      type: templateType,
      sections: templateConfig.sections || {},
      order: templateConfig.order || [],
    };
  }

  async saveTemplate(storeId: string, templateType: TemplateType, template: Template): Promise<void> {
    if (!this.bucketName) {
      throw new Error('S3 bucket not configured');
    }

    const templatePath = getTemplatePath(templateType);
    const s3Key = `templates/${storeId}/${templatePath}`;

    // 1. Crear backup del template actual antes de sobrescribir
    try {
      const currentTemplate = await this.loadTemplate(storeId, templateType);
      await this.createBackup(storeId, templateType, currentTemplate);
    } catch (error) {
      // Si no existe el template actual, no hay problema, continuar
      // Si hay otro error, loguearlo pero continuar
      console.warn(`Could not create backup for template ${templateType}:`, error);
    }

    // 2. Serializar template a JSON
    const templateJson = JSON.stringify(
      {
        sections: template.sections,
        order: template.order,
      },
      null,
      2
    );

    // 3. Guardar template en S3
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.bucketName,
        Key: s3Key,
        Body: templateJson,
        ContentType: 'application/json',
        Metadata: {
          storeId,
          templateType,
          savedAt: new Date().toISOString(),
        },
      },
    });

    await upload.done();

    // 4. Invalidar caché del template
    templateLoader.invalidateTemplateCache(storeId, templatePath);
  }

  /**
   * Crea un backup del template actual antes de sobrescribir
   */
  private async createBackup(storeId: string, templateType: TemplateType, _template: Template): Promise<void> {
    const templatePath = getTemplatePath(templateType);
    const sourceKey = `templates/${storeId}/${templatePath}`;
    const timestamp = Date.now();
    const backupKey = `backups/${storeId}/templates/${templateType}-${timestamp}.json`;

    try {
      // Copiar el template actual a la ubicación de backup
      const copyCommand = new CopyObjectCommand({
        Bucket: this.bucketName,
        CopySource: `${this.bucketName}/${sourceKey}`,
        Key: backupKey,
        Metadata: {
          storeId,
          templateType,
          backedUpAt: new Date().toISOString(),
        },
        MetadataDirective: 'REPLACE',
      });

      await this.s3Client.send(copyCommand);
    } catch (error) {
      // Si falla el backup, loguear pero no fallar el guardado
      console.warn(`Failed to create backup for template ${templateType}:`, error);
    }
  }
}
