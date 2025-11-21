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
 * Funciones para modificar enlaces relativos con el dominio de la tienda
 * @module domain-links
 */

/**
 * Función que contiene la función setupDomainLinks
 * Esta función no se ejecuta directamente, se convierte a string para inyectar en el iframe
 */
function domainLinksModule() {
  var $ = window.__FASTTIFY_THEME_STUDIO_NS__;
  /**
   * Configura los enlaces relativos para mostrar el dominio completo de la tienda
   * En localhost solo agrega tooltips, en producción modifica los hrefs
   */
  $.setupDomainLinks = function () {
    if (!$.STORE_DOMAIN) return;

    // Modificar todos los enlaces para que muestren el dominio de la tienda en el tooltip
    // En localhost, los enlaces relativos funcionan bien, solo agregamos el tooltip
    // En producción, modificamos el href pero interceptamos los clicks
    var updateLinks = function () {
      var links = document.querySelectorAll('a[href]');
      links.forEach(function (link) {
        var href = link.getAttribute('href');
        if (
          href &&
          !href.startsWith('http://') &&
          !href.startsWith('https://') &&
          !href.startsWith('mailto:') &&
          !href.startsWith('tel:') &&
          !href.startsWith('#')
        ) {
          // Guardar el href original en un data attribute si no existe
          if (!link.hasAttribute('data-original-href')) {
            link.setAttribute('data-original-href', href);
          }

          // Construir la URL completa con el dominio de la tienda para el tooltip
          var fullUrl = 'https://' + $.STORE_DOMAIN + (href.startsWith('/') ? href : '/' + href);

          // En localhost, solo agregar title para el tooltip sin modificar href
          // En producción, modificar href para que el navegador muestre la URL completa
          if ($.IS_LOCALHOST) {
            // Solo agregar title si no tiene uno personalizado
            if (!link.hasAttribute('title')) {
              link.setAttribute('title', fullUrl);
            }
          } else {
            // En producción, modificar el href para que el navegador muestre la URL completa
            link.setAttribute('href', fullUrl);
          }
        }
      });
    };

    // Ejecutar inmediatamente y cuando el DOM cambie
    updateLinks();

    // Observar cambios en el DOM para actualizar nuevos enlaces
    if (typeof MutationObserver !== 'undefined') {
      var observer = new MutationObserver(function (mutations) {
        updateLinks();
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  };
}

/**
 * Extrae el código de la función setupDomainLinks
 * @returns {string} Código JavaScript con la función setupDomainLinks
 */
export function createDomainLinksCode() {
  return extractFunctionBody(domainLinksModule, 'domain links');
}
