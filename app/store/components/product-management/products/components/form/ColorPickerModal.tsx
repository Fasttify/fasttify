'use client';

import { useState, useCallback } from 'react';
import { Modal, ColorPicker, Text, BlockStack } from '@shopify/polaris';

interface ColorPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onColorSelect: (colorHex: string) => void;
  initialColor?: string;
}

export function ColorPickerModal({
  open,
  onOpenChange,
  onColorSelect,
  initialColor = '#000000',
}: ColorPickerModalProps) {
  const [color, setColor] = useState(() => {
    // Convertir hex inicial a HSB si se proporciona
    if (initialColor && initialColor.startsWith('#')) {
      return hexToHsb(initialColor);
    }
    return {
      hue: 0,
      brightness: 1,
      saturation: 1,
    };
  });

  const handleConfirm = useCallback(() => {
    const hexColor = hsbToHex(color);
    onColorSelect(hexColor);
    onOpenChange(false);
  }, [color, onColorSelect, onOpenChange]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <div style={{ width: '100%' }}>
      <Modal
        open={open}
        onClose={handleCancel}
        title="Seleccionar color personalizado"
        primaryAction={{
          content: 'Agregar color',
          onAction: handleConfirm,
        }}
        secondaryActions={[
          {
            content: 'Cancelar',
            onAction: handleCancel,
          },
        ]}>
        <Modal.Section>
          <BlockStack gap="400">
            <Text as="p" variant="bodyMd" tone="subdued">
              Selecciona un color personalizado para agregar a las opciones de color.
            </Text>
            <ColorPicker onChange={setColor} color={color} fullWidth allowAlpha />
          </BlockStack>
        </Modal.Section>
      </Modal>
    </div>
  );
}

// Función para convertir hex a HSB
function hexToHsb(hex: string) {
  // Remover el # si está presente
  hex = hex.replace('#', '');

  // Convertir a RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let hue = 0;
  if (diff !== 0) {
    if (max === r) {
      hue = ((g - b) / diff) % 6;
    } else if (max === g) {
      hue = (b - r) / diff + 2;
    } else {
      hue = (r - g) / diff + 4;
    }
  }
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;

  const saturation = max === 0 ? 0 : diff / max;
  const brightness = max;

  return {
    hue,
    saturation,
    brightness,
  };
}

// Función para convertir HSB a hex
function hsbToHex(hsb: { hue: number; saturation: number; brightness: number }) {
  const { hue, saturation, brightness } = hsb;

  const c = brightness * saturation;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = brightness - c;

  let r = 0,
    g = 0,
    b = 0;

  if (hue >= 0 && hue < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (hue >= 60 && hue < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (hue >= 120 && hue < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (hue >= 180 && hue < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (hue >= 240 && hue < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (hue >= 300 && hue < 360) {
    r = c;
    g = 0;
    b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
