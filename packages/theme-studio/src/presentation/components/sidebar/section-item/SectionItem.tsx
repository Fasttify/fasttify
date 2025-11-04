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
  selectedBlockId: string | null;
  onToggleExpand: () => void;
  onSelect: () => void;
  onSelectBlock: (blockId: string) => void;
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
  selectedBlockId,
  onToggleExpand,
  onSelect,
  onSelectBlock,
  onDelete,
  onToggleVisibility,
}: SectionItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isTemplateSection = 'blocks' in section;
  const hasBlocksInSchema = (section.schema?.blocks?.length ?? 0) > 0;
  const hasCurrentBlocks = isTemplateSection && (section.blocks?.length ?? 0) > 0;
  const canExpand = hasBlocksInSchema;

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canExpand) {
      onToggleExpand();
    }
  };

  const handleSectionClick = () => {
    onSelect();
  };

  const ChevronIcon = isExpanded ? ChevronDownIcon : ChevronRightIcon;

  return (
    <Box>
      <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <Button
          variant="tertiary"
          fullWidth
          textAlign="left"
          onClick={handleSectionClick}
          {...({
            children: (
              <InlineStack gap="200" blockAlign="center" align="space-between">
                <InlineStack gap="200" blockAlign="center">
                  <InlineStack gap="050" blockAlign="center">
                    <div
                      onClick={handleChevronClick}
                      style={{
                        cursor: canExpand ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '2px',
                      }}>
                      <Icon source={ChevronIcon} tone="subdued" />
                    </div>
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
                          opacity: isHovered ? 0 : 1,
                          transition: 'opacity 0.2s ease-in-out',
                        }}>
                        <Icon source={getSectionIcon(section)} tone="subdued" />
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          opacity: isHovered ? 1 : 0,
                          transition: 'opacity 0.2s ease-in-out',
                        }}>
                        <Icon source={DragHandleIcon} tone="subdued" />
                      </div>
                    </div>
                  </InlineStack>
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

      {isExpanded && canExpand && (
        <Collapsible open={isExpanded} id={`section-${section.id}-blocks`}>
          <Box>
            {hasCurrentBlocks && section.blocks ? (
              section.blocks.map((block: { id: string; type: string; settings: Record<string, any> }) => {
                const blockSchema = section.schema?.blocks?.find((b: any) => b.type === block.type);
                return (
                  <BlockItem
                    key={block.id}
                    block={block}
                    sectionId={section.id}
                    blockSchema={blockSchema}
                    isSelected={selectedBlockId === block.id}
                    onSelect={() => {
                      onSelectBlock(block.id);
                    }}
                    onDelete={onDelete}
                    onToggleVisibility={onToggleVisibility}
                  />
                );
              })
            ) : (
              <Box padding="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  No hay bloques en esta sección
                </Text>
              </Box>
            )}
          </Box>
        </Collapsible>
      )}
    </Box>
  );
}
