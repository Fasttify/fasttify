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

export class CustomerInfoManager {
  /**
   * Determina el tipo de cliente basado en la información disponible
   */
  public determineCustomerType(customerInfo: any, customerEmail?: string): 'registered' | 'guest' {
    // Si hay customerEmail específico o customerInfo tiene userId, es registrado
    if (customerEmail || (customerInfo && customerInfo.userId)) {
      return 'registered';
    }
    return 'guest';
  }

  /**
   * Extrae el customerId del customerInfo o genera uno basado en sessionId
   */
  public extractCustomerId(customerInfo: any, sessionId?: string): string {
    if (customerInfo && customerInfo.userId) {
      return customerInfo.userId;
    }
    // Si no hay userId, usar sessionId como identificador de cliente invitado
    return sessionId || 'guest';
  }

  /**
   * Extrae email del customerInfo o usa el proporcionado
   */
  public extractCustomerEmail(customerInfo: any, providedEmail?: string): string | null {
    if (providedEmail) {
      return providedEmail;
    }

    if (customerInfo?.email) {
      return customerInfo.email;
    }

    if (customerInfo && typeof customerInfo === 'object' && 'email' in customerInfo) {
      return (customerInfo as any).email;
    }

    return null;
  }
}

export const customerInfoManager = new CustomerInfoManager();
