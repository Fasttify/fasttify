'use client';

import { Button, Text } from '@shopify/polaris';
import { PlusCircleIcon, DeleteIcon } from '@shopify/polaris-icons';
import { VariantOptionSelector } from './VariantOptionSelector';
import { getDefaultVariant } from '../../data/default-variants';

interface Attribute {
  name?: string;
  values?: string[];
}

interface VariantsDisplayProps {
  attributes: Attribute[];
  onAddVariant: () => void;
  onAddOption: (index: number, option: any) => void;
  onRemoveOption: (index: number, optionValue: string) => void;
  onAddCustomOption: (index: number, customValue: string) => void;
  onRemoveVariant: (index: number) => void;
}

export function VariantsDisplay({
  attributes,
  onAddVariant,
  onAddOption,
  onRemoveOption,
  onAddCustomOption,
  onRemoveVariant,
}: VariantsDisplayProps) {
  if (attributes.length === 0) {
    return (
      <div style={{ textAlign: 'center' }}>
        <Text as="h2" variant="headingMd" fontWeight="semibold">
          Variantes
        </Text>
        <div style={{ marginBottom: '16px' }}>
          <Text as="p" tone="subdued">
            Agregue atributos como talla, color, etc. para crear variantes del producto.
          </Text>
        </div>
        <Button onClick={onAddVariant} icon={PlusCircleIcon} variant="tertiary">
          Agregar opciones como talla o color
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <Text as="h2" variant="headingMd" fontWeight="semibold">
          Variantes
        </Text>
      </div>

      {/* Variant Selectors */}
      <div>
        {attributes.map((attribute, index) => {
          const variant = getDefaultVariant(attribute.name || '');
          if (!variant) return null;

          return (
            <div key={index} style={{ marginBottom: '24px', position: 'relative' }}>
              <VariantOptionSelector
                variant={variant}
                selectedOptions={attribute.values || []}
                onAddOption={(option) => onAddOption(index, option)}
                onRemoveOption={(optionValue) => onRemoveOption(index, optionValue)}
                onAddCustomOption={(customValue) => onAddCustomOption(index, customValue)}
              />

              {/* Botón de eliminar variante */}
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  zIndex: 10,
                }}>
                <Button
                  onClick={() => onRemoveVariant(index)}
                  icon={DeleteIcon}
                  variant="tertiary"
                  tone="critical"
                  size="slim">
                  Eliminar
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Another Option Button */}
      <div
        style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb',
        }}>
        <Button onClick={onAddVariant} variant="plain" icon={PlusCircleIcon} fullWidth>
          Agregar otra opción
        </Button>
      </div>
    </div>
  );
}
