'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Currency } from '@/app/store/components/analytics/types';
import { useStoreCurrency } from '@/app/store/hooks/format/useStoreCurrency';

interface AnalyticsCurrencyContextType {
  analyticsCurrency: Currency;
  setAnalyticsCurrency: (currency: Currency) => void;
  isUsingStoreCurrency: boolean;
  resetToStoreCurrency: () => void;
}

const AnalyticsCurrencyContext = createContext<AnalyticsCurrencyContextType | undefined>(undefined);

interface AnalyticsCurrencyProviderProps {
  children: React.ReactNode;
}

export function AnalyticsCurrencyProvider({ children }: AnalyticsCurrencyProviderProps) {
  const { currency: storeCurrency, symbol: storeSymbol } = useStoreCurrency();

  // Crear objeto Currency basado en la moneda de la tienda
  const storeCurrencyObject: Currency = useMemo(
    () => ({
      code: storeCurrency,
      symbol: storeSymbol,
      name: storeCurrency,
    }),
    [storeCurrency, storeSymbol]
  );

  const [analyticsCurrency, setAnalyticsCurrencyState] = useState<Currency>(storeCurrencyObject);

  // Actualizar la moneda de analíticas cuando cambie la moneda de la tienda
  useEffect(() => {
    setAnalyticsCurrencyState(storeCurrencyObject);
  }, [storeCurrencyObject]);

  const setAnalyticsCurrency = (currency: Currency) => {
    setAnalyticsCurrencyState(currency);
  };

  const resetToStoreCurrency = () => {
    setAnalyticsCurrencyState(storeCurrencyObject);
  };

  const isUsingStoreCurrency = analyticsCurrency.code === storeCurrency;

  const value: AnalyticsCurrencyContextType = {
    analyticsCurrency,
    setAnalyticsCurrency,
    isUsingStoreCurrency,
    resetToStoreCurrency,
  };

  return <AnalyticsCurrencyContext.Provider value={value}>{children}</AnalyticsCurrencyContext.Provider>;
}

export function useAnalyticsCurrency() {
  const context = useContext(AnalyticsCurrencyContext);
  if (context === undefined) {
    throw new Error('useAnalyticsCurrency must be used within an AnalyticsCurrencyProvider');
  }
  return context;
}
