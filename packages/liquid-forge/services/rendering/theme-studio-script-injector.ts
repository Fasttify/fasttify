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

import { iframeSelectionScript } from '@fasttify/theme-studio';

/**
 * Servicio para inyectar el script del ThemeStudio en el HTML renderizado
 */
export class ThemeStudioScriptInjector {
  /**
   * Genera el script del ThemeStudio usando la función exportada del paquete
   * @param domain - El dominio de la tienda
   * @returns El script completo como string
   */
  static generateScript(domain: string | undefined): string {
    const script = iframeSelectionScript(domain || null);
    return script;
  }

  /**
   * Inyecta el script del ThemeStudio en el HTML
   * @param html - El HTML donde inyectar el script
   * @param domain - El dominio de la tienda
   * @returns El HTML con el script inyectado
   */
  static injectScript(html: string, domain: string | undefined): string {
    const hasExistingScript = html.includes('data-fasttify-theme-studio="true"');
    const scriptCount = (html.match(/data-fasttify-theme-studio="true"/g) || []).length;

    if (hasExistingScript) {
      return html;
    }

    const script = this.generateScript(domain);
    const scriptTag = `<script data-fasttify-theme-studio="true">${script}</script>`;

    let result: string;
    if (html.includes('</head>')) {
      result = html.replace('</head>', `${scriptTag}</head>`);
    } else if (html.includes('</body>')) {
      result = html.replace('</body>', `${scriptTag}</body>`);
    } else {
      result = html + scriptTag;
    }

    // Verificar que se inyectó correctamente
    const finalScriptCount = (result.match(/data-fasttify-theme-studio="true"/g) || []).length;
    if (finalScriptCount !== 1) {
    }

    return result;
  }
}
