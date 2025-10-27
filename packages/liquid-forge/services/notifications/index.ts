/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Servicios principales
export { EmailNotificationService } from './email-notification-service';
export { EmailFormattingUtils } from './email-formatting-utils';

// EmailOrderService se exporta por separado para evitar dependencias del servidor
export { EmailOrderService } from './email-order-service';

// Utilidades de formateo
export { getOrderStatus, getPaymentStatus } from './status-translations';
export { getCurrencyConfig } from './currency-config';

// Tipos e interfaces
export type { Address, AddressInfo } from './email-formatting-utils';

export type {
  EmailRecipient,
  EmailTemplateVariables,
  OrderConfirmationEmailRequest,
} from './email-notification-service';

// NOTE: NotificationCreator y notificationCreator son server-only
// y se exportan desde './server.ts' para evitar que sean incluidos en bundles del cliente

export type { CreateAdminNotificationRequest } from './types/notification-types';
