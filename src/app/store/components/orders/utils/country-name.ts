export function getCountryName(countryCode: string): string {
  const countries: Record<string, string> = {
    CO: 'Colombia',
    US: 'Estados Unidos',
    MX: 'México',
    ES: 'España',
    AR: 'Argentina',
    BR: 'Brasil',
    CL: 'Chile',
    PE: 'Perú',
    VE: 'Venezuela',
    EC: 'Ecuador',
    BO: 'Bolivia',
    PY: 'Paraguay',
    UY: 'Uruguay',
    GY: 'Guyana',
    SR: 'Surinam',
    GF: 'Guayana Francesa',
  };
  return countries[countryCode] || countryCode;
}
