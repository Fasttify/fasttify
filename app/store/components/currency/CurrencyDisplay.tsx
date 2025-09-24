'use client';

import { useStoreCurrency } from '@/app/store/hooks/format/useStoreCurrency';

interface CurrencyDisplayProps {
  value: number | null | undefined;
  className?: string;
  showZero?: boolean;
}

export function CurrencyDisplay({ value, className, showZero = true }: CurrencyDisplayProps) {
  const { formatPrice } = useStoreCurrency();

  // Si el valor es null/undefined y no queremos mostrar cero
  if ((value === null || value === undefined) && !showZero) {
    return null;
  }

  const displayValue = value ?? 0;
  const formattedPrice = formatPrice(displayValue);

  // Agregar espacio entre el símbolo y el número si no lo tiene
  const spacedPrice = formattedPrice.replace(/([^\d\s])(\d)/, '$1 $2');

  return <span className={className}>{spacedPrice}</span>;
}
