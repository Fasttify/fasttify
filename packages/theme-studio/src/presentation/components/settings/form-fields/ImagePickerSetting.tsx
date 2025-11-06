/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use client';

import { BlockStack, Button, Text } from '@shopify/polaris';
import { useCallback, useState, type ReactElement } from 'react';

interface ImageSelectorComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (image: { url: string } | null) => void;
  initialSelectedImage?: string | null;
}

interface ImagePickerSettingProps {
  id: string;
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  info?: string;
  imageSelectorComponent?: (props: ImageSelectorComponentProps) => ReactElement | null;
}

export function ImagePickerSetting({
  id,
  label,
  value,
  onChange,
  info,
  imageSelectorComponent,
}: ImagePickerSettingProps) {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const handleSelectImage = useCallback(() => {
    if (imageSelectorComponent) {
      setIsSelectorOpen(true);
    } else {
      // Fallback si no hay componente de selector
      onChange('/images/placeholder.jpg');
    }
  }, [imageSelectorComponent, onChange]);

  const handleImageSelect = useCallback(
    (image: { url: string } | null) => {
      onChange(image?.url || null);
      setIsSelectorOpen(false);
    },
    [onChange]
  );

  const handleRemoveImage = useCallback(() => {
    onChange(null);
  }, [onChange]);

  return (
    <BlockStack gap="200">
      <Text as="p" variant="bodyMd" fontWeight="medium">
        {label}
      </Text>
      {info && (
        <Text as="p" variant="bodySm" tone="subdued">
          {info}
        </Text>
      )}
      {value ? (
        <BlockStack gap="200">
          <div
            style={{
              width: '100%',
              aspectRatio: '16/9',
              backgroundColor: '#f6f6f7',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
            <img
              src={value}
              alt={label}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
          <Button onClick={handleRemoveImage} variant="secondary">
            Eliminar imagen
          </Button>
        </BlockStack>
      ) : (
        <>
          <Button onClick={handleSelectImage} variant="secondary">
            Seleccionar imagen
          </Button>
          {imageSelectorComponent &&
            imageSelectorComponent({
              open: isSelectorOpen,
              onOpenChange: setIsSelectorOpen,
              onSelect: handleImageSelect,
              initialSelectedImage: value,
            })}
        </>
      )}
    </BlockStack>
  );
}
