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

import { NextRequest, NextResponse } from 'next/server';
import jwt, { SignOptions } from 'jsonwebtoken';

/**
 * Middleware de autenticación JWT para webhooks de analytics
 */
export interface AnalyticsWebhookTokenPayload {
  storeId: string;
  eventType: string;
  type: 'analytics-webhook';
  iat?: number;
  exp?: number;
}

export class AnalyticsWebhookJWTAuth {
  private static readonly JWT_SECRET = process.env.ANALYTICS_WEBHOOK_JWT_SECRET;
  private static readonly JWT_EXPIRES_IN = '1h';
  private static readonly AUTH_HEADER = 'authorization';

  /**
   * Genera un JWT token para el webhook
   */
  static generateToken(storeId: string, eventType: string): string {
    if (!this.JWT_SECRET) {
      throw new Error('ANALYTICS_WEBHOOK_JWT_SECRET or JWT_SECRET environment variable is not set');
    }

    const payload: AnalyticsWebhookTokenPayload = {
      storeId,
      eventType,
      type: 'analytics-webhook',
    };

    const options: SignOptions = {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'fasttify-renderer',
      audience: 'analytics-webhook',
    };

    return jwt.sign(payload, this.JWT_SECRET, options);
  }

  /**
   * Verifica y decodifica el JWT token
   */
  static verifyToken(token: string): {
    isValid: boolean;
    payload?: AnalyticsWebhookTokenPayload;
    error?: string;
  } {
    if (!this.JWT_SECRET) {
      return {
        isValid: false,
        error: 'JWT secret not configured',
      };
    }

    try {
      const payload = jwt.verify(token, this.JWT_SECRET, {
        audience: 'analytics-webhook',
        issuer: 'fasttify-renderer',
      }) as AnalyticsWebhookTokenPayload;

      return {
        isValid: true,
        payload,
      };
    } catch (error) {
      let errorMessage = 'Invalid JWT token';

      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          errorMessage = 'JWT token has expired';
        } else if (error.message.includes('signature')) {
          errorMessage = 'JWT signature verification failed';
        } else if (error.message.includes('audience')) {
          errorMessage = 'JWT audience verification failed';
        } else if (error.message.includes('issuer')) {
          errorMessage = 'JWT issuer verification failed';
        }
      }

      return {
        isValid: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Verifica la autenticación de la solicitud
   */
  static verifyRequest(request: NextRequest): {
    isValid: boolean;
    payload?: AnalyticsWebhookTokenPayload;
    error?: string;
  } {
    // Obtener el token del header Authorization
    const authHeader = request.headers.get(this.AUTH_HEADER);

    if (!authHeader) {
      return {
        isValid: false,
        error: 'Missing Authorization header',
      };
    }

    // Extraer el token del formato "Bearer <token>"
    const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!tokenMatch) {
      return {
        isValid: false,
        error: 'Invalid Authorization header format. Expected: Bearer <token>',
      };
    }

    const token = tokenMatch[1];
    return this.verifyToken(token);
  }

  /**
   * Crea una respuesta de error de autenticación
   */
  static createAuthErrorResponse(error: string): NextResponse {
    return NextResponse.json(
      {
        error: 'Authentication failed',
        message: error,
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  /**
   * Middleware para verificar autenticación JWT
   */
  static middleware(request: NextRequest) {
    const authResult = this.verifyRequest(request);

    if (!authResult.isValid && authResult.error) {
      return this.createAuthErrorResponse(authResult.error);
    }

    return null; // Continúa con la siguiente función
  }
}

/**
 * Función helper para usar en las rutas de API
 */
export function verifyAnalyticsWebhookJWTAuth(request: NextRequest) {
  return AnalyticsWebhookJWTAuth.verifyRequest(request);
}
