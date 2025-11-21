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
 * @fileoverview Script que se inyecta en el iframe para manejar la selección bidireccional
 * entre el sidebar y el preview del tema.
 *
 * Este script está dividido en módulos:
 * - constants: Constantes y estilos CSS
 * - utils: Funciones de utilidad para encontrar elementos
 * - selection: Funciones de selección y scroll
 * - event-handlers: Handlers de eventos del usuario
 * - domain-links: Configuración de enlaces con dominio
 * - compatibility: Sistema de compatibilidad para temas sin fasttify_attributes
 * - init: Inicialización y cleanup
 *
 * @module iframe-selection-script
 */

import { createConstantsCode } from './iframe-selection-script/constants.js';
import { createUtilsCode } from './iframe-selection-script/utils.js';
import { createSelectionCode } from './iframe-selection-script/selection.js';
import { createEventHandlersCode } from './iframe-selection-script/event-handlers.js';
import { createDomainLinksCode } from './iframe-selection-script/domain-links.js';
import { createCompatibilityCode } from './iframe-selection-script/compatibility.js';
import { createInitCode } from './iframe-selection-script/init.js';

/**
 * Genera el script completo de selección del iframe con el dominio de la tienda inyectado
 *
 * El script generado:
 * 1. Detecta comentarios de compatibilidad y agrega atributos automáticamente
 * 2. Detecta clicks en elementos con data-section-id o data-block-id
 * 3. Envía postMessage al padre con el ID encontrado
 * 4. Escucha mensajes del padre para aplicar/quitar resaltado
 * 5. Aplica estilos CSS para el outline azul
 * 6. Configura enlaces relativos con el dominio de la tienda
 *
 * @param {string|null} storeDomain - El dominio de la tienda a inyectar (ej: 'mystore.com')
 * @returns {string} El script completo listo para inyectar en el iframe como string
 *
 * @example
 * const script = iframeSelectionScript('mystore.com');
 * scriptElement.textContent = script;
 */
export function iframeSelectionScript(storeDomain) {
  const constants = createConstantsCode(storeDomain);
  const utils = createUtilsCode();
  const selection = createSelectionCode();
  const eventHandlers = createEventHandlersCode();
  const domainLinks = createDomainLinksCode();
  const compatibility = createCompatibilityCode();
  const init = createInitCode();

  return `(function() {
  'use strict';
  var NS_KEY = '__FASTTIFY_THEME_STUDIO_NS__';
  if (window[NS_KEY]) {
    return;
  }
  var $ = window[NS_KEY] = {};

(function() {
${constants}
})();

(function() {
${utils}
})();

(function() {
${selection}
})();

(function() {
${eventHandlers}
})();

(function() {
${domainLinks}
})();

(function() {
${compatibility}
})();

(function() {
${init}
})();
})();`;
}
