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
 * Caso de uso: Cargar Template por tipo
 */
export class LoadTemplateUseCase {
  constructor(private readonly templateRepo: ITemplateRepository) {}

  async execute(storeId: string, templateType: TemplateType): Promise<Template | null> {
    return this.templateRepo.getTemplate(storeId, templateType);
  }
}
