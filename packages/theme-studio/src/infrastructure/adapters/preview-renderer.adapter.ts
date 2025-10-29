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

import type {
  IPreviewRenderer,
  RenderPreviewParams,
  RenderPreviewResult,
} from '../../domain/ports/preview-renderer.port';

/**
 * Adaptador: Implementación de IPreviewRenderer
 * Envía la configuración al backend para renderizar el preview con el motor
 */
export class PreviewRendererAdapter implements IPreviewRenderer {
  constructor(private readonly apiBaseUrl: string) {}

  async renderPreview(params: RenderPreviewParams): Promise<RenderPreviewResult> {
    const res = await fetch(`${this.apiBaseUrl}/stores/${params.storeId}/themes/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageType: params.templateType,
        templateConfig: {
          sections: params.template.sections,
          order: params.template.order,
        },
        searchParams: params.searchParams || {},
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to render preview: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      html: data.html || data.Worker || '',
      metadata: data.metadata,
    };
  }
}
