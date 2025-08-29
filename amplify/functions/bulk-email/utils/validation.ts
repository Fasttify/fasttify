import { BulkEmailRequest, EmailRecipient } from '../types';
import { EMAIL_LIMITS, EmailPriority } from '../config/email-config';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valida una request de envío masivo de emails
 */
export function validateBulkEmailRequest(request: BulkEmailRequest): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar templateId
  if (!request.templateId) {
    errors.push('templateId is required');
  } else if (typeof request.templateId !== 'string' || request.templateId.trim().length === 0) {
    errors.push('templateId must be a non-empty string');
  }

  // Validar recipients
  if (!request.recipients || !Array.isArray(request.recipients)) {
    errors.push('recipients must be an array');
  } else {
    if (request.recipients.length === 0) {
      errors.push('recipients cannot be empty');
    } else if (request.recipients.length > EMAIL_LIMITS.MAX_RECIPIENTS_PER_REQUEST) {
      errors.push(`Maximum ${EMAIL_LIMITS.MAX_RECIPIENTS_PER_REQUEST} recipients per request`);
    } else {
      // Validar cada destinatario
      const recipientErrors = validateRecipients(request.recipients);
      errors.push(...recipientErrors);
    }
  }

  // Validar priority
  if (request.priority && !['low', 'normal', 'high'].includes(request.priority)) {
    errors.push('priority must be "low", "normal" or "high"');
  }

  // Validar templateVariables
  if (request.templateVariables) {
    const variableErrors = validateTemplateVariables(request.templateVariables);
    errors.push(...variableErrors);
  }

  // Validar sender
  if (request.sender) {
    const senderErrors = validateSender(request.sender);
    errors.push(...senderErrors);
  }

  // Validar scheduledAt
  if (request.scheduledAt) {
    const scheduledErrors = validateScheduledAt(request.scheduledAt);
    errors.push(...scheduledErrors);
    warnings.push(...getScheduledWarnings(request.scheduledAt));
  }

  // Validar tags
  if (request.tags && Array.isArray(request.tags)) {
    if (request.tags.length > 10) {
      warnings.push('More than 10 tags may affect performance');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Valida la lista de destinatarios
 */
function validateRecipients(recipients: EmailRecipient[]): string[] {
  const errors: string[] = [];
  const emailSet = new Set<string>();

  recipients.forEach((recipient, index) => {
    const prefix = `Destinatario ${index + 1}`;

    // Validar email
    if (!recipient.email) {
      errors.push(`${prefix}: email is required`);
    } else if (!isValidEmail(recipient.email)) {
      errors.push(`${prefix}: invalid email "${recipient.email}"`);
    } else {
      // Verificar emails duplicados
      const normalizedEmail = recipient.email.toLowerCase().trim();
      if (emailSet.has(normalizedEmail)) {
        errors.push(`${prefix}: duplicate email "${recipient.email}"`);
      } else {
        emailSet.add(normalizedEmail);
      }
    }

    // Validar name (opcional)
    if (recipient.name && typeof recipient.name !== 'string') {
      errors.push(`${prefix}: name must be a string`);
    }

    // Validar metadata (opcional)
    if (recipient.metadata && typeof recipient.metadata !== 'object') {
      errors.push(`${prefix}: metadata must be an object`);
    }
  });

  return errors;
}

/**
 * Valida variables de template
 */
function validateTemplateVariables(variables: Record<string, any>): string[] {
  const errors: string[] = [];

  const variableCount = Object.keys(variables).length;
  if (variableCount > EMAIL_LIMITS.MAX_TEMPLATE_VARIABLES) {
    errors.push(`Maximum ${EMAIL_LIMITS.MAX_TEMPLATE_VARIABLES} template variables allowed`);
  }

  // Validar que las claves sean strings válidos
  Object.keys(variables).forEach((key) => {
    if (typeof key !== 'string' || key.trim().length === 0) {
      errors.push(`Invalid variable key: "${key}"`);
    }

    // Validar caracteres permitidos en las claves
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
      errors.push(`Variable key "${key}" contains invalid characters. Use only letters, numbers and underscores.`);
    }
  });

  return errors;
}

/**
 * Valida información del sender
 */
function validateSender(sender: { email: string; name: string }): string[] {
  const errors: string[] = [];

  if (!sender.email) {
    errors.push('sender.email is required');
  } else if (!isValidEmail(sender.email)) {
    errors.push(`sender.email invalid: "${sender.email}"`);
  }

  if (sender.name && typeof sender.name !== 'string') {
    errors.push('sender.name must be a string');
  }

  return errors;
}

/**
 * Valida fecha de programación
 */
function validateScheduledAt(scheduledAt: Date): string[] {
  const errors: string[] = [];
  const now = new Date();
  const maxFutureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 días

  if (scheduledAt <= now) {
    errors.push('scheduledAt must be a future date');
  }

  if (scheduledAt > maxFutureDate) {
    errors.push('scheduledAt cannot be more than 30 days in the future');
  }

  return errors;
}

/**
 * Genera advertencias para fechas programadas
 */
function getScheduledWarnings(scheduledAt: Date): string[] {
  const warnings: string[] = [];
  const now = new Date();
  const hoursDiff = (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursDiff < 1) {
    warnings.push('Email scheduled for less than 1 hour. Consider immediate delivery.');
  }

  if (hoursDiff > 7 * 24) {
    warnings.push('Email scheduled for more than 7 days. Verify that the date is correct.');
  }

  return warnings;
}

/**
 * Validación básica de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Valida que un template ID sea válido
 */
export function isValidTemplateId(templateId: string): boolean {
  // Lista de templates válidos - se puede expandir
  const validTemplates = [
    'order-confirmation',
    'shipping-update',
    'new-order-notification',
    'promotion',
    'welcome',
    'password-reset',
    'account-verification',
  ];

  return validTemplates.includes(templateId);
}

/**
 * Valida que una prioridad sea válida
 */
export function isValidPriority(priority: string): priority is EmailPriority {
  return ['low', 'normal', 'high'].includes(priority);
}

/**
 * Sanitiza variables de template para prevenir inyección
 */
export function sanitizeTemplateVariables(variables: Record<string, any>): Record<string, string> {
  const sanitized: Record<string, string> = {};

  Object.entries(variables).forEach(([key, value]) => {
    // Convertir todo a string y limpiar
    const stringValue = String(value || '');

    // Remover caracteres potencialmente peligrosos
    const cleanValue = stringValue
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remover scripts
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remover iframes
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+\s*=/gi, '') // Remover event handlers
      .trim();

    sanitized[key] = cleanValue;
  });

  return sanitized;
}
