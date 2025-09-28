import { useMemo } from 'react';

export const CURRENCY_CONFIGS: Record<
  string,
  {
    format: string;
    locale: string;
    decimalPlaces: number;
  }
> = {
  // América Latina
  COP: { format: '${{amount}}', locale: 'es-CO', decimalPlaces: 2 },
  MXN: { format: '${{amount}}', locale: 'es-MX', decimalPlaces: 2 },
  ARS: { format: '${{amount}}', locale: 'es-AR', decimalPlaces: 2 },
  BRL: { format: 'R${{amount}}', locale: 'pt-BR', decimalPlaces: 2 },
  CLP: { format: '${{amount}}', locale: 'es-CL', decimalPlaces: 0 },
  PEN: { format: 'S/{{amount}}', locale: 'es-PE', decimalPlaces: 2 },
  UYU: { format: '${{amount}}', locale: 'es-UY', decimalPlaces: 2 },
  PYG: { format: '₲{{amount}}', locale: 'es-PY', decimalPlaces: 0 },
  BOB: { format: 'Bs{{amount}}', locale: 'es-BO', decimalPlaces: 2 },
  GTQ: { format: 'Q{{amount}}', locale: 'es-GT', decimalPlaces: 2 },
  HNL: { format: 'L{{amount}}', locale: 'es-HN', decimalPlaces: 2 },
  NIO: { format: 'C${{amount}}', locale: 'es-NI', decimalPlaces: 2 },
  CRC: { format: '₡{{amount}}', locale: 'es-CR', decimalPlaces: 2 },
  PAB: { format: 'B/{{amount}}', locale: 'es-PA', decimalPlaces: 2 },
  DOP: { format: '${{amount}}', locale: 'es-DO', decimalPlaces: 2 },
  JMD: { format: '${{amount}}', locale: 'en-JM', decimalPlaces: 2 },
  TTD: { format: '${{amount}}', locale: 'en-TT', decimalPlaces: 2 },
  BBD: { format: '${{amount}}', locale: 'en-BB', decimalPlaces: 2 },
  XCD: { format: '${{amount}}', locale: 'en-AG', decimalPlaces: 2 },

  // América del Norte
  USD: { format: '${{amount}}', locale: 'en-US', decimalPlaces: 2 },
  CAD: { format: '${{amount}}', locale: 'en-CA', decimalPlaces: 2 },

  // Europa
  EUR: { format: '{{amount}}€', locale: 'es-ES', decimalPlaces: 2 },
  GBP: { format: '£{{amount}}', locale: 'en-GB', decimalPlaces: 2 },
  CHF: { format: 'CHF{{amount}}', locale: 'de-CH', decimalPlaces: 2 },
  SEK: { format: 'kr{{amount}}', locale: 'sv-SE', decimalPlaces: 2 },
  NOK: { format: 'kr{{amount}}', locale: 'nb-NO', decimalPlaces: 2 },
  DKK: { format: 'kr{{amount}}', locale: 'da-DK', decimalPlaces: 2 },
  PLN: { format: 'zł{{amount}}', locale: 'pl-PL', decimalPlaces: 2 },
  CZK: { format: 'Kč{{amount}}', locale: 'cs-CZ', decimalPlaces: 2 },
  HUF: { format: 'Ft{{amount}}', locale: 'hu-HU', decimalPlaces: 0 },
  RON: { format: 'lei{{amount}}', locale: 'ro-RO', decimalPlaces: 2 },
  BGN: { format: 'лв{{amount}}', locale: 'bg-BG', decimalPlaces: 2 },
  HRK: { format: 'kn{{amount}}', locale: 'hr-HR', decimalPlaces: 2 },
  RSD: { format: 'дин{{amount}}', locale: 'sr-RS', decimalPlaces: 2 },
  UAH: { format: '₴{{amount}}', locale: 'uk-UA', decimalPlaces: 2 },
  RUB: { format: '₽{{amount}}', locale: 'ru-RU', decimalPlaces: 2 },
  TRY: { format: '₺{{amount}}', locale: 'tr-TR', decimalPlaces: 2 },
  ILS: { format: '₪{{amount}}', locale: 'he-IL', decimalPlaces: 2 },

  // Asia
  JPY: { format: '¥{{amount}}', locale: 'ja-JP', decimalPlaces: 0 },
  CNY: { format: '¥{{amount}}', locale: 'zh-CN', decimalPlaces: 2 },
  INR: { format: '₹{{amount}}', locale: 'en-IN', decimalPlaces: 2 },
  KRW: { format: '₩{{amount}}', locale: 'ko-KR', decimalPlaces: 0 },
  SGD: { format: '${{amount}}', locale: 'en-SG', decimalPlaces: 2 },
  TWD: { format: 'NT${{amount}}', locale: 'zh-TW', decimalPlaces: 2 },
  HKD: { format: '${{amount}}', locale: 'zh-HK', decimalPlaces: 2 },
  MOP: { format: 'MOP${{amount}}', locale: 'zh-MO', decimalPlaces: 2 },
  BND: { format: '${{amount}}', locale: 'ms-BN', decimalPlaces: 2 },
  KZT: { format: '₸{{amount}}', locale: 'kk-KZ', decimalPlaces: 2 },
  UZS: { format: "so'm{{amount}}", locale: 'uz-UZ', decimalPlaces: 2 },
  KGS: { format: 'с{{amount}}', locale: 'ky-KG', decimalPlaces: 2 },
  TJS: { format: 'ЅM{{amount}}', locale: 'tg-TJ', decimalPlaces: 2 },
  TMT: { format: 'T{{amount}}', locale: 'tk-TM', decimalPlaces: 2 },
  AZN: { format: '₼{{amount}}', locale: 'az-AZ', decimalPlaces: 2 },
  GEL: { format: '₾{{amount}}', locale: 'ka-GE', decimalPlaces: 2 },
  AMD: { format: '֏{{amount}}', locale: 'hy-AM', decimalPlaces: 2 },
  BYN: { format: 'Br{{amount}}', locale: 'be-BY', decimalPlaces: 2 },
  MDL: { format: 'L{{amount}}', locale: 'ro-MD', decimalPlaces: 2 },
  ALL: { format: 'L{{amount}}', locale: 'sq-AL', decimalPlaces: 2 },
  MKD: { format: 'ден{{amount}}', locale: 'mk-MK', decimalPlaces: 2 },
  BAM: { format: 'KM{{amount}}', locale: 'bs-BA', decimalPlaces: 2 },
  MNT: { format: '₮{{amount}}', locale: 'mn-MN', decimalPlaces: 2 },

  // Oceanía
  AUD: { format: '${{amount}}', locale: 'en-AU', decimalPlaces: 2 },
  NZD: { format: '${{amount}}', locale: 'en-NZ', decimalPlaces: 2 },

  // África
  ZAR: { format: 'R{{amount}}', locale: 'en-ZA', decimalPlaces: 2 },
  NAD: { format: '${{amount}}', locale: 'en-NA', decimalPlaces: 2 },
  BWP: { format: 'P{{amount}}', locale: 'en-BW', decimalPlaces: 2 },
  ZMW: { format: 'ZK{{amount}}', locale: 'en-ZM', decimalPlaces: 2 },
  MWK: { format: 'MK{{amount}}', locale: 'en-MW', decimalPlaces: 2 },
  MUR: { format: '₨{{amount}}', locale: 'en-MU', decimalPlaces: 2 },
  SCR: { format: '₨{{amount}}', locale: 'en-SC', decimalPlaces: 2 },
  MVR: { format: 'Rf{{amount}}', locale: 'dv-MV', decimalPlaces: 2 },
  LKR: { format: 'Rs{{amount}}', locale: 'si-LK', decimalPlaces: 2 },
  BDT: { format: '৳{{amount}}', locale: 'bn-BD', decimalPlaces: 2 },
  NPR: { format: '₨{{amount}}', locale: 'ne-NP', decimalPlaces: 2 },
  PKR: { format: '₨{{amount}}', locale: 'ur-PK', decimalPlaces: 2 },
  AFN: { format: '؋{{amount}}', locale: 'ps-AF', decimalPlaces: 2 },
  IRR: { format: '﷼{{amount}}', locale: 'fa-IR', decimalPlaces: 2 },
  IQD: { format: 'ع.د{{amount}}', locale: 'ar-IQ', decimalPlaces: 3 },
  SYP: { format: '£{{amount}}', locale: 'ar-SY', decimalPlaces: 2 },
  YER: { format: '﷼{{amount}}', locale: 'ar-YE', decimalPlaces: 2 },
  KHR: { format: '៛{{amount}}', locale: 'km-KH', decimalPlaces: 2 },
  LAK: { format: '₭{{amount}}', locale: 'lo-LA', decimalPlaces: 2 },
  MMK: { format: 'K{{amount}}', locale: 'my-MM', decimalPlaces: 2 },
  THB: { format: '฿{{amount}}', locale: 'th-TH', decimalPlaces: 2 },
  VND: { format: '₫{{amount}}', locale: 'vi-VN', decimalPlaces: 0 },
  IDR: { format: 'Rp{{amount}}', locale: 'id-ID', decimalPlaces: 2 },
  MYR: { format: 'RM{{amount}}', locale: 'ms-MY', decimalPlaces: 2 },
  PHP: { format: '₱{{amount}}', locale: 'en-PH', decimalPlaces: 2 },

  // Medio Oriente
  AED: { format: 'د.إ{{amount}}', locale: 'ar-AE', decimalPlaces: 2 },
  SAR: { format: 'ر.س{{amount}}', locale: 'ar-SA', decimalPlaces: 2 },
  QAR: { format: 'ر.ق{{amount}}', locale: 'ar-QA', decimalPlaces: 2 },
  KWD: { format: 'د.ك{{amount}}', locale: 'ar-KW', decimalPlaces: 3 },
  BHD: { format: '.د.ب{{amount}}', locale: 'ar-BH', decimalPlaces: 3 },
  OMR: { format: 'ر.ع.{{amount}}', locale: 'ar-OM', decimalPlaces: 3 },
  JOD: { format: 'د.ا{{amount}}', locale: 'ar-JO', decimalPlaces: 3 },
  LBP: { format: 'ل.ل{{amount}}', locale: 'ar-LB', decimalPlaces: 2 },
  EGP: { format: '£{{amount}}', locale: 'ar-EG', decimalPlaces: 2 },
  MAD: { format: 'د.م.{{amount}}', locale: 'ar-MA', decimalPlaces: 2 },
  TND: { format: 'د.ت{{amount}}', locale: 'ar-TN', decimalPlaces: 3 },
  DZD: { format: 'د.ج{{amount}}', locale: 'ar-DZ', decimalPlaces: 2 },
  LYD: { format: 'ل.د{{amount}}', locale: 'ar-LY', decimalPlaces: 3 },
  NGN: { format: '₦{{amount}}', locale: 'en-NG', decimalPlaces: 2 },
  GHS: { format: '₵{{amount}}', locale: 'en-GH', decimalPlaces: 2 },
  KES: { format: 'KSh{{amount}}', locale: 'en-KE', decimalPlaces: 2 },
  UGX: { format: 'USh{{amount}}', locale: 'en-UG', decimalPlaces: 0 },
  TZS: { format: 'TSh{{amount}}', locale: 'sw-TZ', decimalPlaces: 2 },

  // Configuración por defecto
  DEFAULT: { format: '${{amount}}', locale: 'es-CO', decimalPlaces: 2 },
};

export function useCurrencyConfig(currencyCode?: string) {
  const config = useMemo(() => {
    if (!currencyCode) {
      return CURRENCY_CONFIGS.DEFAULT;
    }

    return CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.DEFAULT;
  }, [currencyCode]);

  const getCurrencyConfig = (currency: string) => {
    return CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.DEFAULT;
  };

  return {
    config,
    getCurrencyConfig,
    format: config.format,
    locale: config.locale,
    decimalPlaces: config.decimalPlaces,
  };
}
