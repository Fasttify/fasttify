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

import type { DevSession } from '../../domain/entities/dev-session.entity';
import type { Template, TemplateType } from '@fasttify/theme-studio';
import crypto from 'crypto';

/**
 * Servicio: Dev Session Manager
 * Gestiona las sesiones de desarrollo activas en memoria
 */
export class DevSessionManagerService {
  private sessions: Map<string, DevSession> = new Map();
  private readonly SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos

  /**
   * Crea o recupera una sesión de desarrollo
   */
  createOrGetSession(storeId: string, templateType: TemplateType, template: Template): DevSession {
    const sessionKey = `${storeId}:${templateType}`;
    const existingSession = this.sessions.get(sessionKey);

    if (existingSession) {
      existingSession.lastActivityAt = new Date();
      existingSession.template = template; // Actualizar template
      return existingSession;
    }

    const newSession: DevSession = {
      sessionId: `session-${Date.now()}-${crypto.randomBytes(16).toString('hex')}`,
      storeId,
      templateType,
      template,
      createdAt: new Date(),
      lastActivityAt: new Date(),
    };

    this.sessions.set(sessionKey, newSession);
    return newSession;
  }

  /**
   * Obtiene una sesión existente
   */
  getSession(storeId: string, templateType: TemplateType): DevSession | null {
    const sessionKey = `${storeId}:${templateType}`;
    return this.sessions.get(sessionKey) || null;
  }

  /**
   * Actualiza el template de una sesión
   */
  updateSessionTemplate(storeId: string, templateType: TemplateType, template: Template): void {
    const session = this.getSession(storeId, templateType);
    if (session) {
      session.template = template;
      session.lastActivityAt = new Date();
    }
  }

  /**
   * Elimina una sesión
   */
  removeSession(storeId: string, templateType: TemplateType): void {
    const sessionKey = `${storeId}:${templateType}`;
    this.sessions.delete(sessionKey);
  }

  /**
   * Limpia sesiones expiradas
   */
  cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [key, session] of this.sessions.entries()) {
      const lastActivity = session.lastActivityAt.getTime();
      if (now - lastActivity > this.SESSION_TIMEOUT_MS) {
        this.sessions.delete(key);
      }
    }
  }

  /**
   * Obtiene todas las sesiones activas (para debugging)
   */
  getAllSessions(): DevSession[] {
    return Array.from(this.sessions.values());
  }
}

export const devSessionManager = new DevSessionManagerService();
