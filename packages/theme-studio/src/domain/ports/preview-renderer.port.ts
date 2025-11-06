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

import type { Template, TemplateType } from '../entities/template.entity';

/**
 * Puerto: Renderizador de Preview
 * Contrato para renderizar HTML de vista previa a partir de un Template
 */
export interface IPreviewRenderer {
  renderPreview(params: RenderPreviewParams): Promise<RenderPreviewResult>;
}

export interface RenderPreviewParams {
  storeId: string;
  templateType: TemplateType;
  template: Template;
  searchParams?: Record<string, string>;
}

export interface RenderPreviewResult {
  html: string;
  metadata?: {
    title?: string;
    description?: string;
  };
}
