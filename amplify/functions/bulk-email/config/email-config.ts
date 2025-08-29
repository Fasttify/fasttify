// import { env } from '$amplify/env/bulk-email-processor';

/**
 * Configuración centralizada del servicio de email
 */

export interface EmailServiceConfig {
  // Configuración SES
  sesRegion: string;
  defaultFromEmail: string;
  defaultReplyToEmail: string;

  // Configuración de procesamiento
  batchSize: number;
  maxRetries: number;
  rateLimit: number;

  // Configuración de colas
  useQueue: boolean;
  emailQueueUrl?: string;
  highPriorityQueueUrl?: string;

  // Timeouts y delays
  visibilityTimeoutSeconds: number;
  processingDelaySeconds: {
    high: number;
    normal: number;
    low: number;
  };
}

/**
 * Obtiene la configuración del servicio desde variables de entorno
 */
export function getEmailConfig(): EmailServiceConfig {
  return {
    // SES Configuration
    sesRegion: process.env.AWS_REGION || 'us-east-1',
    defaultFromEmail: process.env.SES_FROM_EMAIL || 'noreply@fasttify.com',
    defaultReplyToEmail: process.env.SES_REPLY_TO_EMAIL || 'support@fasttify.com',

    // Processing Configuration
    batchSize: parseInt(process.env.EMAIL_BATCH_SIZE || '10'),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    rateLimit: parseInt(process.env.RATE_LIMIT_PER_SECOND || '14'),

    // Queue Configuration
    useQueue: !!process.env.EMAIL_QUEUE_URL && process.env.EMAIL_QUEUE_URL !== 'placeholder',
    emailQueueUrl: process.env.EMAIL_QUEUE_URL,
    highPriorityQueueUrl: process.env.HIGH_PRIORITY_QUEUE_URL,

    // Timing Configuration
    visibilityTimeoutSeconds: 900, // 15 minutos
    processingDelaySeconds: {
      high: 0, // Sin delay para alta prioridad
      normal: 10, // 10 segundos para prioridad normal
      low: 30, // 30 segundos para baja prioridad
    },
  };
}

/**
 * Valida que la configuración sea correcta
 */
export function validateEmailConfig(config: EmailServiceConfig): string[] {
  const errors: string[] = [];

  if (!config.defaultFromEmail || !config.defaultFromEmail.includes('@')) {
    errors.push('SES_FROM_EMAIL not valid');
  }

  if (!config.defaultReplyToEmail || !config.defaultReplyToEmail.includes('@')) {
    errors.push('SES_REPLY_TO_EMAIL not valid');
  }

  if (config.batchSize <= 0 || config.batchSize > 10) {
    errors.push('EMAIL_BATCH_SIZE not valid');
  }

  if (config.maxRetries < 0 || config.maxRetries > 10) {
    errors.push('MAX_RETRIES not valid');
  }

  if (config.rateLimit <= 0 || config.rateLimit > 1000) {
    errors.push('RATE_LIMIT_PER_SECOND not valid');
  }

  if (config.useQueue) {
    if (!config.emailQueueUrl) {
      errors.push('EMAIL_QUEUE_URL is required when using queue');
    }
    if (!config.highPriorityQueueUrl) {
      errors.push('HIGH_PRIORITY_QUEUE_URL is required when using queue');
    }
  }

  return errors;
}

/**
 * Templates de email disponibles
 */
export const EMAIL_TEMPLATES = {
  ORDER_CONFIRMATION: 'order-confirmation',
  SHIPPING_UPDATE: 'shipping-update',
  NEW_ORDER_NOTIFICATION: 'new-order-notification',
  PROMOTION: 'promotion',
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password-reset',
  ACCOUNT_VERIFICATION: 'account-verification',
} as const;

export type EmailTemplateId = (typeof EMAIL_TEMPLATES)[keyof typeof EMAIL_TEMPLATES];

/**
 * Prioridades de email disponibles
 */
export const EMAIL_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
} as const;

export type EmailPriority = (typeof EMAIL_PRIORITIES)[keyof typeof EMAIL_PRIORITIES];

/**
 * Límites del servicio
 */
export const EMAIL_LIMITS = {
  MAX_RECIPIENTS_PER_REQUEST: 1000,
  MAX_TEMPLATE_VARIABLES: 50,
  MAX_EMAIL_SIZE_KB: 10 * 1024, // 10MB
  MAX_SUBJECT_LENGTH: 998,
  MAX_CAMPAIGN_NAME_LENGTH: 255,
} as const;
