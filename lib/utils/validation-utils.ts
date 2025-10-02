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
 * Utilidades para validación de datos
 */

/**
 * Valida si un email tiene formato válido
 * @param email - Email a validar
 * @returns true si el email es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Valida si un archivo es una imagen válida
 * @param file - Archivo a validar
 * @returns true si es una imagen válida
 */
export function isValidImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Valida el tamaño de un archivo
 * @param file - Archivo a validar
 * @param maxSizeBytes - Tamaño máximo en bytes
 * @returns true si el tamaño es válido
 */
export function isValidFileSize(file: File, maxSizeBytes: number): boolean {
  return file.size <= maxSizeBytes;
}

/**
 * Valida un archivo completo (tipo y tamaño)
 * @param file - Archivo a validar
 * @param options - Opciones de validación
 * @returns Resultado de la validación
 */
export function validateFile(
  file: File,
  options: {
    maxSizeBytes?: number;
    allowedTypes?: string[];
    isImage?: boolean;
  } = {}
): { isValid: boolean; error?: string } {
  const { maxSizeBytes, allowedTypes, isImage = false } = options;

  // Validar tipo de archivo
  if (isImage && !isValidImageFile(file)) {
    return { isValid: false, error: 'El archivo no es una imagen válida' };
  }

  if (allowedTypes && allowedTypes.length > 0) {
    const isValidType = allowedTypes.some((type) => file.type === type || file.type.startsWith(type));
    if (!isValidType) {
      return {
        isValid: false,
        error: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`,
      };
    }
  }

  // Validar tamaño
  if (maxSizeBytes && !isValidFileSize(file, maxSizeBytes)) {
    const maxSizeMB = (maxSizeBytes / 1024 / 1024).toFixed(2);
    const currentSizeMB = (file.size / 1024 / 1024).toFixed(2);
    return {
      isValid: false,
      error: `Archivo demasiado grande (máximo ${maxSizeMB}MB, actual: ${currentSizeMB}MB)`,
    };
  }

  return { isValid: true };
}

/**
 * Valida si una URL tiene formato válido
 * @param url - URL a validar
 * @returns true si la URL es válida
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida si un string no está vacío
 * @param value - Valor a validar
 * @returns true si no está vacío
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Valida si un número está en un rango válido
 * @param value - Número a validar
 * @param min - Valor mínimo
 * @param max - Valor máximo
 * @returns true si está en el rango
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Valida si un string tiene una longitud válida
 * @param value - String a validar
 * @param minLength - Longitud mínima
 * @param maxLength - Longitud máxima
 * @returns true si tiene longitud válida
 */
export function isValidLength(value: string, minLength: number, maxLength: number): boolean {
  const length = value.trim().length;
  return length >= minLength && length <= maxLength;
}

/**
 * Valida si un string contiene solo caracteres alfanuméricos
 * @param value - String a validar
 * @returns true si contiene solo caracteres alfanuméricos
 */
export function isAlphanumeric(value: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(value);
}

/**
 * Valida si un string contiene solo caracteres alfanuméricos y espacios
 * @param value - String a validar
 * @returns true si contiene solo caracteres alfanuméricos y espacios
 */
export function isAlphanumericWithSpaces(value: string): boolean {
  return /^[a-zA-Z0-9\s]+$/.test(value);
}

/**
 * Valida si un string es un slug válido
 * @param value - String a validar
 * @returns true si es un slug válido
 */
export function isValidSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

/**
 * Valida si un string es un color hexadecimal válido
 * @param value - String a validar
 * @returns true si es un color hexadecimal válido
 */
export function isValidHexColor(value: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
}

/**
 * Valida si un string es un código postal válido (formato colombiano)
 * @param value - String a validar
 * @returns true si es un código postal válido
 */
export function isValidPostalCode(value: string): boolean {
  return /^\d{6}$/.test(value);
}

/**
 * Valida si un string es un número de teléfono válido (formato colombiano)
 * @param value - String a validar
 * @returns true si es un número de teléfono válido
 */
export function isValidPhoneNumber(value: string): boolean {
  // Formato colombiano: +57, 57, o sin prefijo (10 dígitos)
  const phoneRegex = /^(\+?57)?[3][0-9]{9}$/;
  return phoneRegex.test(value.replace(/\s/g, ''));
}

/**
 * Valida si un string es un número de documento válido (formato colombiano)
 * @param value - String a validar
 * @returns true si es un número de documento válido
 */
export function isValidDocumentNumber(value: string): boolean {
  // Cédula de ciudadanía: 6-10 dígitos
  // Cédula de extranjería: 6-10 dígitos
  // NIT: 9-11 dígitos
  return /^\d{6,11}$/.test(value);
}

/**
 * Valida si un string es una contraseña segura
 * @param password - Contraseña a validar
 * @param options - Opciones de validación
 * @returns Resultado de la validación
 */
export function validatePassword(
  password: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  } = {}
): { isValid: boolean; errors: string[] } {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
  } = options;

  const errors: string[] = [];

  if (password.length < minLength) {
    errors.push(`La contraseña debe tener al menos ${minLength} caracteres`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }

  if (requireNumbers && !/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
