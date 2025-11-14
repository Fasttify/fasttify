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
  /**
   * Crea o actualiza la etiqueta visual del selector
   * @param {Element} element - El elemento al que agregar la etiqueta
   * @param {string} labelText - El texto a mostrar en la etiqueta
   * @param {boolean} isHover - Si es true, usa la etiqueta de hover; si es false, usa la de selección
   */
  window.updateLabel = function (element, labelText, isHover) {
    if (!element || !labelText) return;

    // Remover etiqueta anterior si existe
    const labelVar = isHover ? 'hoverLabelElement' : 'currentLabelElement';
    const existingLabel = isHover ? hoverLabelElement : currentLabelElement;
    if (existingLabel && existingLabel.parentNode) {
      existingLabel.parentNode.removeChild(existingLabel);
    }

    // Crear nueva etiqueta
    const label = document.createElement('div');
    label.className = 'fasttify-selector-label';
    label.textContent = labelText;

    // Calcular posición relativa al viewport visible del elemento
    // getBoundingClientRect() ya devuelve coordenadas relativas al viewport
    const rect = element.getBoundingClientRect();

    // Posicionar la etiqueta en la esquina superior izquierda visible
    // Como usamos position: fixed, solo necesitamos las coordenadas del viewport
    label.style.position = 'fixed';
    label.style.top = Math.max(0, rect.top - 2) + 'px';
    label.style.left = Math.max(0, rect.left - 2) + 'px';

    document.body.appendChild(label);

    // Guardar referencia
    if (isHover) {
      hoverLabelElement = label;
    } else {
      currentLabelElement = label;
    }

    // Actualizar posición en scroll y resize
    // getBoundingClientRect() ya devuelve coordenadas relativas al viewport
    const updatePosition = function () {
      const newRect = element.getBoundingClientRect();
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
    const label = isHover ? hoverLabelElement : currentLabelElement;
    if (label && label.parentNode) {
      if (label._cleanup) {
        label._cleanup();
      }
      label.parentNode.removeChild(label);
    }
    if (isHover) {
      hoverLabelElement = null;
    } else {
      currentLabelElement = null;
    }
  };

  /**
   * Limpia la selección actual removiendo la clase de selección del elemento
   */
  function clearSelection() {
    if (currentSelectedElement) {
      currentSelectedElement.classList.remove(SELECTED_CLASS);
      if (typeof window.removeLabel === 'function') {
        window.removeLabel(false);
      }
      currentSelectedElement = null;
    }
  }

  /**
   * Selecciona un elemento por su sectionId, blockId o subBlockId y hace scroll suave hacia él
   * @param {string|null} sectionId - ID de la sección a seleccionar
   * @param {string|null} blockId - ID del bloque a seleccionar
   * @param {string|null} subBlockId - ID del sub-bloque a seleccionar
   * @param {number} [timestamp] - Timestamp para ignorar mensajes obsoletos
   * @param {string} [elementName] - Nombre del elemento a mostrar en la etiqueta
   */
  function selectElement(sectionId, blockId, subBlockId, timestamp, elementName) {
    console.log('[ThemeStudio Script] selectElement llamado:', {
      sectionId,
      blockId,
      subBlockId,
      timestamp,
      elementName,
      lastSelectionTimestamp,
    });

    // Ignorar mensajes obsoletos
    if (timestamp && timestamp < lastSelectionTimestamp) {
      console.log('[ThemeStudio Script] Mensaje obsoleto, ignorando');
      return;
    }

    if (timestamp) {
      lastSelectionTimestamp = timestamp;
    } else {
      lastSelectionTimestamp = Date.now();
    }

    clearSelection();
    if (!sectionId && !blockId && !subBlockId) {
      console.log('[ThemeStudio Script] No hay IDs para seleccionar');
      return;
    }
    let selector = '';
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
    console.log('[ThemeStudio Script] Selector generado:', selector);
    if (selector) {
      const element = document.querySelector(selector);
      console.log('[ThemeStudio Script] Elemento encontrado:', element);
      if (element) {
        console.log('[ThemeStudio Script] Agregando clase SELECTED_CLASS:', SELECTED_CLASS);
        element.classList.add(SELECTED_CLASS);
        currentSelectedElement = element;

        // Mostrar etiqueta con el nombre del elemento
        if (elementName && typeof window.updateLabel === 'function') {
          console.log('[ThemeStudio Script] Mostrando etiqueta:', elementName);
          window.updateLabel(element, elementName, false);
        } else {
          console.log('[ThemeStudio Script] No se puede mostrar etiqueta:', {
            elementName,
            hasUpdateLabel: typeof window.updateLabel === 'function',
          });
        }

        // Cancelar scroll anterior si hay uno pendiente
        if (scrollAnimationFrame !== null) {
          cancelAnimationFrame(scrollAnimationFrame);
          scrollAnimationFrame = null;
        }

        // Usar requestAnimationFrame para mejor sincronización con el navegador
        // y asegurar scroll suave incluso con selecciones rápidas
        scrollAnimationFrame = requestAnimationFrame(function () {
          scrollAnimationFrame = null;
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          // Actualizar posición de la etiqueta después del scroll
          if (elementName && currentLabelElement && typeof window.updateLabel === 'function') {
            setTimeout(function () {
              window.updateLabel(element, elementName, false);
            }, 100);
          }
        });
      } else {
        console.warn('[ThemeStudio Script] No se encontró elemento con selector:', selector);
      }
    } else {
      console.warn('[ThemeStudio Script] No se generó selector válido');
    }
  }
}

/**
 * Extrae el código de las funciones de selección
 * @returns {string} Código JavaScript con las funciones de selección
 */
export function createSelectionCode() {
  return extractFunctionBody(selectionModule, 'selection');
}
