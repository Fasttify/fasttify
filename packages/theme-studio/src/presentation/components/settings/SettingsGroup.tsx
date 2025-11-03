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

import { BlockStack } from '@shopify/polaris';
import { SettingField } from './SettingField';

interface SettingsGroupProps {
  settings: any[];
  currentSettings: Record<string, any>;
  onSettingChange: (settingId: string, value: any) => void;
  imageSelectorComponent?: (props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect?: (image: { url: string } | null) => void;
    initialSelectedImage?: string | null;
  }) => React.ReactElement | null;
}

export function SettingsGroup({
  settings,
  currentSettings,
  onSettingChange,
  imageSelectorComponent,
}: SettingsGroupProps) {
  return (
    <BlockStack gap="400">
      {settings.map((setting) => {
        const value = currentSettings[setting.id];
        return (
          <SettingField
            key={setting.id || `setting-${settings.indexOf(setting)}`}
            setting={setting}
            value={value}
            onChange={(newValue) => {
              if (setting.id) {
                onSettingChange(setting.id, newValue);
              }
            }}
            imageSelectorComponent={imageSelectorComponent}
          />
        );
      })}
    </BlockStack>
  );
}
