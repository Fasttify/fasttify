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
 * Módulo de compatibilidad para temas sin fasttify_attributes
 * Detecta comentarios de marcado y agrega atributos data-section-id automáticamente
 * @module compatibility
 */

/**
 * Función que contiene el código de compatibilidad
 * Esta función no se ejecuta directamente, se convierte a string para inyectar en el iframe
 */
function compatibilityModule() {
  /**
   * Encuentra el siguiente elemento HTML visible después de un comentario
   * Busca recursivamente en hermanos y en el contenedor padre
   * @param {Node} commentNode - El nodo comentario desde donde comenzar la búsqueda
   * @returns {Element|null} El siguiente elemento HTML visible o null
   */
  function findNextVisibleElement(commentNode) {
    if (!commentNode) return null;

    // Tags que deben ser ignorados (no son elementos de contenido visible)
    const ignoredTags = ['script', 'style', 'meta', 'link', 'noscript', 'template'];

    /**
     * Verifica si un elemento es válido para ser el elemento raíz de una sección
     * @param {Element} element - El elemento a verificar
     * @returns {boolean} true si es válido
     */
    function isValidSectionElement(element) {
      if (!element || element.nodeType !== 1) return false;

      const tagName = element.tagName?.toLowerCase();
      if (!tagName || ignoredTags.includes(tagName)) {
        return false;
      }

      // Verificar que el elemento sea visible (no esté oculto)
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
      }

      return true;
    }

    // Buscar en hermanos siguientes
    let current = commentNode.nextSibling;
    while (current) {
      if (isValidSectionElement(current)) {
        return current;
      }

      // Si es un contenedor, buscar dentro de él
      if (current.nodeType === 1) {
        const firstChild = current.firstElementChild;
        if (firstChild && isValidSectionElement(firstChild)) {
          return firstChild;
        }
      }

      current = current.nextSibling;
    }

    // Si no hay hermanos siguientes, buscar en el padre
    let parentNode = commentNode.parentNode;
    while (parentNode && parentNode !== document.body) {
      // Buscar siguiente hermano del padre
      let siblingNode = parentNode.nextSibling;
      while (siblingNode) {
        if (isValidSectionElement(siblingNode)) {
          return siblingNode;
        }
        siblingNode = siblingNode.nextSibling;
      }

      // Si el padre es válido, usarlo
      if (isValidSectionElement(parentNode)) {
        return parentNode;
      }

      parentNode = parentNode.parentNode;
    }

    return null;
  }

  /**
   * Procesa comentarios de marcado FASTTIFY_SECTION_START y agrega atributos
   */
  function processCompatibilityMarkers() {
    // Buscar todos los comentarios FASTTIFY_SECTION_START
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT, null);

    const processedSections = new Set();
    let comment;

    while ((comment = walker.nextNode())) {
      const commentText = comment.textContent?.trim() || '';

      // Detectar comentario de inicio de sección
      const sectionStartMatch = commentText.match(/^FASTTIFY_SECTION_START:(.+)$/);
      if (sectionStartMatch) {
        const sectionId = sectionStartMatch[1];

        // Evitar procesar la misma sección dos veces
        if (processedSections.has(sectionId)) {
          continue;
        }

        // Encontrar el siguiente elemento visible después del comentario
        const sectionElement = findNextVisibleElement(comment);

        if (sectionElement) {
          // Verificar si ya tiene data-section-id (no sobrescribir si ya existe)
          if (!sectionElement.hasAttribute('data-section-id')) {
            sectionElement.setAttribute('data-section-id', sectionId);

            // Intentar obtener el nombre de la sección desde el schema si está disponible
            // Esto se puede mejorar en el futuro leyendo metadata del schema
            const sectionName = sectionElement.getAttribute('data-section-name');
            if (!sectionName) {
              // Usar el ID como nombre por defecto
              sectionElement.setAttribute('data-section-name', sectionId);
            }
          }

          processedSections.add(sectionId);
        }
      }

      // Detectar comentario de inicio de bloque (para futura implementación)
      const blockStartMatch = commentText.match(/^FASTTIFY_BLOCK_START:(.+)$/);
      if (blockStartMatch) {
        const blockId = blockStartMatch[1];
        const blockElement = findNextVisibleElement(comment);

        if (blockElement && !blockElement.hasAttribute('data-block-id')) {
          // Necesitamos obtener el sectionId del contexto
          // Por ahora, buscar el sectionId más cercano subiendo en el árbol
          let blockParent = blockElement.parentElement;
          let sectionId = null;

          while (blockParent && !sectionId) {
            sectionId = blockParent.getAttribute('data-section-id');
            blockParent = blockParent.parentElement;
          }

          if (sectionId) {
            blockElement.setAttribute('data-section-id', sectionId);
            blockElement.setAttribute('data-block-id', blockId);
          }
        }
      }
    }
  }

  /**
   * Inicializa el sistema de compatibilidad
   * Se ejecuta después de que el DOM esté completamente cargado
   */
  function initCompatibility() {
    // Ejecutar inmediatamente si el DOM ya está listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', processCompatibilityMarkers);
    } else {
      // Usar setTimeout para asegurar que el contenido renderizado esté disponible
      setTimeout(processCompatibilityMarkers, 0);
    }

    // También procesar después de un pequeño delay para capturar contenido dinámico
    setTimeout(processCompatibilityMarkers, 100);
  }

  // Inicializar cuando el módulo se carga
  initCompatibility();
}

/**
 * Extrae el código de compatibilidad
 * @returns {string} Código JavaScript con las funciones de compatibilidad
 */
export function createCompatibilityCode() {
  return extractFunctionBody(compatibilityModule, 'compatibility');
}
