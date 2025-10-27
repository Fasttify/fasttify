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

// Helpers para mensajes, títulos, descripciones y sugerencias de errores
import type { TemplateError } from '../../types';

export function getFriendlyMessage(errorType: TemplateError['type']): string {
  const messages = {
    STORE_NOT_FOUND: 'Lo sentimos, la tienda que buscas no existe o ha sido desactivada.',
    TEMPLATE_NOT_FOUND: 'Esta tienda está siendo configurada y estará disponible pronto.',
    RENDER_ERROR: 'Experimentamos un problema técnico temporal. Nuestro equipo ya está trabajando en solucionarlo.',
    DATA_ERROR: 'Hubo un problema al cargar los datos de la tienda. Inténtalo de nuevo en unos momentos.',
    STORE_NOT_ACTIVE: 'La tienda que buscas no está activa o no está pagada.',
  };
  return messages[errorType] || 'Se produjo un error inesperado.';
}

export function getErrorSuggestions(errorType: TemplateError['type']): string[] {
  const suggestions = {
    STORE_NOT_FOUND: [
      'Verificar que la URL de la tienda esté escrita correctamente',
      'Contactar al propietario de la tienda si crees que debería existir',
      'Explorar otras tiendas en Fasttify',
    ],
    TEMPLATE_NOT_FOUND: [
      'La tienda está en proceso de configuración',
      'Vuelve a intentar en unos minutos',
      'Contacta al propietario si el problema persiste',
    ],
    RENDER_ERROR: [
      'Recargar la página',
      'Intentar navegar a otra sección',
      'Contactar soporte si el problema persiste',
    ],
    DATA_ERROR: [
      'Verificar tu conexión a internet',
      'Intentar de nuevo en unos momentos',
      'Contactar soporte si el error continúa',
    ],
    STORE_NOT_ACTIVE: [
      'Verificar que la tienda esté activa y pagada',
      'Contactar al propietario de la tienda si crees que debería estar activa',
      'Explorar otras tiendas en Fasttify',
    ],
  };
  return suggestions[errorType] || ['Intentar de nuevo más tarde'];
}

export function getErrorTitle(errorType: TemplateError['type'], storeName?: string): string {
  const storeNamePart = storeName ? ` | ${storeName}` : '';
  const titles = {
    STORE_NOT_FOUND: `Tienda No Encontrada${storeNamePart} - Fasttify`,
    TEMPLATE_NOT_FOUND: `${storeName || 'Tienda'} en Construcción - Fasttify`,
    RENDER_ERROR: `${storeName || 'Tienda'} - Error Temporal - Fasttify`,
    DATA_ERROR: `${storeName || 'Tienda'} - Error de Conexión - Fasttify`,
    STORE_NOT_ACTIVE: `${storeName || 'Tienda'} No Activa - Fasttify`,
  };
  return titles[errorType] || `${storeName || 'Tienda'} - Error - Fasttify`;
}

export function getErrorDescription(errorType: TemplateError['type']): string {
  const descriptions = {
    STORE_NOT_FOUND: 'La tienda que buscas no existe o no está disponible en este momento.',
    TEMPLATE_NOT_FOUND: 'Esta tienda está siendo configurada y estará disponible pronto.',
    RENDER_ERROR: 'Se produjo un error técnico temporal. Nuestro equipo está trabajando para solucionarlo.',
    DATA_ERROR: 'Hubo un problema al cargar los datos. Inténtalo de nuevo en unos momentos.',
    STORE_NOT_ACTIVE: 'La tienda que buscas no está activa o no está pagada.',
  };
  return descriptions[errorType] || 'Se produjo un error inesperado.';
}

export function extractStoreName(domain: string): string {
  if (domain.includes('.') && !domain.endsWith('.fasttify.com')) {
    const withoutTLD = domain.split('.').slice(0, -1).join('.');
    return withoutTLD.charAt(0).toUpperCase() + withoutTLD.slice(1);
  }
  const parts = domain.split('.');
  const storeName = parts[0] || domain;
  return storeName.charAt(0).toUpperCase() + storeName.slice(1);
}
