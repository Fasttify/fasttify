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

import { useState } from 'react';
import { Text, Icon, InlineStack, Button } from '@shopify/polaris';
import { DragHandleIcon, DeleteIcon, ViewIcon } from '@shopify/polaris-icons';
import type { ComponentProps } from 'react';
import type { ReactNode } from 'react';

export interface BlockItemProps {
  block: {
    id: string;
    type: string;
    settings: Record<string, any>;
  };
  sectionId: string;
  blockSchema?: {
    type: string;
    name: string;
    settings?: any[];
  };
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  onToggleVisibility?: () => void;
}

function getBlockDisplayName(block: BlockItemProps['block'], blockSchema?: BlockItemProps['blockSchema']): string {
  if (blockSchema?.name) {
    return blockSchema.name;
  }
  return block.settings.name || block.settings.title || block.type;
}

export function BlockItem({
  block,
  sectionId,
  blockSchema,
  isSelected,
  onSelect,
  onDelete,
  onToggleVisibility,
}: BlockItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const displayName = getBlockDisplayName(block, blockSchema);

  return (
    <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Button
        variant="tertiary"
        fullWidth
        textAlign="left"
        onClick={onSelect}
        {...({
          children: (
            <InlineStack gap="200" blockAlign="center" align="space-between">
              <InlineStack gap="200" blockAlign="center">
                <div
                  style={{
                    position: 'relative',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <div
                    style={{
                      position: 'absolute',
                      opacity: isHovered ? 1 : 0,
                      transition: 'opacity 0.2s ease-in-out',
                    }}>
                    <Icon source={DragHandleIcon} tone="subdued" />
                  </div>
                </div>
                <Text as="span" variant="bodySm">
                  {displayName}
                </Text>
              </InlineStack>

              {(isHovered || isSelected) && (
                <InlineStack gap="050">
                  {onToggleVisibility && (
                    <div
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onToggleVisibility();
                      }}>
                      <Button variant="plain" icon={<Icon source={ViewIcon} />} />
                    </div>
                  )}
                  {onDelete && (
                    <div
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onDelete();
                      }}>
                      <Button variant="plain" icon={<Icon source={DeleteIcon} />} />
                    </div>
                  )}
                </InlineStack>
              )}
            </InlineStack>
          ),
        } as ComponentProps<typeof Button> & { children: ReactNode })}
      />
    </div>
  );
}
