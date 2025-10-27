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

import type { LiquidFilter } from '../../types';

/**
 * Filtro para extraer el símbolo de la moneda
 */
export const currencySymbolFilter: LiquidFilter = {
  name: 'currency_symbol',
  filter: function (input?: string): string {
    // Si se pasa un input, usarlo directamente
    if (input) {
      const symbol = input.replace('{{amount}}', '').trim();
      return symbol || '$';
    }

    // Obtener configuración de moneda desde environments
    const environments = this.context?.environments;
    const shop = environments?.shop || environments?.store;
    const format = shop?.currency_format || '${{amount}}';

    // Extraer el símbolo removiendo {{amount}}
    const symbol = format.replace('{{amount}}', '').trim();

    return symbol || '$';
  },
};

/**
 * Filtro para formatear precios con moneda
 */
export const moneyFilter: LiquidFilter = {
  name: 'money',
  filter: function (amount: number | string, format?: string): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) {
      return '$0.00';
    }

    // Obtener configuración de moneda desde environments
    const environments = this.context?.environments;
    const shop = environments?.shop || environments?.store;
    const currencyConfig = environments?._currency_config;

    // Usar configuración dinámica o fallback
    const locale = shop?.currency_locale || currencyConfig?.locale || 'es-CO';
    const decimalPlaces =
      shop?.currency_decimal_places !== undefined && shop?.currency_decimal_places !== null
        ? shop?.currency_decimal_places
        : currencyConfig?.decimalPlaces !== undefined && currencyConfig?.decimalPlaces !== null
          ? currencyConfig?.decimalPlaces
          : 2;
    const defaultFormat = shop?.currency_format || currencyConfig?.format || '${{amount}}';

    // Formato por defecto o personalizado
    const actualFormat = format || defaultFormat;

    // Formatear el número con separadores de miles usando el locale de la tienda
    const formattedAmount = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(numAmount);

    const result = actualFormat.replace('{{amount}}', formattedAmount);

    return result;
  },
};

/**
 * Filtro para formatear precios sin decimales
 */
export const moneyWithoutCurrencyFilter: LiquidFilter = {
  name: 'money_without_currency',
  filter: function (amount: number | string): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) {
      return '0.00';
    }

    // Obtener configuración de moneda desde environments
    const environments = this.context?.environments;
    const shop = environments?.shop || environments?.store;
    const currencyConfig = environments?._currency_config;

    // Usar configuración dinámica o fallback
    const locale = shop?.currency_locale || currencyConfig?.locale || 'es-CO';
    const decimalPlaces =
      shop?.currency_decimal_places !== undefined && shop?.currency_decimal_places !== null
        ? shop?.currency_decimal_places
        : currencyConfig?.decimalPlaces !== undefined && currencyConfig?.decimalPlaces !== null
          ? currencyConfig?.decimalPlaces
          : 2;

    // Formatear el número con separadores de miles usando el locale de la tienda
    const formattedAmount = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(numAmount);

    return formattedAmount;
  },
};

/**
 * Filtro para formatear precios en centavos
 */
export const moneyWithoutDecimalFilter: LiquidFilter = {
  name: 'money_without_decimal',
  filter: function (amount: number | string): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) {
      return '0';
    }

    // Obtener configuración de moneda desde environments
    const environments = this.context?.environments;
    const shop = environments?.shop || environments?.store;
    const currencyConfig = environments?._currency_config;

    // Usar configuración dinámica o fallback
    const locale = shop?.currency_locale || currencyConfig?.locale || 'es-CO';

    // Formatear el número sin decimales usando el locale de la tienda
    const formattedAmount = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);

    return formattedAmount;
  },
};

/**
 * Filtro para convertir centavos a pesos
 */
export const centsToPriceFilter: LiquidFilter = {
  name: 'cents_to_price',
  filter: function (cents: number | string): number {
    const numCents = typeof cents === 'string' ? parseFloat(cents) : cents;

    if (isNaN(numCents)) {
      return 0;
    }

    return numCents / 100;
  },
};

export const moneyFilters: LiquidFilter[] = [
  currencySymbolFilter,
  moneyFilter,
  moneyWithoutCurrencyFilter,
  moneyWithoutDecimalFilter,
  centsToPriceFilter,
];
