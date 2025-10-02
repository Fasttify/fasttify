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

import { getCurrencyConfig } from './currency-config';

export interface Address {
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
}

export interface AddressInfo {
  fullAddress: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
}

/**
 * Utilidades para formateo de datos en emails
 */
export class EmailFormattingUtils {
  /**
   * Formatea una dirección completa como string legible
   */
  static formatAddress(address: Address | string): string {
    if (typeof address === 'string') {
      return address;
    }

    if (!address.address1) return 'Address not specified';

    const addressParts = [
      address.address1,
      address.address2,
      address.city,
      address.province,
      address.zip,
      address.country,
    ].filter(Boolean);

    const result = addressParts.join(', ');

    return result;
  }

  /**
   * Formatea una dirección para usar en el template del email
   */
  static formatAddressForTemplate(address: Address): AddressInfo {
    return {
      fullAddress: this.formatAddress(address),
      address1: address.address1,
      address2: address.address2,
      city: address.city,
      province: address.province,
      zip: address.zip,
      country: address.country,
    };
  }

  /**
   * Formatea moneda usando la configuración existente (basada en useCurrencyConfig)
   */
  static formatCurrency(amount: number, currency: string): string {
    try {
      if (typeof amount !== 'number') return 'N/A';

      const config = getCurrencyConfig(currency);

      const formattedAmount = new Intl.NumberFormat(config.locale, {
        minimumFractionDigits: config.decimalPlaces,
        maximumFractionDigits: config.decimalPlaces,
      }).format(amount);

      return config.format.replace('{{amount}}', formattedAmount);
    } catch (error) {
      console.warn('Error formatting currency:', error);
      return `${amount} ${currency}`;
    }
  }

  /**
   * Formatea fecha para mostrar en el email
   */
  static formatDate(dateString?: string): string {
    try {
      if (!dateString) {
        return new Date().toLocaleDateString('es-ES');
      }
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.warn('Error formatting date:', error);
      return new Date().toLocaleDateString('es-ES');
    }
  }

  /**
   * Extrae el valor numérico de un string de moneda formateado
   */
  static parseCurrencyAmount(currencyString: string): number {
    try {
      // Remover símbolos de moneda, espacios y comas, mantener solo números y puntos
      const cleanString = currencyString.replace(/[^0-9.-]/g, '');
      return parseFloat(cleanString);
    } catch (error) {
      console.warn('Error parsing currency amount:', error);
      return 0;
    }
  }

  /**
   * Formatea un string de moneda para mostrar en el email
   */
  static formatCurrencyString(currencyString: string, currency: string = 'COP'): string {
    try {
      const amount = this.parseCurrencyAmount(currencyString);
      return this.formatCurrency(amount, currency);
    } catch (error) {
      console.warn('Error formatting currency string:', error);
      return currencyString;
    }
  }

  /**
   * Formatea una dirección con saltos de línea para templates de email
   */
  static formatAddressWithLineBreaks(address: Address): string {
    if (!address) return '';

    const lines: string[] = [];

    // Línea 1: Dirección principal
    if (address.address1) {
      lines.push(address.address1);
    }

    // Línea 2: Dirección secundaria (si existe)
    if (address.address2) {
      lines.push(address.address2);
    }

    // Línea 3: Ciudad y provincia/estado
    if (address.city) {
      const cityLine = address.province ? `${address.city}, ${address.province}` : address.city;
      lines.push(cityLine);
    }

    // Línea 4: Código postal y país
    if (address.zip || address.country) {
      const zipCountry = [address.zip, address.country].filter(Boolean).join(', ');
      if (zipCountry) lines.push(zipCountry);
    }

    return lines.join('\n');
  }

  /**
   * Extrae y normaliza información de dirección de datos del checkout
   */
  static extractAddress(addressData: any): Address | undefined {
    if (!addressData) return undefined;

    try {
      // Si es string, intentar parsear JSON
      if (typeof addressData === 'string') {
        const parsed = JSON.parse(addressData);
        return this.normalizeAddress(parsed);
      }

      // Si es objeto, normalizar directamente
      if (typeof addressData === 'object') {
        return this.normalizeAddress(addressData);
      }

      return undefined;
    } catch (error) {
      console.warn('Error extracting address:', error);
      return undefined;
    }
  }

  /**
   * Normaliza la estructura de dirección para el formato estándar
   */
  static normalizeAddress(address: any): Address {
    return {
      address1: address.address1 || address.street || address.line1,
      address2: address.address2 || address.street2 || address.line2,
      city: address.city,
      province: address.province || address.state || address.region,
      zip: address.zip || address.postalCode || address.postcode,
      country: address.country,
    };
  }

  /**
   * Extrae el nombre del cliente de la información del checkout
   */
  static extractCustomerName(customerInfo: any): string | null {
    try {
      if (typeof customerInfo === 'string') {
        const parsed = JSON.parse(customerInfo);
        return parsed.name || parsed.firstName || parsed.lastName || null;
      }
      if (customerInfo && typeof customerInfo === 'object') {
        return customerInfo.name || customerInfo.firstName || customerInfo.lastName || null;
      }
      return null;
    } catch (error) {
      console.warn('Error extracting customer name:', error);
      return null;
    }
  }
}
