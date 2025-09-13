'use client';

import { Autocomplete, Icon } from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';
import { useMemo } from 'react';
import { useAutocomplete } from '../../hooks/useAutocomplete';

interface CategoryAutocompleteProps {
  value: string | null | undefined;
  onChange: (value: string | null | undefined) => void;
  error?: string;
  label?: string;
  helpText?: string;
}

export function CategoryAutocomplete({
  value,
  onChange,
  error,
  label = 'Categoría',
  helpText = 'Selecciona o busca una categoría para tu producto.',
}: CategoryAutocompleteProps) {
  // Opciones de categorías disponibles
  const categoryOptions = useMemo(
    () => [
      { value: 'ropa', label: 'Ropa' },
      { value: 'electronicos', label: 'Electrónica' },
      { value: 'hogar', label: 'Hogar y Cocina' },
      { value: 'belleza', label: 'Belleza y Cuidado Personal' },
      { value: 'deporte', label: 'Deportes y Aire Libre' },
      { value: 'otros', label: 'Otros' },
      { value: 'todas-las-categorias', label: 'Todas las categorías' },
      { value: 'no-categorizado', label: 'No categorizado' },
    ],
    []
  );

  // Usar el hook personalizado para la lógica de autocomplete
  const { inputValue, filteredOptions, selectedValue, updateText, updateSelection, handleFocus } = useAutocomplete({
    options: categoryOptions,
    value,
    onChange,
  });

  // Configurar el campo de texto del autocomplete
  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
      onFocus={handleFocus}
      label={label}
      value={inputValue}
      prefix={<Icon source={SearchIcon} tone="base" />}
      placeholder="Buscar categoría..."
      autoComplete="off"
      error={error}
      helpText={helpText}
    />
  );

  return (
    <div style={{ height: 'auto' }}>
      <Autocomplete
        options={filteredOptions}
        selected={selectedValue}
        onSelect={updateSelection}
        textField={textField}
        allowMultiple={false}
        preferredPosition="mostSpace"
      />
    </div>
  );
}
