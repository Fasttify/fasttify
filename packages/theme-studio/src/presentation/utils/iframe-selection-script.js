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
 * Script que se inyecta en el iframe para manejar la selección bidireccional
 * entre el sidebar y el preview del tema.
 *
 * Este script:
 * 1. Detecta clicks en elementos con data-section-id o data-block-id
 * 2. Envía postMessage al padre con el ID encontrado
 * 3. Escucha mensajes del padre para aplicar/quitar resaltado
 * 4. Aplica estilos CSS para el outline azul
 */

export const iframeSelectionScript = `(function() {
  'use strict';
  if (window.self === window.top) return;
  const SELECTED_CLASS = 'fasttify-theme-studio-selected';
  const HOVER_CLASS = 'fasttify-theme-studio-hover';
  const style = document.createElement('style');
  style.textContent =
    '[data-section-id].' + SELECTED_CLASS + ',' +
    '[data-block-id].' + SELECTED_CLASS + ' {' +
    '  outline: 2px solid #006fbb !important;' +
    '  outline-offset: 2px !important;' +
    '  position: relative !important;' +
    '}' +
    '[data-section-id].' + HOVER_CLASS + ',' +
    '[data-block-id].' + HOVER_CLASS + ' {' +
    '  outline: 2px dashed #006fbb !important;' +
    '  outline-offset: 2px !important;' +
    '  position: relative !important;' +
    '}';
  document.head.appendChild(style);
  let currentSelectedElement = null;
  let hoveredElement = null;
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
  function getElementIds(element) {
    return {
      sectionId: element.getAttribute('data-section-id'),
      blockId: element.getAttribute('data-block-id'),
    };
  }
  function clearSelection() {
    if (currentSelectedElement) {
      currentSelectedElement.classList.remove(SELECTED_CLASS);
      currentSelectedElement = null;
    }
  }
  function selectElement(sectionId, blockId) {
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
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
  function handleClick(event) {
    const target = event.target;
    const selectableElement = findSelectableElement(target);
    if (selectableElement) {
      // Solo prevenir el comportamiento por defecto si el elemento clickeado es directamente el elemento seleccionable
      // Esto permite que enlaces, botones y otros elementos interactivos funcionen normalmente
      const isDirectSelectable = target === selectableElement;

      // Si es un elemento interactivo (enlace, botón, input, etc.), no prevenir el comportamiento
      const isInteractiveElement = target.tagName === 'A' ||
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
        window.parent.postMessage({
          type: 'FASTTIFY_THEME_STUDIO_ELEMENT_CLICKED',
          sectionId,
          blockId,
        }, '*');
      }
    }
  }
  function handleMouseEnter(event) {
    const target = event.target;
    const selectableElement = findSelectableElement(target);
    if (selectableElement && selectableElement !== currentSelectedElement) {
      selectableElement.classList.add(HOVER_CLASS);
      hoveredElement = selectableElement;
    }
  }
  function handleMouseLeave(event) {
    if (hoveredElement) {
      hoveredElement.classList.remove(HOVER_CLASS);
      hoveredElement = null;
    }
  }
  function handleMessage(event) {
    const isLocalhost = window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1';
    const isSameOrigin = event.origin === window.location.origin;
    if (!isSameOrigin && !isLocalhost) return;
    if (event.data && event.data.type === 'FASTTIFY_THEME_STUDIO_SELECT_ELEMENT') {
      selectElement(event.data.sectionId, event.data.blockId);
    } else if (event.data && event.data.type === 'FASTTIFY_THEME_STUDIO_CLEAR_SELECTION') {
      clearSelection();
    }
  }
  function init() {
    document.addEventListener('click', handleClick, true);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);
    window.addEventListener('message', handleMessage);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('beforeunload', () => {
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('mouseenter', handleMouseEnter, true);
    document.removeEventListener('mouseleave', handleMouseLeave, true);
    window.removeEventListener('message', handleMessage);
  });
})();`;
