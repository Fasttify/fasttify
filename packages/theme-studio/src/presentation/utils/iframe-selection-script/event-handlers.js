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
  var $ = window.__FASTTIFY_THEME_STUDIO_NS__;
  /**
   * Maneja los clicks en elementos seleccionables
   * Permite que elementos interactivos (enlaces, botones) funcionen normalmente
   * mientras envía mensajes de selección al padre
   * @param {MouseEvent} event - El evento de click
   */
  $.handleClick = function (event) {
    if ($.inspectorEnabled === false) return;
    var target = event.target;
    var selectableElement = $.findSelectableElement(target);

    if (selectableElement) {
      // Solo prevenir el comportamiento por defecto si el elemento clickeado es directamente el elemento seleccionable
      // Esto permite que enlaces, botones y otros elementos interactivos funcionen normalmente
      var isDirectSelectable = target === selectableElement;

      // Si es un elemento interactivo (enlace, botón, input, etc.), no prevenir el comportamiento
      var isInteractiveElement =
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
      var ids = $.getElementIds(selectableElement);
      if (window.parent) {
        window.parent.postMessage(
          {
            type: 'FASTTIFY_THEME_STUDIO_ELEMENT_CLICKED',
            sectionId: ids.sectionId,
            blockId: ids.blockId,
            subBlockId: ids.subBlockId,
          },
          '*'
        );
      }
    }
  };

  $.hoverTimeout = null;
  $.leaveTimeout = null;

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
  $.handleMouseEnter = function (event) {
    if ($.inspectorEnabled === false) return;
    // Cancelar cualquier timeout de leave pendiente
    if ($.leaveTimeout) {
      clearTimeout($.leaveTimeout);
      $.leaveTimeout = null;
    }

    var target = event.target;
    var selectableElement = $.findSelectableElement(target);

    // Si ya está en hover este elemento, no hacer nada
    if ($.hoveredElement === selectableElement) {
      return;
    }

    // Solo mostrar hover si no es el elemento seleccionado actualmente
    if (selectableElement && selectableElement !== $.currentSelectedElement) {
      // Cancelar timeout anterior si existe
      if ($.hoverTimeout) {
        clearTimeout($.hoverTimeout);
      }

      // Pequeño delay para evitar parpadeos rápidos
      $.hoverTimeout = setTimeout(function () {
        if (selectableElement && selectableElement !== $.currentSelectedElement) {
          selectableElement.classList.add($.HOVER_CLASS);

          // Aplicar estilos directamente como fallback
          if (typeof $.applyStyles === 'function') {
            $.applyStyles(selectableElement, 'hover');
          }

          // Verificar después de un frame si los estilos se aplicaron correctamente
          requestAnimationFrame(function () {
            if (typeof $.verifyStylesApplied === 'function' && !$.verifyStylesApplied(selectableElement, 'hover')) {
              // Si los estilos CSS no se aplicaron, aplicar directamente
              if (typeof $.applyStyles === 'function') {
                $.applyStyles(selectableElement, 'hover');
              }
            }
          });

          $.hoveredElement = selectableElement;
          var elementName = $.getElementName(selectableElement);
          if (elementName && typeof window.updateLabel === 'function') {
            window.updateLabel(selectableElement, elementName, true);
          }
        }
        $.hoverTimeout = null;
      }, 50);
    }
  };

  /**
   * Maneja el evento mouseleave para remover el estado hover
   * @param {MouseEvent} event - El evento mouseleave
   */
  $.handleMouseLeave = function (event) {
    // Cancelar cualquier timeout de hover pendiente
    if ($.hoverTimeout) {
      clearTimeout($.hoverTimeout);
      $.hoverTimeout = null;
    }

    if (!$.hoveredElement) return;

    var relatedTarget = event.relatedTarget;

    // Verificar si realmente estamos saliendo del elemento seleccionable
    // Si el relatedTarget (elemento hacia donde va el mouse) está dentro del elemento seleccionable,
    // entonces no removemos el hover (el mouse sigue dentro del elemento, solo pasó a un hijo)
    if (relatedTarget && isWithinSelectable(relatedTarget, $.hoveredElement)) {
      return;
    }

    // Pequeño delay para evitar parpadeos cuando el mouse pasa rápidamente entre elementos
    // Esto da tiempo para que se dispare handleMouseEnter si el mouse entró a otro elemento
    $.leaveTimeout = setTimeout(function () {
      // Verificar nuevamente que realmente salimos del elemento
      // Si durante el delay el mouse entró a otro elemento, hoveredElement podría haber cambiado
      if ($.hoveredElement) {
        $.hoveredElement.classList.remove($.HOVER_CLASS);

        // Remover estilos aplicados y restaurar originales
        if (typeof $.removeStyles === 'function') {
          $.removeStyles($.hoveredElement);
        }

        if (typeof window.removeLabel === 'function') {
          window.removeLabel(true);
        }
        $.hoveredElement = null;
      }
      $.leaveTimeout = null;
    }, 150);
  };

  /**
   * Maneja los mensajes recibidos del window padre
   * Escucha comandos de selección y limpieza de selección
   * @param {MessageEvent} event - El evento de mensaje
   */
  $.handleMessage = function (event) {
    // Solo procesar mensajes de nuestra aplicación
    // Validamos el tipo del mensaje en lugar del origen para funcionar en producción
    // cuando el iframe está en un dominio diferente al parent window
    if (!event.data || typeof event.data.type !== 'string' || !event.data.type.startsWith('FASTTIFY_THEME_STUDIO_')) {
      return;
    }

    if (event.data.type === 'FASTTIFY_THEME_STUDIO_TOGGLE_INSPECTOR') {
      if (typeof window.toggleInspector === 'function') {
        window.toggleInspector(event.data.enabled);
      }
    } else if (event.data.type === 'FASTTIFY_THEME_STUDIO_SELECT_ELEMENT') {
      if ($.inspectorEnabled !== false) {
        $.selectElement(
          event.data.sectionId,
          event.data.blockId,
          event.data.subBlockId,
          event.data.timestamp,
          event.data.elementName
        );
      }
    } else if (event.data.type === 'FASTTIFY_THEME_STUDIO_CLEAR_SELECTION') {
      $.clearSelection();
      $.lastSelectionTimestamp = 0;
    }
  };
}

/**
 * Extrae el código de los handlers de eventos
 * @returns {string} Código JavaScript con los handlers de eventos
 */
export function createEventHandlersCode() {
  return extractFunctionBody(eventHandlersModule, 'event handlers');
}
