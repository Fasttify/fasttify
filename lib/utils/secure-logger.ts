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
 * Utilidad de logging segura que previene vulnerabilidades de cadenas de formato
 * y sanitiza datos de entrada del usuario
 */
export class SecureLogger {
  /**
   * Sanitizar string para prevenir inyección de formato
   */
  private static sanitizeString(input: unknown): string {
    if (typeof input !== 'string') {
      return String(input);
    }

    // Reemplazar caracteres de formato comunes que podrían ser problemáticos
    return input
      .replace(/%/g, '%%') // Escapar % para prevenir especificadores de formato
      .replace(/\r/g, '\\r') // Escapar caracteres de control
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t')
      .replace(/\0/g, '\\0'); // Null bytes
  }

  /**
   * Sanitizar todos los argumentos
   */
  private static sanitizeArgs(args: unknown[]): unknown[] {
    return args.map((arg) => {
      if (typeof arg === 'string') {
        return this.sanitizeString(arg);
      }
      return arg;
    });
  }

  /**
   * Log de información con sanitización
   */
  static info(message: string, ...args: unknown[]): void {
    const sanitizedMessage = this.sanitizeString(message);
    const sanitizedArgs = this.sanitizeArgs(args);
    console.log(sanitizedMessage, ...sanitizedArgs);
  }

  /**
   * Log de errores con sanitización
   */
  static error(message: string, ...args: unknown[]): void {
    const sanitizedMessage = this.sanitizeString(message);
    const sanitizedArgs = this.sanitizeArgs(args);
    console.error(sanitizedMessage, ...sanitizedArgs);
  }

  /**
   * Log de warnings con sanitización
   */
  static warn(message: string, ...args: unknown[]): void {
    const sanitizedMessage = this.sanitizeString(message);
    const sanitizedArgs = this.sanitizeArgs(args);
    console.warn(sanitizedMessage, ...sanitizedArgs);
  }

  /**
   * Log de debug con sanitización
   */
  static debug(message: string, ...args: unknown[]): void {
    const sanitizedMessage = this.sanitizeString(message);
    const sanitizedArgs = this.sanitizeArgs(args);
    console.debug(sanitizedMessage, ...sanitizedArgs);
  }

  /**
   * Log seguro usando especificadores de formato
   * Alternativa recomendada para casos que requieren interpolación
   */
  static secureLog(level: 'info' | 'error' | 'warn' | 'debug', format: string, ...args: unknown[]): void {
    const sanitizedArgs = this.sanitizeArgs(args);

    switch (level) {
      case 'info':
        console.log(format, ...sanitizedArgs);
        break;
      case 'error':
        console.error(format, ...sanitizedArgs);
        break;
      case 'warn':
        console.warn(format, ...sanitizedArgs);
        break;
      case 'debug':
        console.debug(format, ...sanitizedArgs);
        break;
    }
  }
}
