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
 * Funciones de utilidad para encontrar y obtener información de elementos seleccionables
 * @module utils
 */

/**
 * Función que contiene las funciones de utilidad
 * Esta función no se ejecuta directamente, se convierte a string para inyectar en el iframe
 */
function utilsModule() {
  /**
   * Busca el elemento seleccionable más cercano (con data-section-id o data-block-id)
   * subiendo en el árbol DOM desde el elemento dado
   * @param {Element|null} element - El elemento desde donde comenzar la búsqueda
   * @returns {Element|null} El elemento seleccionable encontrado o null
   */
  function findSelectableElement(element) {
    if (!element) return null;
    let current = element;
    while (current && current.nodeType === 1) {
      if (current.hasAttribute && (current.hasAttribute('data-section-id') || current.hasAttribute('data-block-id'))) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  /**
   * Extrae los IDs de sección y bloque de un elemento
   * @param {Element} element - El elemento del cual extraer los IDs
   * @returns {{sectionId: string|null, blockId: string|null}} Objeto con sectionId y blockId
   */
  function getElementIds(element) {
    return {
      sectionId: element.getAttribute('data-section-id'),
      blockId: element.getAttribute('data-block-id'),
    };
  }

  /**
   * Extrae el nombre del elemento desde los atributos data
   * @param {Element} element - El elemento del cual extraer el nombre
   * @returns {string|null} El nombre del elemento o null
   */
  function getElementName(element) {
    if (!element) return null;
    // Prioridad: data-block-name > data-section-name > blockId > sectionId
    const blockName = element.getAttribute('data-block-name');
    if (blockName) return blockName;
    const sectionName = element.getAttribute('data-section-name');
    if (sectionName) return sectionName;
    const { blockId, sectionId } = getElementIds(element);
    return blockId || sectionId || null;
  }
}

/**
 * Extrae el código de las funciones de utilidad
 * @returns {string} Código JavaScript con las funciones de utilidad
 */
export function createUtilsCode() {
  return extractFunctionBody(utilsModule, 'utils');
}
