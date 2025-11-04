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
import { Text, Icon, InlineStack, Button, Box, Collapsible } from '@shopify/polaris';
import { DragHandleIcon, DeleteIcon, ViewIcon, ChevronDownIcon, ChevronRightIcon } from '@shopify/polaris-icons';
import type { ComponentProps } from 'react';
import type { ReactNode } from 'react';

export interface BlockItemProps {
  block: {
    id: string;
    type: string;
    settings: Record<string, any>;
    name?: string;
    blocks?: Array<{
      id: string;
      type: string;
      settings: Record<string, any>;
      name?: string;
    }>;
  };
  sectionId: string;
  blockSchema?: {
    type: string;
    name: string;
    settings?: any[];
    blocks?: Array<{
      type: string;
      name: string;
      settings?: any[];
    }>;
  };
  isSelected: boolean;
  selectedSubBlockId?: string | null;
  parentBlockId?: string;
  onSelect: () => void;
  onSelectSubBlock?: (subBlockId: string, parentBlockId: string, sectionId: string) => void;
  onDelete?: () => void;
  onToggleVisibility?: () => void;
}

function getBlockDisplayName(block: BlockItemProps['block'], blockSchema?: BlockItemProps['blockSchema']): string {
  if (block.name && typeof block.name === 'string') {
    return block.name;
  }
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
  selectedSubBlockId,
  parentBlockId,
  onSelect,
  onSelectSubBlock,
  onDelete,
  onToggleVisibility,
}: BlockItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const displayName = getBlockDisplayName(block, blockSchema);

  const hasSubBlocksInSchema = (blockSchema?.blocks?.length ?? 0) > 0;
  const hasCurrentSubBlocks = (block.blocks?.length ?? 0) > 0;
  const canExpand = hasSubBlocksInSchema;

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canExpand) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleBlockClick = () => {
    onSelect();
    // Si tiene sub-bloques y no está expandido, expandirlo automáticamente
    if (canExpand && !isExpanded) {
      setIsExpanded(true);
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
          onClick={handleBlockClick}
          {...({
            children: (
              <InlineStack gap="200" blockAlign="center" align="space-between">
                <InlineStack gap="200" blockAlign="center">
                  <InlineStack gap="050" blockAlign="center">
                    {canExpand && (
                      <div
                        onClick={handleChevronClick}
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '2px',
                        }}>
                        <Icon source={ChevronIcon} tone="subdued" />
                      </div>
                    )}
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
                  </InlineStack>
                  <Text as="span" variant="bodySm" fontWeight={isSelected ? 'semibold' : 'regular'}>
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

      {isExpanded && canExpand && (
        <Collapsible open={isExpanded} id={`block-${block.id}-subblocks`}>
          <Box paddingInlineStart="400">
            {hasCurrentSubBlocks && block.blocks ? (
              block.blocks.map(
                (subBlock: { id: string; type: string; settings: Record<string, any>; name?: string }) => {
                  const subBlockSchema = blockSchema?.blocks?.find((b: any) => b.type === subBlock.type);
                  return (
                    <BlockItem
                      key={subBlock.id}
                      block={subBlock}
                      sectionId={sectionId}
                      blockSchema={subBlockSchema}
                      isSelected={selectedSubBlockId === subBlock.id}
                      onSelect={() => {
                        // Cuando se selecciona un sub-bloque, pasamos el subBlockId, blockId padre y sectionId
                        if (onSelectSubBlock && parentBlockId) {
                          onSelectSubBlock(subBlock.id, parentBlockId, sectionId);
                        }
                      }}
                      parentBlockId={block.id}
                      onDelete={onDelete}
                      onToggleVisibility={onToggleVisibility}
                    />
                  );
                }
              )
            ) : (
              <Box padding="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  No hay sub-bloques en este bloque
                </Text>
              </Box>
            )}
          </Box>
        </Collapsible>
      )}
    </Box>
  );
}
