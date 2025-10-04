import { useMemo } from 'react';
import { useCurrencyConfig } from '@/app/store/hooks/currency/useCurrencyConfig';

export interface FormatCheckoutAmountsInput {
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  discountAmount?: number;
}

export interface FormattedCheckoutAmounts {
  formattedSubtotal: string;
  formattedShippingCost: string;
  formattedTaxAmount: string;
  formattedTotalAmount: string;
  formattedDiscountAmount: string;
}

export interface FormatCheckoutItemInput {
  unitPrice?: number;
  quantity?: number;
}

export interface FormattedCheckoutItemAmounts {
  formattedUnitPrice: string;
  formattedTotalPrice: string;
}

/**
 * Hook de formateo para checkouts, basado en la moneda del checkout
 * - Expone formatMoney y helpers para formatear totales e items
 */
export function useCheckoutFormatting(checkoutCurrencyCode?: string) {
  // Siempre basar el formateo en la moneda del checkout
  const currencyConfig = useCurrencyConfig(checkoutCurrencyCode);

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

  const formatCheckoutAmounts = useMemo(
    () =>
      (input: FormatCheckoutAmountsInput): FormattedCheckoutAmounts => {
        const subtotal = input.subtotal || 0;
        const shipping = input.shippingCost || 0;
        const tax = input.taxAmount || 0;
        const total = input.totalAmount || 0;
        const discount = input.discountAmount || 0;

        return {
          formattedSubtotal: formatMoney(subtotal),
          formattedShippingCost: shipping > 0 ? formatMoney(shipping) : 'Gratis',
          formattedTaxAmount: formatMoney(tax),
          formattedTotalAmount: formatMoney(total),
          formattedDiscountAmount: formatMoney(discount),
        };
      },
    [formatMoney]
  );

  const formatCheckoutItemAmounts = useMemo(
    () =>
      (input: FormatCheckoutItemInput): FormattedCheckoutItemAmounts => {
        const unit = input.unitPrice || 0;
        const qty = input.quantity || 1;
        const total = unit * qty;

        return {
          formattedUnitPrice: formatMoney(unit),
          formattedTotalPrice: formatMoney(total),
        };
      },
    [formatMoney]
  );

  return {
    currency: checkoutCurrencyCode || 'DEFAULT',
    formatMoney,
    formatCheckoutAmounts,
    formatCheckoutItemAmounts,
  };
}
