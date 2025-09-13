'use client';

import { useState, useCallback } from 'react';
import { TextField } from '@shopify/polaris';
import { useStoreCurrency } from '@/app/store/hooks/useStoreCurrency';

interface PriceFieldProps {
  label: string;
  value: number | null | undefined;
  onChange: (value: number | undefined) => void;
  error?: string;
  helpText?: string;
  placeholder?: string;
}

export function PriceField({ label, value, onChange, error, helpText, placeholder }: PriceFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState('');
  const { formatPrice } = useStoreCurrency();

  const parseUserInput = useCallback((inputValue: string): number | undefined => {
    if (inputValue.trim() === '') return undefined;

    const cleanValue = inputValue.replace(/[^\d,.-]/g, '');

    const normalizedValue = cleanValue.replace(',', '.');

    const parsed = parseFloat(normalizedValue);
    return isNaN(parsed) ? undefined : parsed;
  }, []);

  const handleFocus = useCallback(() => {
    setIsEditing(true);
    setEditingValue(value ? String(value).replace('.', ',') : '');
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);

    const parsedValue = parseUserInput(editingValue);
    onChange(parsedValue);
  }, [editingValue, onChange, parseUserInput]);

  const handleChange = useCallback((newValue: string) => {
    setEditingValue(newValue);
  }, []);

  const displayValue = isEditing ? editingValue : value ? String(value).replace('.', ',') : '';

  return (
    <TextField
      label={label}
      type="text"
      prefix="$"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      error={error}
      helpText={helpText}
      placeholder={placeholder || formatPrice(0)}
      autoComplete="off"
    />
  );
}
