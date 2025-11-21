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
 * Funciones para manejar la selección de elementos en el iframe
 * @module selection
 */

/**
 * Función que contiene las funciones de selección
 * Esta función no se ejecuta directamente, se convierte a string para inyectar en el iframe
 */
function selectionModule() {
  var $ = window.__FASTTIFY_THEME_STUDIO_NS__;
  /**
   * Crea o actualiza la etiqueta visual del selector
   * @param {Element} element - El elemento al que agregar la etiqueta
   * @param {string} labelText - El texto a mostrar en la etiqueta
   * @param {boolean} isHover - Si es true, usa la etiqueta de hover; si es false, usa la de selección
   */
  window.updateLabel = function (element, labelText, isHover) {
    if (!element || !labelText) return;

    // Remover etiqueta anterior si existe
    var existingLabel = isHover ? $.hoverLabelElement : $.currentLabelElement;
    if (existingLabel && existingLabel.parentNode) {
      existingLabel.parentNode.removeChild(existingLabel);
    }

    // Crear nueva etiqueta
    var label = document.createElement('div');
    label.className = 'fasttify-selector-label';
    label.textContent = labelText;

    // Aplicar todos los estilos del label directamente para asegurar que siempre se muestren
    label.style.position = 'fixed';
    label.style.backgroundColor = '#005cd4';
    label.style.color = 'white';
    label.style.fontSize = '12px';
    label.style.fontWeight = '600';
    label.style.padding = '4px 10px';
    label.style.lineHeight = '1.4';
    label.style.whiteSpace = 'nowrap';
    label.style.zIndex = '999999';
    label.style.pointerEvents = 'none';
    label.style.borderRadius = '4px';

    // Calcular posición relativa al viewport visible del elemento
    // getBoundingClientRect() ya devuelve coordenadas relativas al viewport
    var rect = element.getBoundingClientRect();

    // Posicionar la etiqueta en la esquina superior izquierda visible
    // Como usamos position: fixed, solo necesitamos las coordenadas del viewport
    label.style.top = Math.max(0, rect.top - 2) + 'px';
    label.style.left = Math.max(0, rect.left - 2) + 'px';

    document.body.appendChild(label);

    // Guardar referencia
    if (isHover) {
      $.hoverLabelElement = label;
    } else {
      $.currentLabelElement = label;
    }

    // Actualizar posición en scroll y resize
    // getBoundingClientRect() ya devuelve coordenadas relativas al viewport
    var updatePosition = function () {
      var newRect = element.getBoundingClientRect();
      label.style.top = Math.max(0, newRect.top - 2) + 'px';
      label.style.left = Math.max(0, newRect.left - 2) + 'px';
    };

    // Agregar listeners temporales para actualizar posición
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition, { passive: true });

    // Guardar función de cleanup en el elemento label
    label._cleanup = function () {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  };

  /**
   * Remueve la etiqueta del selector
   * @param {boolean} isHover - Si es true, remueve la etiqueta de hover; si es false, remueve la de selección
   */
  window.removeLabel = function (isHover) {
    var label = isHover ? $.hoverLabelElement : $.currentLabelElement;
    if (label && label.parentNode) {
      if (label._cleanup) {
        label._cleanup();
      }
      label.parentNode.removeChild(label);
    }
    if (isHover) {
      $.hoverLabelElement = null;
    } else {
      $.currentLabelElement = null;
    }
  };

  /**
   * Limpia la selección actual removiendo la clase de selección del elemento
   */
  $.clearSelection = function () {
    if ($.currentSelectedElement) {
      $.currentSelectedElement.classList.remove($.SELECTED_CLASS);

      // Remover estilos aplicados y restaurar originales
      if (typeof $.removeStyles === 'function') {
        $.removeStyles($.currentSelectedElement);
      }

      if (typeof window.removeLabel === 'function') {
        window.removeLabel(false);
      }
      $.currentSelectedElement = null;
    }
  };

  /**
   * Selecciona un elemento por su sectionId, blockId o subBlockId y hace scroll suave hacia él
   * @param {string|null} sectionId - ID de la sección a seleccionar
   * @param {string|null} blockId - ID del bloque a seleccionar
   * @param {string|null} subBlockId - ID del sub-bloque a seleccionar
   * @param {number} [timestamp] - Timestamp para ignorar mensajes obsoletos
   * @param {string} [elementName] - Nombre del elemento a mostrar en la etiqueta
   */
  $.selectElement = function (sectionId, blockId, subBlockId, timestamp, elementName) {
    // Ignorar mensajes obsoletos
    if (timestamp && timestamp < $.lastSelectionTimestamp) {
      return;
    }

    if (timestamp) {
      $.lastSelectionTimestamp = timestamp;
    } else {
      $.lastSelectionTimestamp = Date.now();
    }

    $.clearSelection();
    if (!sectionId && !blockId && !subBlockId) {
      return;
    }
    var selector = '';
    if (subBlockId) {
      // Si hay subBlockId, buscar por data-sub-block-id
      selector = '[data-sub-block-id="' + subBlockId + '"]';
    } else if (blockId) {
      // Si hay blockId pero no subBlockId, buscar por data-block-id (y asegurarse de que no tenga data-sub-block-id)
      selector = '[data-block-id="' + blockId + '"]:not([data-sub-block-id])';
    } else if (sectionId) {
      // Si solo hay sectionId, buscar por data-section-id (y asegurarse de que no tenga data-block-id)
      selector = '[data-section-id="' + sectionId + '"]:not([data-block-id])';
    }
    if (selector) {
      var element = document.querySelector(selector);
      if (element) {
        element.classList.add($.SELECTED_CLASS);

        // Aplicar estilos directamente como fallback
        if (typeof $.applyStyles === 'function') {
          $.applyStyles(element, 'selected');
        }

        // Verificar después de un frame si los estilos se aplicaron correctamente
        requestAnimationFrame(function () {
          if (typeof $.verifyStylesApplied === 'function' && !$.verifyStylesApplied(element, 'selected')) {
            // Si los estilos CSS no se aplicaron, aplicar directamente
            if (typeof $.applyStyles === 'function') {
              $.applyStyles(element, 'selected');
            }
          }
        });

        $.currentSelectedElement = element;

        // Mostrar etiqueta con el nombre del elemento
        if (elementName && typeof window.updateLabel === 'function') {
          window.updateLabel(element, elementName, false);
        }

        // Cancelar scroll anterior si hay uno pendiente
        if ($.scrollAnimationFrame !== null) {
          cancelAnimationFrame($.scrollAnimationFrame);
          $.scrollAnimationFrame = null;
        }

        // Usar requestAnimationFrame para mejor sincronización con el navegador
        // y asegurar scroll suave incluso con selecciones rápidas
        $.scrollAnimationFrame = requestAnimationFrame(function () {
          $.scrollAnimationFrame = null;
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          // Actualizar posición de la etiqueta después del scroll
          if (elementName && $.currentLabelElement && typeof window.updateLabel === 'function') {
            setTimeout(function () {
              window.updateLabel(element, elementName, false);
            }, 100);
          }
        });
      }
    }
  };
}

/**
 * Extrae el código de las funciones de selección
 * @returns {string} Código JavaScript con las funciones de selección
 */
export function createSelectionCode() {
  return extractFunctionBody(selectionModule, 'selection');
}
