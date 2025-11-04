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
 * Handlers de eventos para interactividad del usuario y comunicación con el padre
 * @module event-handlers
 */

/**
 * Función que contiene los handlers de eventos
 * Esta función no se ejecuta directamente, se convierte a string para inyectar en el iframe
 */
function eventHandlersModule() {
  /**
   * Maneja los clicks en elementos seleccionables
   * Permite que elementos interactivos (enlaces, botones) funcionen normalmente
   * mientras envía mensajes de selección al padre
   * @param {MouseEvent} event - El evento de click
   */
  function handleClick(event) {
    const target = event.target;
    const selectableElement = findSelectableElement(target);

    if (selectableElement) {
      // Solo prevenir el comportamiento por defecto si el elemento clickeado es directamente el elemento seleccionable
      // Esto permite que enlaces, botones y otros elementos interactivos funcionen normalmente
      const isDirectSelectable = target === selectableElement;

      // Si es un elemento interactivo (enlace, botón, input, etc.), no prevenir el comportamiento
      const isInteractiveElement =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.onclick ||
        target.closest('a') ||
        target.closest('button');

      // Solo prevenir si es un click directo en el elemento seleccionable Y no es un elemento interactivo
      if (isDirectSelectable && !isInteractiveElement) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Siempre enviar el mensaje de selección, pero no interferir con elementos interactivos
      const { sectionId, blockId } = getElementIds(selectableElement);
      if (window.parent) {
        window.parent.postMessage(
          {
            type: 'FASTTIFY_THEME_STUDIO_ELEMENT_CLICKED',
            sectionId,
            blockId,
          },
          '*'
        );
      }
    }
  }

  let hoverTimeout = null;
  let leaveTimeout = null;

  /**
   * Verifica si un elemento o su elemento relacionado están dentro del elemento seleccionable
   * @param {Element} element - El elemento a verificar
   * @param {Element} selectableElement - El elemento seleccionable
   * @returns {boolean} true si el elemento está dentro del seleccionable
   */
  function isWithinSelectable(element, selectableElement) {
    if (!element || !selectableElement) return false;
    return selectableElement.contains(element) || selectableElement === element;
  }

  /**
   * Maneja el evento mouseenter para mostrar el estado hover
   * @param {MouseEvent} event - El evento mouseenter
   */
  function handleMouseEnter(event) {
    // Cancelar cualquier timeout de leave pendiente
    if (leaveTimeout) {
      clearTimeout(leaveTimeout);
      leaveTimeout = null;
    }

    const target = event.target;
    const selectableElement = findSelectableElement(target);

    // Si ya está en hover este elemento, no hacer nada
    if (hoveredElement === selectableElement) {
      return;
    }

    // Solo mostrar hover si no es el elemento seleccionado actualmente
    if (selectableElement && selectableElement !== currentSelectedElement) {
      // Cancelar timeout anterior si existe
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }

      // Pequeño delay para evitar parpadeos rápidos
      hoverTimeout = setTimeout(function () {
        // Verificar nuevamente que el elemento sigue siendo válido
        if (selectableElement && selectableElement !== currentSelectedElement) {
          selectableElement.classList.add(HOVER_CLASS);
          hoveredElement = selectableElement;
          const { sectionId, blockId } = getElementIds(selectableElement);
          const labelText = blockId || sectionId || '';
          if (labelText && typeof window.updateLabel === 'function') {
            window.updateLabel(selectableElement, labelText, true);
          }
        }
        hoverTimeout = null;
      }, 50);
    }
  }

  /**
   * Maneja el evento mouseleave para remover el estado hover
   * @param {MouseEvent} event - El evento mouseleave
   */
  function handleMouseLeave(event) {
    // Cancelar cualquier timeout de hover pendiente
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }

    if (!hoveredElement) return;

    const relatedTarget = event.relatedTarget;

    // Verificar si realmente estamos saliendo del elemento seleccionable
    // Si el relatedTarget (elemento hacia donde va el mouse) está dentro del elemento seleccionable,
    // entonces no removemos el hover (el mouse sigue dentro del elemento, solo pasó a un hijo)
    if (relatedTarget && isWithinSelectable(relatedTarget, hoveredElement)) {
      return;
    }

    // Pequeño delay para evitar parpadeos cuando el mouse pasa rápidamente entre elementos
    // Esto da tiempo para que se dispare handleMouseEnter si el mouse entró a otro elemento
    leaveTimeout = setTimeout(function () {
      // Verificar nuevamente que realmente salimos del elemento
      // Si durante el delay el mouse entró a otro elemento, hoveredElement podría haber cambiado
      if (hoveredElement) {
        hoveredElement.classList.remove(HOVER_CLASS);
        if (typeof window.removeLabel === 'function') {
          window.removeLabel(true);
        }
        hoveredElement = null;
      }
      leaveTimeout = null;
    }, 150);
  }

  /**
   * Maneja los mensajes recibidos del window padre
   * Escucha comandos de selección y limpieza de selección
   * @param {MessageEvent} event - El evento de mensaje
   */
  function handleMessage(event) {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isSameOrigin = event.origin === window.location.origin;
    if (!isSameOrigin && !isLocalhost) return;
    if (event.data && event.data.type === 'FASTTIFY_THEME_STUDIO_SELECT_ELEMENT') {
      selectElement(event.data.sectionId, event.data.blockId, event.data.timestamp, event.data.elementName);
    } else if (event.data && event.data.type === 'FASTTIFY_THEME_STUDIO_CLEAR_SELECTION') {
      clearSelection();
      lastSelectionTimestamp = 0;
    }
  }
}

/**
 * Extrae el código de los handlers de eventos
 * @returns {string} Código JavaScript con los handlers de eventos
 */
export function createEventHandlersCode() {
  return extractFunctionBody(eventHandlersModule, 'event handlers');
}
