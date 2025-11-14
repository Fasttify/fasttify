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
  /**
   * Inicializa los event listeners y configura los enlaces de dominio
   */
  function init() {
    console.log('[ThemeStudio Script] Inicializando script en iframe');
    document.addEventListener('click', handleClick, true);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);
    window.addEventListener('message', handleMessage);
    setupDomainLinks();
    console.log('[ThemeStudio Script] Script inicializado correctamente');
  }
  if (document.readyState === 'loading') {
    console.log('[ThemeStudio Script] Documento cargando, esperando DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', init);
  } else {
    console.log('[ThemeStudio Script] Documento listo, inicializando inmediatamente');
    init();
  }
  window.addEventListener('beforeunload', () => {
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('mouseenter', handleMouseEnter, true);
    document.removeEventListener('mouseleave', handleMouseLeave, true);
    window.removeEventListener('message', handleMessage);
  });
}

/**
 * Extrae el código de inicialización y cleanup
 * @returns {string} Código JavaScript con la función init y su ejecución
 */
export function createInitCode() {
  return extractFunctionBody(initModule, 'init');
}
