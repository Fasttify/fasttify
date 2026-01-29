export interface DateRange {
  since: Date;
  until: Date;
}

export interface DateRangeOption {
  title: string;
  alias: string;
  period: DateRange;
}

export interface ComparisonOption {
  title: string;
  alias: string;
  period?: DateRange;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface AnalyticsHeaderProps {
  selectedDateRange: DateRangeOption;
  onDateRangeChange: (range: DateRangeOption) => void;
  selectedComparison?: ComparisonOption;
  onComparisonChange?: (comparison: ComparisonOption) => void;
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  availableCurrencies: Currency[];
  loading?: boolean;
}
