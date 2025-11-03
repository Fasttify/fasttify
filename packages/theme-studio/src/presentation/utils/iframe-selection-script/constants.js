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
 * Constantes y configuración para el script de selección del iframe
 * @module constants
 */

/**
 * Función que contiene el código de inicialización de constantes y estilos CSS
 * Esta función no se ejecuta directamente, se convierte a string para inyectar en el iframe
 * @param {string|null} storeDomain - El dominio de la tienda
 */
function constantsModule(storeDomain) {
  'use strict';
  if (window.self === window.top) return;
  const SELECTED_CLASS = 'fasttify-theme-studio-selected';
  const HOVER_CLASS = 'fasttify-theme-studio-hover';
  const STORE_DOMAIN = storeDomain;
  const IS_LOCALHOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const style = document.createElement('style');
  style.textContent =
    '[data-section-id].' +
    SELECTED_CLASS +
    ',' +
    '[data-block-id].' +
    SELECTED_CLASS +
    ' {' +
    '  position: relative !important;' +
    '  box-shadow: inset 0 0 0 2px #006fbb !important;' +
    '}' +
    '[data-section-id].' +
    HOVER_CLASS +
    ',' +
    '[data-block-id].' +
    HOVER_CLASS +
    ' {' +
    '  position: relative !important;' +
    '  box-shadow: inset 0 0 0 2px rgba(0, 111, 187, 0.6) !important;' +
    '}';
  document.head.appendChild(style);
  let currentSelectedElement = null;
  let hoveredElement = null;
  let lastSelectionTimestamp = 0;
  let scrollAnimationFrame = null;
}

/**
 * Extrae el código de inicialización de constantes y estilos CSS
 * @param {string|null} storeDomain - El dominio de la tienda
 * @returns {string} Código JavaScript que inicializa constantes y estilos
 */
export function createConstantsCode(storeDomain) {
  let functionBody = extractFunctionBody(constantsModule, 'constants');
  const domainValue = storeDomain ? JSON.stringify(storeDomain) : 'null';
  functionBody = functionBody.replace(/const STORE_DOMAIN = storeDomain;/, `const STORE_DOMAIN = ${domainValue};`);
  return functionBody;
}
