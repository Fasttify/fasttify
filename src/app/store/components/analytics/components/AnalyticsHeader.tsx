'use client';

import { InlineStack, Text, Icon, Badge } from '@shopify/polaris';
import { ChartPopularIcon } from '@shopify/polaris-icons';
import { DateRangePicker } from '@/app/store/components/analytics/components/DateRangePicker/DateRangePicker';
import { CurrencyPicker } from '@/app/store/components/analytics/components/CurrencyPicker';
import { AnalyticsHeaderProps } from '@/app/store/components/analytics/types';
import { useAnalyticsCurrency } from '@/app/store/components/analytics/context/AnalyticsCurrencyContext';

export function AnalyticsHeader({
  selectedDateRange,
  onDateRangeChange,
  selectedCurrency,
  onCurrencyChange,
  availableCurrencies,
  loading = false,
}: AnalyticsHeaderProps) {
  const { isUsingStoreCurrency, analyticsCurrency } = useAnalyticsCurrency();

  return (
    <div style={{ padding: '20px 24px', backgroundColor: '#f6f6f7' }}>
      <InlineStack gap="400" align="start" blockAlign="center">
        <InlineStack gap="200" blockAlign="center">
          <Icon source={ChartPopularIcon} />
          <Text variant="headingLg" as="h1">
            Analíticas
          </Text>
          {!isUsingStoreCurrency && (
            <Badge tone="warning">{`Vista en ${analyticsCurrency.symbol} ${analyticsCurrency.code}`}</Badge>
          )}
        </InlineStack>

        <InlineStack gap="200" blockAlign="center">
          <DateRangePicker selectedRange={selectedDateRange} onRangeChange={onDateRangeChange} loading={loading} />

          <CurrencyPicker
            selectedCurrency={selectedCurrency}
            onCurrencyChange={onCurrencyChange}
            availableCurrencies={availableCurrencies}
          />
        </InlineStack>
      </InlineStack>
    </div>
  );
}
