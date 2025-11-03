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

import {
  TextSetting,
  TextareaSetting,
  ColorSetting,
  RangeSetting,
  CheckboxSetting,
  SelectSetting,
  UrlSetting,
  ImagePickerSetting,
  HeaderSetting,
  ParagraphSetting,
} from './form-fields';

interface SettingFieldProps {
  setting: any;
  value: any;
  onChange: (value: any) => void;
  imageSelectorComponent?: (props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect?: (image: { url: string } | null) => void;
    initialSelectedImage?: string | null;
  }) => React.ReactElement | null;
}

export function SettingField({ setting, value, onChange, imageSelectorComponent }: SettingFieldProps) {
  const { type, id, label, default: defaultValue, info, options, min, max, step, unit, placeholder, content } = setting;

  // Obtener el valor actual o usar el default
  const currentValue = value !== undefined && value !== null ? value : defaultValue;

  switch (type) {
    case 'header':
      return <HeaderSetting content={content || label} />;

    case 'paragraph':
      return <ParagraphSetting content={content || ''} />;

    case 'text':
      return (
        <TextSetting
          id={id}
          label={label}
          value={currentValue || ''}
          onChange={onChange}
          placeholder={placeholder}
          info={info}
        />
      );

    case 'textarea':
      return (
        <TextareaSetting
          id={id}
          label={label}
          value={currentValue || ''}
          onChange={onChange}
          placeholder={placeholder}
          info={info}
        />
      );

    case 'color':
      return <ColorSetting id={id} label={label} value={currentValue || '#000000'} onChange={onChange} info={info} />;

    case 'range':
      return (
        <RangeSetting
          id={id}
          label={label}
          value={currentValue ?? defaultValue ?? min ?? 0}
          onChange={onChange}
          min={min ?? 0}
          max={max ?? 100}
          step={step}
          unit={unit}
          info={info}
        />
      );

    case 'checkbox':
      return (
        <CheckboxSetting
          id={id}
          label={label}
          value={currentValue ?? defaultValue ?? false}
          onChange={onChange}
          info={info}
        />
      );

    case 'select':
      return (
        <SelectSetting
          id={id}
          label={label}
          value={currentValue || ''}
          onChange={onChange}
          options={options || []}
          info={info}
        />
      );

    case 'url':
      return (
        <UrlSetting
          id={id}
          label={label}
          value={currentValue || ''}
          onChange={onChange}
          placeholder={placeholder}
          info={info}
        />
      );

    case 'image_picker':
      return (
        <ImagePickerSetting
          id={id}
          label={label}
          value={currentValue}
          onChange={onChange}
          info={info}
          imageSelectorComponent={imageSelectorComponent}
        />
      );

    default:
      return null;
  }
}
