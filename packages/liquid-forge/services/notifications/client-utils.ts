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

// Utilidades que pueden ser usadas en el cliente sin dependencias del servidor
export { EmailFormattingUtils } from './email-formatting-utils';
export { getOrderStatus, getPaymentStatus } from './status-translations';
export { getCurrencyConfig } from './currency-config';

// Tipos e interfaces
export type { Address, AddressInfo } from './email-formatting-utils';
