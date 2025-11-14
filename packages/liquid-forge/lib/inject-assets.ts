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

import { ThemeStudioScriptInjector } from '../services/rendering/theme-studio-script-injector';
import { logger } from './logger';

/**
 * Utilidad para inyectar CSS y JS en el HTML renderizado
 * @param html - El HTML a inyectar los assets
 * @param assetCollector - El collector de assets
 * @param domain - El dominio de la tienda para inyectar el script del ThemeStudio
 * @returns El HTML con los assets inyectados
 */
export function injectAssets(html: string, assetCollector: any, domain?: string): string {
  logger.info('[injectAssets] Iniciando inyección de assets', {
    htmlLength: html.length,
    domain,
    hasDomain: !!domain,
    hasThemeStudioScript: html.includes('data-fasttify-theme-studio="true"'),
  });

  let finalHtml = html;
  const css = assetCollector.getCombinedCss();
  const js = assetCollector.getCombinedJs();

  if (css) {
    const styleTag = `<style data-fasttify-assets="true">${css}</style>`;
    finalHtml = finalHtml.includes('</head>')
      ? finalHtml.replace('</head>', `${styleTag}</head>`)
      : finalHtml + styleTag;
  }

  if (js) {
    const scriptTag = `<script data-fasttify-assets="true">${js}</script>`;
    finalHtml = finalHtml.includes('</body>')
      ? finalHtml.replace('</body>', `${scriptTag}</body>`)
      : finalHtml + scriptTag;
  }

  // Inyectar script del ThemeStudio en todas las tiendas
  if (domain) {
    const beforeLength = finalHtml.length;
    finalHtml = ThemeStudioScriptInjector.injectScript(finalHtml, domain);
    const afterLength = finalHtml.length;
    logger.info('[injectAssets] Script del ThemeStudio procesado', {
      domain,
      beforeLength,
      afterLength,
      difference: afterLength - beforeLength,
      finalScriptCount: (finalHtml.match(/data-fasttify-theme-studio="true"/g) || []).length,
    });
  } else {
    logger.info('[injectAssets] No se inyecta script del ThemeStudio - sin dominio', {
      domain,
    });
  }

  return finalHtml;
}
