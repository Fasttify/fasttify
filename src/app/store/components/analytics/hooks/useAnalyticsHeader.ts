'use client';

import { useState, useCallback } from 'react';
import { DateRangeOption, ComparisonOption, Currency } from '@/app/store/components/analytics/types';
import { DATE_RANGE_OPTIONS } from '@/app/store/components/analytics/constants/dateRanges';
import { CURRENCIES } from '@/app/store/components/analytics/constants/currencies';
import { useAnalyticsCurrency } from '@/app/store/components/analytics/context/AnalyticsCurrencyContext';

export function useAnalyticsHeader() {
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeOption>(DATE_RANGE_OPTIONS[0]);
  const [selectedComparison, setSelectedComparison] = useState<ComparisonOption | undefined>(undefined);

  // Usar el contexto de moneda de analíticas
  const { analyticsCurrency, setAnalyticsCurrency } = useAnalyticsCurrency();

  const handleDateRangeChange = useCallback((range: DateRangeOption) => {
    setSelectedDateRange(range);
  }, []);

  const handleComparisonChange = useCallback((comparison: ComparisonOption) => {
    setSelectedComparison(comparison);
  }, []);

  const handleCurrencyChange = useCallback(
    (currency: Currency) => {
      setAnalyticsCurrency(currency);
    },
    [setAnalyticsCurrency]
  );

  return {
    selectedDateRange,
    selectedComparison,
    selectedCurrency: analyticsCurrency,
    availableCurrencies: CURRENCIES,
    onDateRangeChange: handleDateRangeChange,
    onComparisonChange: handleComparisonChange,
    onCurrencyChange: handleCurrencyChange,
  };
}
