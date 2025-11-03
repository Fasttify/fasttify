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
   * Limpia la selección actual removiendo la clase de selección del elemento
   */
  function clearSelection() {
    if (currentSelectedElement) {
      currentSelectedElement.classList.remove(SELECTED_CLASS);
      currentSelectedElement = null;
    }
  }

  /**
   * Selecciona un elemento por su sectionId o blockId y hace scroll suave hacia él
   * @param {string|null} sectionId - ID de la sección a seleccionar
   * @param {string|null} blockId - ID del bloque a seleccionar
   * @param {number} [timestamp] - Timestamp para ignorar mensajes obsoletos
   */
  function selectElement(sectionId, blockId, timestamp) {
    // Ignorar mensajes obsoletos
    if (timestamp && timestamp < lastSelectionTimestamp) {
      return;
    }

    if (timestamp) {
      lastSelectionTimestamp = timestamp;
    } else {
      lastSelectionTimestamp = Date.now();
    }

    clearSelection();
    if (!sectionId && !blockId) return;
    let selector = '';
    if (blockId) {
      selector = '[data-block-id="' + blockId + '"]';
    } else if (sectionId) {
      selector = '[data-section-id="' + sectionId + '"]';
    }
    if (selector) {
      const element = document.querySelector(selector);
      if (element) {
        element.classList.add(SELECTED_CLASS);
        currentSelectedElement = element;

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
        });
      }
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
