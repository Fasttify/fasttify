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

import { extractFunctionBody } from './extract-function-body.js';

/**
 * Constantes y configuración para el script de selección del iframe
 * @module constants
 */

/**
 * Función que contiene el código de inicialización de constantes y estilos CSS
 * Esta función no se ejecuta directamente, se convierte a string para inyectar en el iframe
 * @param {string|null} storeDomain - El dominio de la tienda
 */
function constantsModule(storeDomain) {
  'use strict';
  if (window.self === window.top) {
    return;
  }
  var $ = window.__FASTTIFY_THEME_STUDIO_NS__;
  $.SELECTED_CLASS = 'fasttify-theme-studio-selected';
  $.HOVER_CLASS = 'fasttify-theme-studio-hover';
  $.STORE_DOMAIN = storeDomain;
  $.IS_LOCALHOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  $.style = document.createElement('style');
  $.style.textContent =
    '[data-section-id].' +
    $.SELECTED_CLASS +
    ',' +
    '[data-block-id].' +
    $.SELECTED_CLASS +
    ' {' +
    '  position: relative !important;' +
    '  box-shadow: inset 0 0 0 2px #006fbb !important;' +
    '}' +
    '[data-section-id].' +
    $.HOVER_CLASS +
    ',' +
    '[data-block-id].' +
    $.HOVER_CLASS +
    ' {' +
    '  position: relative !important;' +
    '  box-shadow: inset 0 0 0 2px rgba(0, 111, 187, 0.6) !important;' +
    '}' +
    '.fasttify-selector-label {' +
    '  position: fixed;' +
    '  background-color: #005cd4;' +
    '  color: white;' +
    '  font-size: 12px;' +
    '  font-weight: 600;' +
    '  padding: 4px 10px;' +
    '  line-height: 1.4;' +
    '  white-space: nowrap;' +
    '  z-index: 999999;' +
    '  pointer-events: none;' +
    '  border-radius: 4px;' +
    '}';
  document.head.appendChild($.style);

  /**
   * Aplica estilos directamente al elemento como fallback si el CSS no funciona
   * @param {Element} element - El elemento al que aplicar los estilos
   * @param {string} type - Tipo de estilo: 'hover' o 'selected'
   */
  $.applyStyles = function (element, type) {
    if (!element) return;

    // Guardar estilos originales solo la primera vez
    if (!element._fasttifyOriginalStyles) {
      element._fasttifyOriginalStyles = {
        boxShadow: element.style.boxShadow || '',
        position: element.style.position || '',
      };
    }

    if (type === 'hover') {
      element.style.setProperty('box-shadow', 'inset 0 0 0 2px rgba(0, 111, 187, 0.6)', 'important');
      element.style.setProperty('position', 'relative', 'important');
    } else if (type === 'selected') {
      element.style.setProperty('box-shadow', 'inset 0 0 0 2px #006fbb', 'important');
      element.style.setProperty('position', 'relative', 'important');
    }
  };

  /**
   * Remueve los estilos aplicados y restaura los originales
   * @param {Element} element - El elemento del que remover los estilos
   */
  $.removeStyles = function (element) {
    if (!element) return;

    if (element._fasttifyOriginalStyles) {
      // Restaurar estilos originales
      if (element._fasttifyOriginalStyles.boxShadow) {
        element.style.boxShadow = element._fasttifyOriginalStyles.boxShadow;
      } else {
        element.style.removeProperty('box-shadow');
      }

      if (element._fasttifyOriginalStyles.position) {
        element.style.position = element._fasttifyOriginalStyles.position;
      } else {
        element.style.removeProperty('position');
      }

      delete element._fasttifyOriginalStyles;
    } else {
      // Si no hay estilos originales guardados, remover los que agregamos
      element.style.removeProperty('box-shadow');
      element.style.removeProperty('position');
    }
  };

  /**
   * Verifica si los estilos CSS se están aplicando correctamente
   * @param {Element} element - El elemento a verificar
   * @param {string} type - Tipo de estilo: 'hover' o 'selected'
   * @returns {boolean} true si los estilos se están aplicando, false si no
   */
  $.verifyStylesApplied = function (element, type) {
    if (!element) return false;

    var computedStyle = window.getComputedStyle(element);
    var boxShadow = computedStyle.boxShadow;
    var hasBoxShadow = boxShadow && boxShadow !== 'none' && boxShadow.indexOf('inset') !== -1;

    return hasBoxShadow;
  };

  $.inspectorEnabled = true;
  $.currentSelectedElement = null;
  $.hoveredElement = null;
  $.currentLabelElement = null;
  $.hoverLabelElement = null;
  $.lastSelectionTimestamp = 0;
  $.scrollAnimationFrame = null;

  /**
   * Función global para toggle el inspector
   * @param {boolean} enabled - Si el inspector está habilitado
   */
  window.toggleInspector = function (enabled) {
    $.inspectorEnabled = enabled !== undefined ? enabled : !$.inspectorEnabled;
    if ($.style) {
      $.style.disabled = !$.inspectorEnabled;
    }
    // Limpiar selección cuando se desactiva
    if (!$.inspectorEnabled) {
      if ($.currentSelectedElement) {
        $.currentSelectedElement.classList.remove($.SELECTED_CLASS);
        if (typeof $.removeStyles === 'function') {
          $.removeStyles($.currentSelectedElement);
        }
        if (typeof window.removeLabel === 'function') {
          window.removeLabel(false);
        }
        $.currentSelectedElement = null;
      }
      if ($.hoveredElement) {
        $.hoveredElement.classList.remove($.HOVER_CLASS);
        if (typeof $.removeStyles === 'function') {
          $.removeStyles($.hoveredElement);
        }
        if (typeof window.removeLabel === 'function') {
          window.removeLabel(true);
        }
        $.hoveredElement = null;
      }
    }
  };
}

/**
 * Extrae el código de inicialización de constantes y estilos CSS
 * @param {string|null} storeDomain - El dominio de la tienda
 * @returns {string} Código JavaScript que inicializa constantes y estilos
 */
export function createConstantsCode(storeDomain) {
  let functionBody = extractFunctionBody(constantsModule, 'constants');
  const domainValue = storeDomain ? JSON.stringify(storeDomain) : 'null';

  functionBody = functionBody.replace(
    /[a-zA-Z_$][a-zA-Z0-9_$]*\.STORE_DOMAIN\s*=\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*[;,]/g,
    (match) => {
      const varMatch = match.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\.STORE_DOMAIN/);
      if (varMatch) {
        return `${varMatch[1]}.STORE_DOMAIN = ${domainValue};`;
      }
      return match;
    }
  );

  return functionBody;
}
