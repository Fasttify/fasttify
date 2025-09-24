import { useMemo } from 'react';
import { useCurrencyConfig } from '@/app/store/hooks/currency/useCurrencyConfig';

export interface FormatOrderAmountsInput {
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  compareAtPrice?: number;
  savingsAmount?: number;
}

export interface FormattedOrderAmounts {
  formattedSubtotal: string;
  formattedShippingCost: string;
  formattedTaxAmount: string;
  formattedTotalAmount: string;
  formattedCompareAtPrice: string;
  formattedSavingsAmount: string;
}

export interface FormatOrderItemInput {
  unitPrice?: number;
  totalPrice?: number;
  compareAtPrice?: number;
  quantity?: number;
}

export interface FormattedOrderItemAmounts {
  formattedUnitPrice: string;
  formattedTotalPrice: string;
  formattedCompareAtPrice: string;
  formattedSavings?: string;
}

/**
 * Hook de formateo para órdenes, basado en la moneda de la orden
 * - Expone formatMoney y helpers para formatear totales e items
 */
export function useOrderFormatting(orderCurrencyCode?: string) {
  // Siempre basar el formateo en la moneda de la orden
  const currencyConfig = useCurrencyConfig(orderCurrencyCode);

  const formatMoney = useMemo(() => {
    return (amount: number) => {
      const safeAmount = isNaN(amount) ? 0 : amount;
      const formattedAmount = new Intl.NumberFormat(currencyConfig.locale, {
        minimumFractionDigits: currencyConfig.decimalPlaces,
        maximumFractionDigits: currencyConfig.decimalPlaces,
      }).format(safeAmount);
      return currencyConfig.format.replace('{{amount}}', formattedAmount);
    };
  }, [currencyConfig.format, currencyConfig.locale, currencyConfig.decimalPlaces]);

  const formatOrderAmounts = useMemo(
    () =>
      (input: FormatOrderAmountsInput): FormattedOrderAmounts => {
        const subtotal = input.subtotal || 0;
        const shipping = input.shippingCost || 0;
        const tax = input.taxAmount || 0;
        const total = input.totalAmount || 0;
        const compareAt = input.compareAtPrice || 0;
        const savings = input.savingsAmount || Math.max(0, (compareAt || 0) - (subtotal || 0));

        return {
          formattedSubtotal: formatMoney(subtotal),
          formattedShippingCost: shipping > 0 ? formatMoney(shipping) : formatMoney(0),
          formattedTaxAmount: formatMoney(tax),
          formattedTotalAmount: formatMoney(total),
          formattedCompareAtPrice: formatMoney(compareAt || 0),
          formattedSavingsAmount: formatMoney(savings || 0),
        };
      },
    [formatMoney]
  );

  const formatOrderItemAmounts = useMemo(
    () =>
      (input: FormatOrderItemInput): FormattedOrderItemAmounts => {
        const unit = input.unitPrice || 0;
        const total = input.totalPrice || 0;
        const compareAt = input.compareAtPrice || 0;
        const qty = input.quantity || 1;
        const savings = Math.max(0, (compareAt - unit) * qty);

        return {
          formattedUnitPrice: formatMoney(unit),
          formattedTotalPrice: formatMoney(total),
          formattedCompareAtPrice: formatMoney(compareAt),
          formattedSavings: savings > 0 ? formatMoney(savings) : undefined,
        };
      },
    [formatMoney]
  );

  return {
    currency: orderCurrencyCode || 'DEFAULT',
    formatMoney,
    formatOrderAmounts,
    formatOrderItemAmounts,
  };
}
