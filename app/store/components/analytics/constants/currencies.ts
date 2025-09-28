import { CURRENCY_CONFIGS } from '@/app/store/hooks/currency/useCurrencyConfig';

export const CURRENCIES = Object.keys(CURRENCY_CONFIGS)
  .filter((key) => key !== 'DEFAULT')
  .map((code) => {
    const config = CURRENCY_CONFIGS[code];
    return {
      code,
      symbol: config.format.replace('{{amount}}', ''),
      name: code,
    };
  });

export const DEFAULT_CURRENCY = {
  code: 'COP',
  symbol: CURRENCY_CONFIGS.COP.format.replace('{{amount}}', ''),
  name: 'Peso Colombiano',
};
