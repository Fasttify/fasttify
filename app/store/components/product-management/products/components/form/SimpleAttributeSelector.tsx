'use client';

import { Autocomplete, Button, Icon, Text } from '@shopify/polaris';
import { PlusCircleIcon, SearchIcon, DeleteIcon } from '@shopify/polaris-icons';
import { useCallback, useMemo, useState } from 'react';
import { getAllDefaultVariants } from '../../data/default-variants';

interface SimpleAttributeSelectorProps {
  onSelectVariant: (variantName: string) => void;
  onCreateCustom: () => void;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

export function SimpleAttributeSelector({
  onSelectVariant,
  onCreateCustom,
  onDelete,
  showDeleteButton = false,
}: SimpleAttributeSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedValue, setSelectedValue] = useState<string[]>([]);

  // Obtener variantes por defecto
  const defaultVariants = useMemo(() => {
    return getAllDefaultVariants();
  }, []);

  // Convertir variantes a formato de opciones del Autocomplete
  const variantOptions = useMemo(() => {
    return defaultVariants.map((variant) => ({
      label: variant.label,
      value: variant.name,
    }));
  }, [defaultVariants]);

  // Filtrar opciones basado en la búsqueda
  const filteredOptions = useMemo(() => {
    if (!inputValue.trim()) return variantOptions;

    return variantOptions.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase()));
  }, [variantOptions, inputValue]);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleSelection = useCallback(
    (selected: string[]) => {
      if (selected.length > 0) {
        onSelectVariant(selected[0]);
        setInputValue('');
        setSelectedValue([]);
      }
    },
    [onSelectVariant]
  );

  const handleAddCustom = useCallback(() => {
    if (inputValue.trim()) {
      onSelectVariant(inputValue.trim());
      setInputValue('');
    }
  }, [inputValue, onSelectVariant]);

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
      }}>
      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text as="h3" variant="headingMd">
          Agregar atributo
        </Text>
        {showDeleteButton && onDelete && (
          <Button onClick={onDelete} icon={DeleteIcon} variant="tertiary" tone="critical" size="slim">
            Eliminar
          </Button>
        )}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <Autocomplete
          options={filteredOptions}
          selected={selectedValue}
          onSelect={handleSelection}
          textField={
            <Autocomplete.TextField
              onChange={handleInputChange}
              label="Buscar atributo"
              value={inputValue}
              prefix={<Icon source={SearchIcon} tone="base" />}
              placeholder="Buscar o escribir nombre del atributo..."
              autoComplete="off"
            />
          }
          allowMultiple={false}
          preferredPosition="mostSpace"
        />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <Button onClick={handleAddCustom} disabled={!inputValue.trim()} icon={PlusCircleIcon}>
          Agregar atributo
        </Button>
        <Button onClick={onCreateCustom} variant="plain" icon={PlusCircleIcon}>
          Crear personalizado
        </Button>
      </div>
    </div>
  );
}
