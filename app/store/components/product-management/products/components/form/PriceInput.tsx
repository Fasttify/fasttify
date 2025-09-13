'use client';

import { useState, useCallback, useEffect } from 'react';
import { TextField } from '@shopify/polaris';
import { useStoreCurrency } from '@/app/store/hooks/useStoreCurrency';

interface PriceInputProps {
  label: string;
  value: number | null | undefined;
  onChange: (value: number | undefined) => void;
  error?: string;
  helpText?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function PriceInput({
  label,
  value,
  onChange,
  error,
  helpText,
  placeholder,
  disabled = false,
}: PriceInputProps) {
  const { formatPrice, parsePrice } = useStoreCurrency();
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Función para formatear números SIN símbolo de moneda (solo para display)
  const formatNumberOnly = useCallback(
    (num: number): string => {
      // Usar formatPrice pero remover el símbolo de moneda
      const formattedWithSymbol = formatPrice(num);
      // Remover todo lo que no sea número, punto, coma o espacio
      return formattedWithSymbol.replace(/[^\d.,\s]/g, '').trim();
    },
    [formatPrice]
  );

  // Función para parsear el input del usuario usando parsePrice
  const parseUserInput = useCallback(
    (input: string): number | undefined => {
      if (!input || input.trim() === '') return undefined;

      // Usar parsePrice directamente
      return parsePrice(input);
    },
    [parsePrice]
  );

  // Función para limpiar el input del usuario (solo números y separadores)
  const cleanInput = useCallback((input: string): string => {
    // Permitir solo dígitos, puntos, comas y espacios
    return input.replace(/[^\d.,\s]/g, '');
  }, []);

  // Actualizar el valor de display cuando cambia el valor externo
  useEffect(() => {
    if (!isFocused) {
      if (value === null || value === undefined) {
        setDisplayValue('');
      } else if (value === 0) {
        setDisplayValue('');
      } else {
        setDisplayValue(formatNumberOnly(value));
      }
    }
  }, [value, isFocused, formatNumberOnly]);

  // Manejar focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // Al hacer focus, mostrar el valor numérico sin formateo para edición
    if (value !== null && value !== undefined && value > 0) {
      // Mostrar el valor sin separadores para edición fácil
      setDisplayValue(value.toString());
    } else {
      setDisplayValue('');
    }
  }, [value]);

  // Manejar blur
  const handleBlur = useCallback(() => {
    setIsFocused(false);

    const parsedValue = parseUserInput(displayValue);
    onChange(parsedValue);
  }, [displayValue, parseUserInput, onChange]);

  // Manejar cambios en el input
  const handleChange = useCallback(
    (newValue: string) => {
      // Limpiar el input mientras el usuario escribe
      const cleanedValue = cleanInput(newValue);
      setDisplayValue(cleanedValue);
    },
    [cleanInput]
  );

  // Determinar el placeholder
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    return formatPrice(0);
  };

  return (
    <TextField
      label={label}
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      error={error}
      helpText={helpText}
      placeholder={getPlaceholder()}
      autoComplete="off"
      disabled={disabled}
    />
  );
}
