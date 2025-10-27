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

import { pageConfig } from '../../config/page-config';
import type { RenderingData } from '../dynamic-page-renderer';
import { renderPageContent } from '../../services/rendering/render-page-content';

/**
 * Paso 6: Renderizar contenido de la página
 */
export async function renderContentStep(data: RenderingData): Promise<RenderingData> {
  const templatePath = pageConfig.getTemplatePath(data.options.pageType);

  const renderedContent = await renderPageContent(
    templatePath,
    data.pageTemplate!,
    data.compiledPageTemplate,
    data.context!,
    data.store!.storeId,
    data.options,
    data.storeTemplate!
  );

  return { ...data, renderedContent };
}
