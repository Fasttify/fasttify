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

import { TextField, BlockStack, Text, Box } from '@shopify/polaris';
import { useCallback } from 'react';

interface RangeSettingProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  info?: string;
}

export function RangeSetting({ id, label, value, onChange, min, max, step = 1, unit, info }: RangeSettingProps) {
  const handleRangeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number.parseFloat(e.target.value);
      if (!Number.isNaN(newValue)) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  const handleTextFieldChange = useCallback(
    (newValue: string) => {
      const numValue = Number.parseFloat(newValue);
      if (!Number.isNaN(numValue) && numValue >= min && numValue <= max) {
        onChange(numValue);
      }
    },
    [onChange, min, max]
  );

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
      <Box>
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleRangeChange}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            background: '#e1e3e5',
            outline: 'none',
            cursor: 'pointer',
          }}
        />
      </Box>
      <TextField
        id={`${id}-input`}
        label=""
        type="number"
        value={value.toString()}
        onChange={handleTextFieldChange}
        min={min}
        max={max}
        step={step}
        suffix={unit}
        autoComplete="off"
      />
    </BlockStack>
  );
}
