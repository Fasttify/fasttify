import { Badge, BlockStack, InlineStack, Select, Text } from '@shopify/polaris';
import { useMemo } from 'react';

// Tipos para las monedas
interface Currency {
  code: string;
  name: string;
  symbol?: string;
}

interface CurrencySelectorProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  helpText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  showSymbol?: boolean;
  showBadge?: boolean;
}

// Lista de monedas más comunes
const COMMON_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/' },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$' },
  { code: 'PYG', name: 'Paraguayan Guarani', symbol: '₲' },
  { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs' },
  { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q' },
  { code: 'HNL', name: 'Honduran Lempira', symbol: 'L' },
  { code: 'NIO', name: 'Nicaraguan Cordoba', symbol: 'C$' },
  { code: 'CRC', name: 'Costa Rican Colon', symbol: '₡' },
  { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/' },
  { code: 'DOP', name: 'Dominican Peso', symbol: '$' },
  { code: 'JMD', name: 'Jamaican Dollar', symbol: '$' },
  { code: 'TTD', name: 'Trinidad and Tobago Dollar', symbol: '$' },
  { code: 'BBD', name: 'Barbadian Dollar', symbol: '$' },
  { code: 'XCD', name: 'East Caribbean Dollar', symbol: '$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: '$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: '$' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn' },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا' },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت' },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج' },
  { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'NAD', name: 'Namibian Dollar', symbol: '$' },
  { code: 'BWP', name: 'Botswana Pula', symbol: 'P' },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK' },
  { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK' },
  { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨' },
  { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨' },
  { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'AFN', name: 'Afghan Afghani', symbol: '؋' },
  { code: 'IRR', name: 'Iranian Rial', symbol: '﷼' },
  { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د' },
  { code: 'SYP', name: 'Syrian Pound', symbol: '£' },
  { code: 'YER', name: 'Yemeni Rial', symbol: '﷼' },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛' },
  { code: 'LAK', name: 'Lao Kip', symbol: '₭' },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: '$' },
  { code: 'MOP', name: 'Macanese Pataca', symbol: 'MOP$' },
  { code: 'BND', name: 'Brunei Dollar', symbol: '$' },
  { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸' },
  { code: 'UZS', name: 'Uzbekistani Som', symbol: "so'm" },
  { code: 'KGS', name: 'Kyrgyzstani Som', symbol: 'с' },
  { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'ЅM' },
  { code: 'TMT', name: 'Turkmenistan Manat', symbol: 'T' },
  { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼' },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾' },
  { code: 'AMD', name: 'Armenian Dram', symbol: '֏' },
  { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br' },
  { code: 'MDL', name: 'Moldovan Leu', symbol: 'L' },
  { code: 'ALL', name: 'Albanian Lek', symbol: 'L' },
  { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден' },
  { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM' },
  { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮' },
];

export function CurrencySelector({
  value,
  onChange,
  label = 'Moneda',
  helpText,
  error,
  disabled = false,
  required = false,
  showSymbol = true,
  showBadge = true,
}: CurrencySelectorProps) {
  // Opciones para el Select
  const options = useMemo(() => {
    return COMMON_CURRENCIES.map((currency) => ({
      label: `${currency.name} (${currency.code})`,
      value: currency.code,
    }));
  }, []);

  // Función para renderizar la opción seleccionada
  const renderSelectedOption = (selectedValue: string) => {
    const currency = COMMON_CURRENCIES.find((c) => c.code === selectedValue);
    if (!currency) return selectedValue;

    return (
      <InlineStack align="start" gap="200">
        <Text as="span">{currency.name}</Text>
        {showBadge && <Badge tone="info">{currency.code}</Badge>}
        {showSymbol && currency.symbol && (
          <Text as="span" tone="subdued">
            {currency.symbol}
          </Text>
        )}
      </InlineStack>
    );
  };

  return (
    <BlockStack gap="200">
      <Select
        label={label}
        options={options}
        value={value}
        onChange={onChange}
        helpText={helpText}
        error={error}
        disabled={disabled}
        placeholder="Selecciona una moneda"
      />
      {value && <div style={{ marginTop: '8px' }}>{renderSelectedOption(value)}</div>}
    </BlockStack>
  );
}
