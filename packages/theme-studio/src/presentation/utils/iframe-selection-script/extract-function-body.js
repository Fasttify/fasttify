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
 * Extrae el cuerpo de una función como string, removiendo la declaración de función
 * @param {Function} fn - La función de la cual extraer el cuerpo
 * @param {string} moduleName - Nombre del módulo para mensajes de error descriptivos
 * @returns {string} El cuerpo de la función como string
 * @throws {Error} Si no se puede extraer el cuerpo de la función
 */
export function extractFunctionBody(fn, moduleName) {
  const functionString = fn.toString();
  const bodyMatch = functionString.match(/^function\s+\w+\s*\([^)]*\)\s*\{([\s\S]*)\}\s*$/);
  if (!bodyMatch) {
    throw new Error(`Cannot extract ${moduleName} module body`);
  }
  return bodyMatch[1];
}
