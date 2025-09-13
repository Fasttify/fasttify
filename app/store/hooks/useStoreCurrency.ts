import { useMemo } from 'react';
import useStoreDataStore from '@/context/core/storeDataStore';
import { useCurrencyConfig } from '@/app/store/components/domains/hooks/useCurrencyConfig';

export interface UseStoreCurrencyReturn {
  currency: string;
  symbol: string;
  locale: string;
  decimalPlaces: number;
  format: string;
  formatPrice: (amount: number) => string;
  parsePrice: (value: string) => number;
}

export function useStoreCurrency(): UseStoreCurrencyReturn {
  const currentStore = useStoreDataStore((state) => state.currentStore);

  // Obtener configuración de moneda de la tienda
  const currency = currentStore?.storeCurrency || 'USD';
  const currencyConfig = useCurrencyConfig(currency);

  // Extraer símbolo del formato existente
  const symbol = useMemo(() => {
    const format = currencyConfig.format;
    // Extraer el símbolo del formato (todo lo que no sea {{amount}})
    const symbolMatch = format.replace('{{amount}}', '').trim();
    return symbolMatch || '$';
  }, [currencyConfig.format]);

  // Función para formatear precios usando la configuración de la tienda
  const formatPrice = useMemo(() => {
    return (amount: number): string => {
      if (isNaN(amount)) return '0.00';

      // Formatear el número con separadores de miles usando el locale de la tienda
      const formattedAmount = new Intl.NumberFormat(currencyConfig.locale, {
        minimumFractionDigits: currencyConfig.decimalPlaces,
        maximumFractionDigits: currencyConfig.decimalPlaces,
      }).format(amount);

      // Aplicar el formato de moneda de la tienda
      const result = currencyConfig.format.replace('{{amount}}', formattedAmount);

      return result;
    };
  }, [currencyConfig.format, currencyConfig.locale, currencyConfig.decimalPlaces]);

  // Función para parsear precios (remover símbolos y formateo)
  const parsePrice = useMemo(() => {
    return (value: string): number => {
      if (!value || value.trim() === '') return 0;

      // Remover símbolos de moneda y caracteres no numéricos excepto punto y coma
      const cleanValue = value.replace(/[^\d,.-]/g, '');

      // Normalizar separador decimal (usar punto)
      const normalizedValue = cleanValue.replace(',', '.');

      const parsed = parseFloat(normalizedValue);
      return isNaN(parsed) ? 0 : parsed;
    };
  }, []);

  return {
    currency,
    symbol,
    locale: currencyConfig.locale,
    decimalPlaces: currencyConfig.decimalPlaces,
    format: currencyConfig.format,
    formatPrice,
    parsePrice,
  };
}
