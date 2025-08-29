// Tipos para el servicio de email masivo

export interface EmailRecipient {
  email: string;
  name?: string;
  userId?: string;
  storeId?: string;
  metadata?: Record<string, any>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[]; // Variables que se pueden reemplazar en el template
}

export interface BulkEmailRequest {
  templateId: string;
  recipients: EmailRecipient[];
  templateVariables?: Record<string, any>;
  scheduledAt?: Date;
  priority: 'low' | 'normal' | 'high';
  sender?: {
    email: string;
    name: string;
  };
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface EmailJob {
  id: string;
  templateId: string;
  recipient: EmailRecipient;
  templateVariables: Record<string, any>;
  priority: 'low' | 'normal' | 'high';
  scheduledAt: Date;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  sender: {
    email: string;
    name: string;
  };
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  errorMessage?: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  description?: string;
  templateId: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled';
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  metadata: Record<string, any>;
}

export interface EmailMetrics {
  campaignId?: string;
  templateId: string;
  totalSent: number;
  deliveryRate: number;
  bounceRate: number;
  complaintRate: number;
  openRate?: number;
  clickRate?: number;
  lastUpdated: Date;
}

export interface SQSEmailMessage {
  jobId: string;
  templateId: string;
  recipient: EmailRecipient;
  templateVariables: Record<string, any>;
  sender: {
    email: string;
    name: string;
  };
  priority: 'low' | 'normal' | 'high';
  attempt: number;
  maxAttempts: number;
  metadata: Record<string, any>;
}

// Tipos para diferentes tipos de emails
export interface CustomerEmailData {
  type: 'order_confirmation' | 'shipping_update' | 'promotion' | 'newsletter';
  orderId?: string;
  trackingNumber?: string;
  promotionCode?: string;
  customData?: Record<string, any>;
}

export interface StoreOwnerEmailData {
  type: 'new_order' | 'sales_report' | 'inventory_alert' | 'platform_update';
  orderId?: string;
  reportPeriod?: string;
  productId?: string;
  alertType?: string;
  customData?: Record<string, any>;
}

// Configuración de rate limiting y batching
export interface EmailServiceConfig {
  maxConcurrentJobs: number;
  batchSize: number;
  retryDelayMs: number;
  maxRetries: number;
  rateLimitPerSecond: number;
  deadLetterQueueEnabled: boolean;
}

// Respuestas de la API
export interface BulkEmailResponse {
  success: boolean;
  campaignId: string;
  jobsCreated: number;
  estimatedDeliveryTime: string;
  message: string;
}

export interface EmailJobStatus {
  jobId: string;
  status: EmailJob['status'];
  attempts: number;
  lastAttempt?: Date;
  errorMessage?: string;
  sentAt?: Date;
}

export interface CampaignStatus {
  campaignId: string;
  status: EmailCampaign['status'];
  progress: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
  };
  metrics?: EmailMetrics;
}
