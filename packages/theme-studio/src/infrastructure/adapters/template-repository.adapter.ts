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

import type { Template, TemplateType } from '../../domain/entities/template.entity';
import type { ITemplateRepository } from '../../domain/ports/template-repository.port';

/**
 * Adaptador: Implementación de ITemplateRepository
 * Accede a templates mediante API/S3/etc.
 * Esta es la capa de infraestructura que implementa el puerto del dominio
 */
export class TemplateRepositoryAdapter implements ITemplateRepository {
  constructor(private readonly apiBaseUrl: string) {}

  async getTemplate(storeId: string, templateType: TemplateType): Promise<Template | null> {
    const response = await fetch(`${this.apiBaseUrl}/stores/${storeId}/themes/templates/${templateType}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch template: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToTemplate(data, templateType);
  }

  async saveTemplate(storeId: string, template: Template): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/stores/${storeId}/themes/templates/${template.type}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sections: template.sections,
        order: template.order,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save template: ${response.statusText}`);
    }
  }

  async listTemplates(storeId: string): Promise<TemplateType[]> {
    const response = await fetch(`${this.apiBaseUrl}/stores/${storeId}/themes/templates`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to list templates: ${response.statusText}`);
    }

    const data = await response.json();
    return data.templates || [];
  }

  /**
   * Mapea datos de la API al formato de la entidad Template
   */
  private mapToTemplate(data: any, templateType: TemplateType): Template {
    return {
      type: templateType,
      sections: data.sections || {},
      order: data.order || [],
    };
  }
}
