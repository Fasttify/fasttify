'use client';

import { memo, useState } from 'react';
import { Autocomplete, Button, Icon, Tag, Text } from '@shopify/polaris';
import { PlusCircleIcon, SearchIcon, ColorIcon } from '@shopify/polaris-icons';
import { DefaultVariant, DefaultVariantOption } from '../../data/default-variants';
import { useVariantOptions } from '../../hooks/useVariantOptions';
import { ColorPickerModal } from './ColorPickerModal';

interface VariantOptionSelectorProps {
  variant: DefaultVariant;
  selectedOptions: string[];
  onAddOption: (option: DefaultVariantOption) => void;
  onRemoveOption: (optionValue: string) => void;
  onAddCustomOption: (customValue: string) => void;
}

export const VariantOptionSelector = memo(function VariantOptionSelector({
  variant,
  selectedOptions,
  onAddOption,
  onRemoveOption,
  onAddCustomOption,
}: VariantOptionSelectorProps) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const { inputValue, options, updateText, removeTag, handleSelection, handleAddCustomOption, isColorVariant } =
    useVariantOptions({
      variant,
      selectedOptions,
      onAddOption,
      onRemoveOption,
      onAddCustomOption,
    });

  const handleColorSelect = (colorHex: string) => {
    // Crear un objeto DefaultVariantOption para el color personalizado
    const customColorOption: DefaultVariantOption = {
      value: colorHex,
      label: colorHex.toUpperCase(),
      color: colorHex,
    };
    onAddOption(customColorOption);
  };

  const verticalContentMarkup =
    selectedOptions.length > 0 ? (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
        {selectedOptions.map((option) => {
          const variantOption = variant.options.find((opt) => opt.value === option);

          // Para colores personalizados, usar el valor directamente si es un código hex
          const getColorValue = () => {
            if (isColorVariant) {
              // Si es un código hex (empieza con #), usarlo directamente
              if (option.startsWith('#')) {
                return option;
              }
              // Si no, usar el color del variantOption o fallback
              return variantOption?.color || '#e5e7eb';
            }
            return '#e5e7eb';
          };

          const getLabel = () => {
            // Para colores personalizados, mostrar el código hex en mayúsculas
            if (isColorVariant && option.startsWith('#')) {
              return option.toUpperCase();
            }
            return variantOption?.label || option;
          };

          return (
            <Tag key={`option${option}`} onRemove={removeTag(option)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isColorVariant && (
                  <div
                    style={{
                      width: '13px',
                      height: '13px',
                      backgroundColor: getColorValue(),
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                    }}
                  />
                )}
                {getLabel()}
              </div>
            </Tag>
          );
        })}
      </div>
    ) : null;

  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
      label={`Agregar ${variant.label.toLowerCase()}`}
      labelHidden
      value={inputValue}
      prefix={<Icon source={SearchIcon} tone="base" />}
      placeholder={`Agregar ${variant.label.toLowerCase()}`}
      verticalContent={verticalContentMarkup}
      autoComplete="off"
    />
  );

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ marginBottom: '12px' }}>
        <Text as="h3" variant="headingMd" fontWeight="semibold">
          {variant.label}
        </Text>
        <Text as="p" variant="bodyMd" tone="subdued">
          Variantes de {variant.label.toLowerCase()} para el producto
        </Text>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <Autocomplete
          allowMultiple
          options={options}
          selected={selectedOptions}
          textField={textField}
          onSelect={handleSelection}
          listTitle={`Opciones de ${variant.label}`}
          preferredPosition="mostSpace"
          emptyState={
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <Text as="p" variant="bodyMd" tone="subdued">
                No se encontraron opciones
              </Text>
            </div>
          }
        />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <Button onClick={handleAddCustomOption} disabled={!inputValue.trim()} icon={PlusCircleIcon}>
          Agregar entrada personalizada
        </Button>
        {isColorVariant && (
          <Button onClick={() => setColorPickerOpen(true)} icon={ColorIcon} variant="secondary">
            Seleccionar color
          </Button>
        )}
      </div>

      <ColorPickerModal open={colorPickerOpen} onOpenChange={setColorPickerOpen} onColorSelect={handleColorSelect} />
    </div>
  );
});
