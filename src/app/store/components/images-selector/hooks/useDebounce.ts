import { useState, useEffect } from 'react';

/**
 * Hook personalizado para debounce de valores
 * @param value - Valor a debounce
 * @param delay - Delay en milisegundos
 * @returns Valor debounce
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
