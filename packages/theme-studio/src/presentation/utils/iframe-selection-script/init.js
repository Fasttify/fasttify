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
 * Código de inicialización y cleanup del script
 * @module init
 */

/**
 * Función que contiene el código de inicialización
 * Esta función no se ejecuta directamente, se convierte a string para inyectar en el iframe
 */
function initModule() {
  var $ = window.__FASTTIFY_THEME_STUDIO_NS__;
  var listenersRegistered = false;

  /**
   * Verifica si hay elementos seleccionables en el DOM
   */
  function hasSelectableElements() {
    return (
      document.querySelectorAll('[data-section-id]').length > 0 ||
      document.querySelectorAll('[data-block-id]').length > 0 ||
      document.querySelectorAll('[data-sub-block-id]').length > 0
    );
  }

  /**
   * Registra los event listeners
   */
  function registerEventListeners() {
    if (listenersRegistered) {
      return;
    }
    document.addEventListener('click', $.handleClick, true);
    document.addEventListener('mouseenter', $.handleMouseEnter, true);
    document.addEventListener('mouseleave', $.handleMouseLeave, true);
    window.addEventListener('message', $.handleMessage);
    listenersRegistered = true;
  }

  /**
   * Inicializa los event listeners y configura los enlaces de dominio
   * Espera a que haya elementos seleccionables antes de registrar listeners
   */
  function init() {
    // Configurar enlaces de dominio inmediatamente (no depende de elementos)
    $.setupDomainLinks();

    // Intentar registrar listeners inmediatamente si hay elementos
    if (hasSelectableElements()) {
      registerEventListeners();
      return;
    }

    // Si no hay elementos, esperar y verificar periódicamente
    var attempts = 0;
    var maxAttempts = 50; // 5 segundos máximo (50 * 100ms)

    var checkInterval = setInterval(function () {
      attempts++;
      if (hasSelectableElements()) {
        registerEventListeners();
        clearInterval(checkInterval);
      } else if (attempts >= maxAttempts) {
        registerEventListeners();
        clearInterval(checkInterval);
      }
    }, 100);

    // También usar MutationObserver para detectar cuando se agregan elementos
    if (typeof MutationObserver !== 'undefined') {
      var observer = new MutationObserver(function (mutations) {
        if (!listenersRegistered && hasSelectableElements()) {
          registerEventListeners();
          observer.disconnect();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-section-id', 'data-block-id', 'data-sub-block-id'],
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('beforeunload', function () {
    if (listenersRegistered) {
      document.removeEventListener('click', $.handleClick, true);
      document.removeEventListener('mouseenter', $.handleMouseEnter, true);
      document.removeEventListener('mouseleave', $.handleMouseLeave, true);
      window.removeEventListener('message', $.handleMessage);
    }
  });
}

/**
 * Extrae el código de inicialización y cleanup
 * @returns {string} Código JavaScript con la función init y su ejecución
 */
export function createInitCode() {
  return extractFunctionBody(initModule, 'init');
}
