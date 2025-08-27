import jwt, { SignOptions } from 'jsonwebtoken';
import { randomBytes } from 'crypto';

// Obtener el secret del JWT desde variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Tipos para el payload del JWT
export interface AuthTokenPayload {
  email: string;
  type: 'order-access' | 'auth' | 'session';
  storeId?: string;
  iat?: number;
  exp?: number;
}

export interface SessionTokenPayload {
  email: string;
  sessionId: string;
  type: 'session';
  iat?: number;
  exp?: number;
}

/**
 * Genera un JWT para acceso a órdenes
 * @param email Email del usuario
 * @param storeId ID de la tienda (opcional)
 * @param expiresIn Tiempo de expiración (default: 24h)
 * @returns JWT token
 */
export function generateOrderAccessToken(email: string, storeId?: string, expiresIn: string = '24h'): string {
  const payload: AuthTokenPayload = {
    email,
    type: 'order-access',
    storeId,
  };

  const options: SignOptions = {
    expiresIn: expiresIn as unknown as number,
    issuer: 'fasttify-orders',
    audience: 'fasttify-customers',
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Genera un JWT para sesión de usuario
 * @param email Email del usuario
 * @param expiresIn Tiempo de expiración (default: 2h)
 * @returns JWT token
 */
export function generateSessionToken(email: string, expiresIn: string = '2h'): string {
  const sessionId = randomBytes(16).toString('hex');

  const payload: SessionTokenPayload = {
    email,
    sessionId,
    type: 'session',
  };

  const options: SignOptions = {
    expiresIn: expiresIn as unknown as number,
    issuer: 'fasttify-orders',
    audience: 'fasttify-customers',
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verifica y decodifica un JWT
 * @param token JWT token
 * @returns Payload decodificado o null si es inválido
 */
export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'fasttify-orders',
      audience: 'fasttify-customers',
    }) as AuthTokenPayload;

    return decoded;
  } catch (error) {
    console.error('Error verificando token JWT:', error);
    return null;
  }
}

/**
 * Verifica y decodifica un JWT de sesión
 * @param token JWT token
 * @returns Payload decodificado o null si es inválido
 */
export function verifySessionToken(token: string): SessionTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'fasttify-orders',
      audience: 'fasttify-customers',
    }) as SessionTokenPayload;

    return decoded;
  } catch (error) {
    console.error('Error verificando token de sesión JWT:', error);
    return null;
  }
}

/**
 * Decodifica un JWT sin verificar (útil para debugging)
 * @param token JWT token
 * @returns Payload decodificado o null
 */
export function decodeToken(token: string): any {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
}

// Funciones de compatibilidad hacia atrás (deprecated)
/**
 * @deprecated Usar generateOrderAccessToken en su lugar
 */
export function generateToken(): string {
  // Por compatibilidad, generar un token simple
  return randomBytes(16).toString('hex');
}

/**
 * @deprecated Usar verifyAuthToken en su lugar
 */
export function verifyToken(token: string, hashedToken: string): boolean {
  // Por compatibilidad, verificación simple
  return token === hashedToken;
}
