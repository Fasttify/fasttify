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

import { Checkbox } from '@shopify/polaris';
import { useCallback } from 'react';

interface CheckboxSettingProps {
  id: string;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  info?: string;
}

export function CheckboxSetting({ id, label, value, onChange, info }: CheckboxSettingProps) {
  const handleChange = useCallback(
    (newValue: boolean) => {
      onChange(newValue);
    },
    [onChange]
  );

  return <Checkbox id={id} label={label} checked={value} onChange={handleChange} helpText={info} />;
}
