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

import type { Section } from '../../domain/entities/section.entity';
import type { ISectionRepository } from '../../domain/ports/section-repository.port';

/**
 * Adaptador: Implementación de ISectionRepository
 * Acceso a catálogos de secciones (lista, detalle) vía API
 */
export class SectionRepositoryAdapter implements ISectionRepository {
  constructor(private readonly apiBaseUrl: string) {}

  async getAllSections(storeId: string): Promise<Section[]> {
    const res = await fetch(`${this.apiBaseUrl}/stores/${storeId}/themes/sections`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`Failed to fetch sections: ${res.statusText}`);
    const data = await res.json();
    return (data.sections || []) as Section[];
  }

  async getSection(storeId: string, sectionName: string): Promise<Section | null> {
    const res = await fetch(`${this.apiBaseUrl}/stores/${storeId}/themes/sections/${encodeURIComponent(sectionName)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch section: ${res.statusText}`);
    return (await res.json()) as Section;
  }

  async listSectionNames(storeId: string): Promise<string[]> {
    const res = await fetch(`${this.apiBaseUrl}/stores/${storeId}/themes/sections?fields=names`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`Failed to list section names: ${res.statusText}`);
    const data = await res.json();
    return (data.names || []) as string[];
  }
}
