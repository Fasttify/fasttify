import { useMemo } from 'react';
import { useAnalyticsCurrency } from '@/app/store/components/analytics/context/AnalyticsCurrencyContext';
import { useCurrencyConfig } from '@/app/store/hooks/currency/useCurrencyConfig';

/**
 * Hook para formatear valores de analíticas usando la moneda seleccionada para analíticas
 * (que puede ser diferente a la moneda de la tienda)
 */
export function useAnalyticsCurrencyFormatting() {
  const { analyticsCurrency, isUsingStoreCurrency } = useAnalyticsCurrency();
  const currencyConfig = useCurrencyConfig(analyticsCurrency.code);

  const formatters = useMemo(() => {
    // Función para formatear moneda con espaciado correcto usando la moneda de analíticas
    const formatCurrencyWithSpacing = (amount: number): string => {
      if (isNaN(amount)) return '0.00';

      // Formatear el número con separadores de miles usando el locale de la moneda seleccionada
      const formattedAmount = new Intl.NumberFormat(currencyConfig.locale, {
        minimumFractionDigits: currencyConfig.decimalPlaces,
        maximumFractionDigits: currencyConfig.decimalPlaces,
      }).format(amount);

      // Asegurar espacio entre símbolo y monto
      const cleanSymbol = analyticsCurrency.symbol.trim();
      return `${cleanSymbol} ${formattedAmount}`;
    };

    return {
      // Formatear valores monetarios
      formatCurrency: (amount: number): string => {
        return formatCurrencyWithSpacing(amount);
      },

      // Formatear porcentajes
      formatPercentage: (value: number): string => {
        if (isNaN(value)) return '0%';
        return `${value.toFixed(1)}%`;
      },

      // Formatear números grandes con separadores
      formatNumber: (value: number): string => {
        if (isNaN(value)) return '0';
        return new Intl.NumberFormat(currencyConfig.locale).format(value);
      },

      // Formatear valores compactos (K, M, B)
      formatCompactNumber: (value: number): string => {
        if (isNaN(value)) return '0';

        if (value >= 1000000000) {
          return `${(value / 1000000000).toFixed(1)}B`;
        }
        if (value >= 1000000) {
          return `${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
          return `${(value / 1000).toFixed(1)}K`;
        }
        return value.toString();
      },

      // Formatear tasa de conversión con contexto
      formatConversionRate: (rate: number): string => {
        if (isNaN(rate)) return '0.0%';
        return `${rate.toFixed(2)}%`;
      },

      // Formatear valor promedio de orden con moneda
      formatAverageOrderValue: (value: number): string => {
        return formatCurrencyWithSpacing(value);
      },

      // Formatear descuentos
      formatDiscount: (amount: number): string => {
        return formatCurrencyWithSpacing(amount);
      },

      // Formatear ingresos totales
      formatRevenue: (amount: number): string => {
        return formatCurrencyWithSpacing(amount);
      },

      // Formatear métricas de inventario
      formatInventoryCount: (count: number): string => {
        return new Intl.NumberFormat(currencyConfig.locale).format(count);
      },

      // Formatear duración (para métricas de tiempo)
      formatDuration: (seconds: number): string => {
        if (seconds < 60) {
          return `${Math.round(seconds)}s`;
        }
        if (seconds < 3600) {
          return `${Math.round(seconds / 60)}m`;
        }
        return `${Math.round(seconds / 3600)}h`;
      },

      // Formatear tasa de rebote
      formatBounceRate: (rate: number): string => {
        if (isNaN(rate)) return '0.0%';
        return `${rate.toFixed(1)}%`;
      },

      // Información de moneda actual de analíticas
      currencyInfo: {
        code: analyticsCurrency.code,
        symbol: analyticsCurrency.symbol,
        name: analyticsCurrency.name,
        isUsingStoreCurrency,
      },
    };
  }, [analyticsCurrency, currencyConfig, isUsingStoreCurrency]);

  return formatters;
}
