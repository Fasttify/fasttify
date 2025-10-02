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
 * Utilidades para generación de IDs únicos
 */

/**
 * Genera un UUID v4 simple sin dependencias externas
 * @returns UUID v4 string
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Genera un ID único corto para evitar nombres muy largos
 * @returns ID corto string
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Genera un ID único con timestamp
 * @param prefix - Prefijo opcional para el ID
 * @returns ID con timestamp
 */
export function generateTimestampId(prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

/**
 * Genera un ID único para archivos
 * @param filename - Nombre del archivo
 * @returns ID único para el archivo
 */
export function generateFileId(filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const cleanFilename = filename.replace(/[^a-zA-Z0-9]/g, '_');
  return `file_${cleanFilename}_${timestamp}_${random}`;
}

/**
 * Genera un ID único para procesos
 * @param processType - Tipo de proceso
 * @param identifier - Identificador adicional
 * @returns ID único para el proceso
 */
export function generateProcessId(processType: string, identifier: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${processType}-${identifier}-${timestamp}-${random}`;
}

/**
 * Genera un ID único para S3 keys
 * @param storeId - ID de la tienda
 * @param filename - Nombre del archivo
 * @param prefix - Prefijo opcional
 * @returns S3 key único
 */
export function generateS3Key(storeId: string, filename: string, prefix: string = 'products'): string {
  const timestamp = Date.now();
  const uniqueId = generateShortId();
  return `${prefix}/${storeId}/${timestamp}-${uniqueId}-${filename}`;
}

/**
 * Genera un ID único para sesiones
 * @returns ID de sesión único
 */
export function generateSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `session_${timestamp}_${random}`;
}

/**
 * Genera un ID único para órdenes
 * @param storeId - ID de la tienda
 * @returns ID de orden único
 */
export function generateOrderId(storeId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${storeId}-${timestamp}-${random}`;
}

/**
 * Genera un ID único para productos
 * @param storeId - ID de la tienda
 * @returns ID de producto único
 */
export function generateProductId(storeId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PROD-${storeId}-${timestamp}-${random}`;
}

/**
 * Genera un ID único para carritos
 * @param userId - ID del usuario (opcional)
 * @returns ID de carrito único
 */
export function generateCartId(userId?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 12);
  return userId ? `cart_${userId}_${timestamp}_${random}` : `cart_${timestamp}_${random}`;
}

/**
 * Genera un ID único para checkouts
 * @param storeId - ID de la tienda
 * @returns ID de checkout único
 */
export function generateCheckoutId(storeId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CHK-${storeId}-${timestamp}-${random}`;
}

/**
 * Genera un ID único para notificaciones
 * @param storeId - ID de la tienda
 * @returns ID de notificación único
 */
export function generateNotificationId(storeId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `NOT-${storeId}-${timestamp}-${random}`;
}

/**
 * Genera un ID único para temas
 * @param storeId - ID de la tienda
 * @returns ID de tema único
 */
export function generateThemeId(storeId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `THEME-${storeId}-${timestamp}-${random}`;
}

/**
 * Genera un ID único para campañas de email
 * @returns ID de campaña único
 */
export function generateCampaignId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CAMP-${timestamp}-${random}`;
}

/**
 * Genera un ID único para trabajos de email
 * @returns ID de trabajo único
 */
export function generateEmailJobId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EMAIL-${timestamp}-${random}`;
}

/**
 * Genera un ID consistente basado en una clave S3
 * @param key - Clave S3
 * @returns ID consistente
 */
export function generateConsistentId(key: string): string {
  // Usar una combinación de hash simple de la clave + timestamp para ID único
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Combinar con timestamp de la clave si está disponible
  const keyParts = key.split('/');
  const filenamePart = keyParts[keyParts.length - 1];
  const timestampMatch = filenamePart.match(/^(\d+)-/);
  const timestamp = timestampMatch ? timestampMatch[1] : Date.now().toString();

  return `id_${Math.abs(hash)}_${timestamp}`;
}

/**
 * Genera un ID de fallback para compatibilidad hacia atrás
 * @param key - Clave S3
 * @param filename - Nombre del archivo
 * @returns ID de fallback
 */
export function generateFallbackId(key: string, _filename: string): string {
  // Crear hash simple del key
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Extraer timestamp del key si está disponible
  const timestampMatch = key.match(/\/(\d+)-/);
  const timestamp = timestampMatch ? timestampMatch[1] : Date.now().toString();

  return `fallback_${Math.abs(hash)}_${timestamp}`;
}
