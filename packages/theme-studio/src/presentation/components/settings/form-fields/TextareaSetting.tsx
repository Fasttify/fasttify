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

import { TextField } from '@shopify/polaris';
import { useCallback } from 'react';

interface TextareaSettingProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  info?: string;
  rows?: number;
}

export function TextareaSetting({ id, label, value, onChange, placeholder, info, rows = 4 }: TextareaSettingProps) {
  const handleChange = useCallback(
    (newValue: string) => {
      onChange(newValue);
    },
    [onChange]
  );

  return (
    <TextField
      id={id}
      label={label}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      helpText={info}
      multiline={rows}
      autoComplete="off"
    />
  );
}
