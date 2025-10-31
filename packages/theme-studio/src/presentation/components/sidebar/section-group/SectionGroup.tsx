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

import { Box, Text, Button, BlockStack, Icon } from '@shopify/polaris';
import { PlusCircleIcon } from '@shopify/polaris-icons';
import { TemplateSection } from '../../../hooks/useTemplateStructure';
import { LayoutSection } from '../../../hooks/useLayoutStructure';
import { SectionItem } from '../section-item/SectionItem';

export interface SectionGroupProps {
  title: string;
  sections: (TemplateSection | LayoutSection)[];
  sectionOrder?: string[];
  expandedSections: Set<string>;
  selectedSectionId: string | null;
  onToggleSection: (sectionId: string) => void;
  onSelectSection: (sectionId: string) => void;
  onAddSection?: () => void;
}

function sortSectionsByOrder(
  sections: (TemplateSection | LayoutSection)[],
  order?: string[]
): (TemplateSection | LayoutSection)[] {
  if (!order || order.length === 0) {
    return sections;
  }

  const sectionMap = new Map(sections.map((s) => [s.id, s]));
  const ordered: (TemplateSection | LayoutSection)[] = [];
  const unordered: (TemplateSection | LayoutSection)[] = [];

  order.forEach((id) => {
    const section = sectionMap.get(id);
    if (section) {
      ordered.push(section);
      sectionMap.delete(id);
    }
  });

  sectionMap.forEach((section) => {
    unordered.push(section);
  });

  return [...ordered, ...unordered];
}

export function SectionGroup({
  title,
  sections,
  sectionOrder,
  expandedSections,
  selectedSectionId,
  onToggleSection,
  onSelectSection,
  onAddSection,
}: SectionGroupProps) {
  const sortedSections = sortSectionsByOrder(sections, sectionOrder);

  if (sections.length === 0 && !onAddSection) {
    return null;
  }

  return (
    <Box>
      <BlockStack gap="200">
        <Text as="h3" variant="headingSm" fontWeight="semibold">
          {title}
        </Text>

        {sortedSections.length > 0 &&
          sortedSections.map((section) => (
            <SectionItem
              key={section.id}
              section={section}
              isExpanded={expandedSections.has(section.id)}
              isSelected={selectedSectionId === section.id}
              onToggleExpand={() => onToggleSection(section.id)}
              onSelect={() => onSelectSection(section.id)}
            />
          ))}

        {onAddSection && (
          <Button variant="tertiary" icon={<Icon source={PlusCircleIcon} />} onClick={onAddSection}>
            Agregar sección
          </Button>
        )}
      </BlockStack>
    </Box>
  );
}
