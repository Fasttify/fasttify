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

/**
 * Server-only exports
 *
 * Este archivo exporta código que SOLO puede usarse en el servidor
 * porque depende de APIs del servidor (next/headers, etc).
 *
 * NO importar estos desde componentes del cliente.
 */

export { NotificationCreator, notificationCreator } from './notification-creator';
export type { CreateAdminNotificationRequest } from './types/notification-types';
