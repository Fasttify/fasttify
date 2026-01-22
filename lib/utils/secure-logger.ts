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

import pino from 'pino';

const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';

/**
 * Configuración de Pino optimizada para Next.js
 */
const pinoConfig = {
  level: process.env.LOG_LEVEL || (IS_DEVELOPMENT ? 'debug' : 'info'),
  formatters: {
    level: (label: string) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(IS_DEVELOPMENT && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    },
  }),
};

const logger = pino(pinoConfig);

/**
 * Utilidad de logging segura que previene vulnerabilidades de cadenas de formato
 * y sanitiza datos de entrada del usuario. Usa Pino para rendimiento óptimo.
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
  private static sanitizeArgs(args: unknown[]): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    args.forEach((arg, index) => {
      if (typeof arg === 'string') {
        sanitized[`arg${index}`] = this.sanitizeString(arg);
      } else if (arg instanceof Error) {
        sanitized.error = {
          message: arg.message,
          stack: arg.stack,
          name: arg.name,
        };
      } else {
        sanitized[`arg${index}`] = arg;
      }
    });

    return sanitized;
  }

  /**
   * Log de información con sanitización
   */
  static info(message: string, ...args: unknown[]): void {
    const sanitizedMessage = this.sanitizeString(message);
    const sanitizedArgs = this.sanitizeArgs(args);

    if (Object.keys(sanitizedArgs).length > 0) {
      logger.info(sanitizedArgs, sanitizedMessage);
    } else {
      logger.info(sanitizedMessage);
    }
  }

  /**
   * Log de errores con sanitización
   */
  static error(message: string, ...args: unknown[]): void {
    const sanitizedMessage = this.sanitizeString(message);
    const sanitizedArgs = this.sanitizeArgs(args);

    if (Object.keys(sanitizedArgs).length > 0) {
      logger.error(sanitizedArgs, sanitizedMessage);
    } else {
      logger.error(sanitizedMessage);
    }
  }

  /**
   * Log de warnings con sanitización
   */
  static warn(message: string, ...args: unknown[]): void {
    const sanitizedMessage = this.sanitizeString(message);
    const sanitizedArgs = this.sanitizeArgs(args);

    if (Object.keys(sanitizedArgs).length > 0) {
      logger.warn(sanitizedArgs, sanitizedMessage);
    } else {
      logger.warn(sanitizedMessage);
    }
  }

  /**
   * Log de debug con sanitización
   */
  static debug(message: string, ...args: unknown[]): void {
    const sanitizedMessage = this.sanitizeString(message);
    const sanitizedArgs = this.sanitizeArgs(args);

    if (Object.keys(sanitizedArgs).length > 0) {
      logger.debug(sanitizedArgs, sanitizedMessage);
    } else {
      logger.debug(sanitizedMessage);
    }
  }

  /**
   * Log seguro usando especificadores de formato
   * Alternativa recomendada para casos que requieren interpolación
   */
  static secureLog(level: 'info' | 'error' | 'warn' | 'debug', format: string, ...args: unknown[]): void {
    const sanitizedArgs = this.sanitizeArgs(args);

    switch (level) {
      case 'info':
        logger.info(sanitizedArgs, format);
        break;
      case 'error':
        logger.error(sanitizedArgs, format);
        break;
      case 'warn':
        logger.warn(sanitizedArgs, format);
        break;
      case 'debug':
        logger.debug(sanitizedArgs, format);
        break;
    }
  }

  /**
   * Obtener instancia de Pino para uso avanzado
   */
  static getLogger() {
    return logger;
  }
}
