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

import { Select } from '@shopify/polaris';
import { useCallback, useMemo } from 'react';

interface SelectSettingProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  info?: string;
}

export function SelectSetting({ id, label, value, onChange, options, info }: SelectSettingProps) {
  const handleChange = useCallback(
    (newValue: string) => {
      onChange(newValue);
    },
    [onChange]
  );

  const selectOptions = useMemo(() => {
    return options.map((opt) => ({
      label: opt.label,
      value: opt.value,
    }));
  }, [options]);

  return <Select id={id} label={label} options={selectOptions} value={value} onChange={handleChange} helpText={info} />;
}
