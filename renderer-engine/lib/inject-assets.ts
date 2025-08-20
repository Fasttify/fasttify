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

/**
 * Utilidad para inyectar CSS y JS en el HTML renderizado
 * @param html - El HTML a inyectar los assets
 * @param assetCollector - El collector de assets
 * @returns El HTML con los assets inyectados
 */
export function injectAssets(html: string, assetCollector: any): string {
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

  return finalHtml;
}
