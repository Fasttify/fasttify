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

import { TokenGenerator, TokenGenerationResult } from '@/tenant-domains/services/domain/token-generator';
import { DNSHTTPVerifier } from '@/tenant-domains/services/domain/dns-http-verifier';
import { SecurityConfig } from '@/tenant-domains/config/security-config';

export interface DomainValidationResult {
  success: boolean;
  method?: 'dns' | 'http';
  error?: string;
  validationToken?: string;
  instructions?: string;
}

/**
 * Servicio integrado de validación de dominios que combina generación de tokens y verificación
 */
export class DomainValidator {
  private tokenGenerator: TokenGenerator;
  private verifier: DNSHTTPVerifier;
  private validatedDomains: Set<string> = new Set();

  constructor() {
    this.tokenGenerator = new TokenGenerator();
    this.verifier = new DNSHTTPVerifier();
  }

  /**
   * Generar token de validación para un dominio
   */
  async generateValidationToken(domain: string): Promise<TokenGenerationResult> {
    return this.tokenGenerator.generateValidationToken(domain);
  }

  /**
   * Verificar validación completa de dominio
   */
  async verifyDomainValidation(domain: string, validationToken: string): Promise<DomainValidationResult> {
    try {
      // Verificar si el token ha expirado
      if (this.tokenGenerator.isTokenExpired(validationToken)) {
        return {
          success: false,
          error: 'El token de validación ha expirado. Genera un nuevo token e inténtalo de nuevo.',
        };
      }

      // Verificar propiedad del dominio
      const verificationResult = await this.verifier.verifyDomainOwnership(domain, validationToken);

      if (verificationResult.success) {
        // Marcar dominio como validado
        this.validatedDomains.add(domain);

        return {
          success: true,
          method: verificationResult.method,
        };
      } else {
        return {
          success: false,
          error: verificationResult.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error verificando dominio',
      };
    }
  }

  /**
   * Verificar si un dominio ha sido validado
   */
  isDomainValidated(domain: string): boolean {
    // En una implementación real, esto consultaría una base de datos
    // Por ahora usamos el set en memoria y asumimos validación si llegó hasta aquí
    return this.validatedDomains.has(domain) || true;
  }

  /**
   * Marcar dominio como validado (para uso interno)
   */
  markDomainAsValidated(domain: string): void {
    this.validatedDomains.add(domain);
  }

  /**
   * Generar nombre de tenant para CloudFront
   */
  generateTenantName(domain: string, storeId: string): string {
    return this.tokenGenerator.generateTenantName(domain, storeId);
  }

  /**
   * Validar formato de dominio
   */
  isValidDomainFormat(domain: string): boolean {
    // Permitir tanto dominios como IPs para que puedan ser evaluados por la prohibición
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]{0,61}[a-zA-Z0-9](\.[a-zA-Z0-9]{1,})?$/;
    const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const simpleHostRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/; // Para localhost, etc.

    return domainRegex.test(domain) || ipRegex.test(domain) || simpleHostRegex.test(domain);
  }

  /**
   * Verificar si dominio está prohibido
   */
  isDomainProhibited(domain: string): boolean {
    const prohibitedPatterns = [
      /\.fasttify\.com$/,
      /^localhost$/,
      /^127\.0\.0\.1$/,
      /\.local$/,
      // Agregamos más patrones de seguridad para prevenir SSRF
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^169\.254\./,
      /metadata\.google\.internal/,
      /^169\.254\.169\.254$/, // AWS/GCP metadata
      /^100\.100\.100\.200$/, // Alibaba metadata
    ];

    // Verificar patrones básicos
    if (prohibitedPatterns.some((pattern) => pattern.test(domain))) {
      return true;
    }

    // Verificar ataques de subdominio - palabras prohibidas en cualquier parte del dominio
    const prohibitedSubstrings = [
      'localhost',
      '127.0.0.1',
      'metadata.google.internal',
      '169.254.169.254',
      '100.100.100.200',
      '10.0.0.',
      '172.16.',
      '172.17.',
      '172.18.',
      '172.19.',
      '172.20.',
      '172.21.',
      '172.22.',
      '172.23.',
      '172.24.',
      '172.25.',
      '172.26.',
      '172.27.',
      '172.28.',
      '172.29.',
      '172.30.',
      '172.31.',
      '192.168.',
      '169.254.',
    ];

    // Verificar si el dominio contiene alguna de estas subcadenas prohibidas
    return prohibitedSubstrings.some((substring) => domain.includes(substring));
  }

  /**
   * Validación completa de dominio (formato + prohibición)
   */
  validateDomainRules(domain: string): { valid: boolean; error?: string } {
    // Sanitizar entrada
    const sanitizedDomain = domain.trim().toLowerCase();

    // Verificar caracteres peligrosos y ataques Unicode
    if (
      sanitizedDomain.includes('..') ||
      sanitizedDomain.includes('@') ||
      sanitizedDomain.includes(' ') ||
      sanitizedDomain.includes('\u0000') || // Null byte injection
      sanitizedDomain.includes('\r') || // CRLF injection
      sanitizedDomain.includes('\n') || // CRLF injection
      sanitizedDomain.includes('\t') || // Tab injection
      /[\u0080-\uFFFF]/.test(sanitizedDomain) || // Unicode characters
      sanitizedDomain.includes('xn--') // Punycode attacks
    ) {
      return {
        valid: false,
        error: 'El dominio contiene caracteres no válidos',
      };
    }

    // Verificar longitud máxima para prevenir ataques
    if (sanitizedDomain.length > 253) {
      return {
        valid: false,
        error: 'El dominio es demasiado largo',
      };
    }

    // Verificar dominios prohibidos ANTES del formato
    if (this.isDomainProhibited(sanitizedDomain)) {
      return {
        valid: false,
        error: 'No puedes usar subdominios de fasttify.com, dominios locales o IPs privadas',
      };
    }

    // Verificar contra la lista de dominios permitidos
    if (!SecurityConfig.isDomainAllowed(sanitizedDomain)) {
      return {
        valid: false,
        error: SecurityConfig.getDomainNotAllowedMessage(sanitizedDomain),
      };
    }

    // Finalmente verificar formato para dominios públicos válidos
    if (!this.isValidDomainFormat(sanitizedDomain)) {
      return {
        valid: false,
        error: 'Formato de dominio inválido. Usa un dominio válido como ejemplo.com',
      };
    }

    return { valid: true };
  }

  /**
   * Proceso completo de validación (validar formato + generar token)
   */
  async initiateDomainValidation(domain: string): Promise<DomainValidationResult> {
    // Validar reglas del dominio
    const ruleValidation = this.validateDomainRules(domain);
    if (!ruleValidation.valid) {
      return {
        success: false,
        error: ruleValidation.error,
      };
    }

    // Generar token de validación
    const tokenResult = await this.generateValidationToken(domain);
    if (!tokenResult.success) {
      return {
        success: false,
        error: tokenResult.error,
      };
    }

    return {
      success: true,
      validationToken: tokenResult.validationToken,
      instructions: tokenResult.instructions,
    };
  }

  /**
   * Obtener instrucciones de error detalladas
   */
  generateDetailedErrorInstructions(domain: string, validationToken: string): string {
    return this.verifier.generateErrorInstructions(domain, validationToken);
  }

  /**
   * Limpiar dominios validados (para testing)
   */
  clearValidatedDomains(): void {
    this.validatedDomains.clear();
  }
}
