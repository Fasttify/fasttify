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
import type { ReactNode, ComponentProps } from 'react';
import { Box, Text, Icon, InlineStack, Button, Collapsible } from '@shopify/polaris';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  DeleteIcon,
  ViewIcon,
  DragHandleIcon,
  LayoutSectionIcon,
} from '@shopify/polaris-icons';
import { TemplateSection } from '../../../hooks/useTemplateStructure';
import { LayoutSection } from '../../../hooks/useLayoutStructure';
import { BlockItem } from '../block-item/BlockItem';

export interface SectionItemProps {
  section: TemplateSection | LayoutSection;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onSelect: () => void;
  onDelete?: () => void;
  onToggleVisibility?: () => void;
}

function getSectionIcon(section: TemplateSection | LayoutSection) {
  return LayoutSectionIcon;
}

export function SectionItem({
  section,
  isExpanded,
  isSelected,
  onToggleExpand,
  onSelect,
  onDelete,
  onToggleVisibility,
}: SectionItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isTemplateSection = 'blocks' in section;
  const hasBlocks =
    isTemplateSection && ((section.blocks?.length ?? 0) > 0 || (section.schema?.blocks?.length ?? 0) > 0);
  const canExpand = hasBlocks;

  const handleClick = () => {
    if (canExpand) {
      onToggleExpand();
    } else {
      onSelect();
    }
  };

  const ChevronIcon = isExpanded ? ChevronDownIcon : ChevronRightIcon;

  return (
    <Box>
      <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <Button
          variant="tertiary"
          fullWidth
          textAlign="left"
          onClick={handleClick}
          {...({
            children: (
              <InlineStack gap="200" blockAlign="center" align="space-between">
                <InlineStack gap="200" blockAlign="center">
                  {isHovered && <Icon source={DragHandleIcon} tone="subdued" />}
                  {!isHovered && <Box minWidth="20px" />}
                  <Icon source={ChevronIcon} tone="subdued" />
                  <Icon source={getSectionIcon(section)} tone="subdued" />
                  <Text as="span" variant="bodyMd" fontWeight={isSelected ? 'semibold' : 'regular'}>
                    {section.name}
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

      {isExpanded && hasBlocks && isTemplateSection && section.blocks && section.blocks.length > 0 && (
        <Collapsible open={isExpanded} id={`section-${section.id}-blocks`}>
          <Box>
            {section.blocks.map((block: { id: string; type: string; settings: Record<string, any> }) => (
              <BlockItem
                key={block.id}
                block={block}
                sectionId={section.id}
                isSelected={false}
                onSelect={() => {
                  onSelect();
                }}
              />
            ))}
          </Box>
        </Collapsible>
      )}
    </Box>
  );
}
