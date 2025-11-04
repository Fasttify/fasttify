/*
 * Theme Studio - Presentación
 */

'use client';

import { Card, BlockStack, Text, Scrollable, Box, Divider } from '@shopify/polaris';
import { useTemplateStructure } from '../../hooks/useTemplateStructure';
import { useLayoutStructure } from '../../hooks/useLayoutStructure';
import { useStoreTemplates } from '../../hooks/useStoreTemplates';
import type { UseSidebarStateResult } from '../../hooks/useSidebarState';
import { SidebarLoading } from './SidebarLoading';
import { SectionGroup } from './section-group/SectionGroup';

interface SidebarProps {
  storeId: string;
  apiBaseUrl: string;
  currentPageId: string;
  sidebarState: UseSidebarStateResult;
}

export function Sidebar({ storeId, apiBaseUrl, currentPageId, sidebarState }: SidebarProps) {
  const { template, isLoading: isLoadingTemplate } = useTemplateStructure({
    storeId,
    apiBaseUrl,
    pageType: currentPageId,
  });

  const { layout, isLoading: isLoadingLayout } = useLayoutStructure({
    storeId,
    apiBaseUrl,
  });

  const { pages, isLoading: isLoadingPages } = useStoreTemplates({ storeId, apiBaseUrl });

  const {
    expandedSections,
    selectedSectionId,
    selectedBlockId,
    selectedSubBlockId,
    toggleSection,
    selectSection,
    selectBlock,
    selectSubBlock,
  } = sidebarState;

  const currentPageTitle = pages.find((p) => p.id === currentPageId)?.name || 'Página';

  const isLoading = isLoadingTemplate || isLoadingLayout || isLoadingPages;

  if (isLoading) {
    return <SidebarLoading />;
  }

  return (
    <div>
      <Box padding="200">
        <Card padding="300">
          <BlockStack gap="300">
            <Box paddingInlineStart="200">
              <Text as="h2" variant="headingMd">
                {currentPageTitle}
              </Text>
            </Box>
            <div style={{ marginLeft: 'calc(-1 * var(--p-space-300))', marginRight: 'calc(-1 * var(--p-space-300))' }}>
              <Divider borderColor="border" />
            </div>
            <Scrollable style={{ height: 'calc(100vh - 160px)' }}>
              <Box padding="200">
                <BlockStack>
                  <SectionGroup
                    title="Header"
                    sections={layout?.header?.sections ?? []}
                    expandedSections={expandedSections}
                    selectedSectionId={selectedSectionId}
                    selectedBlockId={selectedBlockId}
                    selectedSubBlockId={selectedSubBlockId}
                    onToggleSection={toggleSection}
                    onSelectSection={selectSection}
                    onSelectBlock={selectBlock}
                    onSelectSubBlock={selectSubBlock}
                    onAddSection={() => {
                      // TODO: Implementar modal de agregar sección
                    }}
                  />

                  <div
                    style={{
                      marginLeft: 'calc(-1 * var(--p-space-200))',
                      marginRight: 'calc(-1 * var(--p-space-200))',
                    }}>
                    <Divider borderColor="border" />
                  </div>

                  <SectionGroup
                    title="Template"
                    sections={template?.sections ?? []}
                    sectionOrder={template?.order}
                    expandedSections={expandedSections}
                    selectedSectionId={selectedSectionId}
                    selectedBlockId={selectedBlockId}
                    selectedSubBlockId={selectedSubBlockId}
                    onToggleSection={toggleSection}
                    onSelectSection={selectSection}
                    onSelectBlock={selectBlock}
                    onSelectSubBlock={selectSubBlock}
                    onAddSection={() => {
                      // TODO: Implementar modal de agregar sección
                    }}
                  />

                  <div
                    style={{
                      marginLeft: 'calc(-1 * var(--p-space-200))',
                      marginRight: 'calc(-1 * var(--p-space-200))',
                    }}>
                    <Divider borderColor="border" />
                  </div>

                  <SectionGroup
                    title="Footer"
                    sections={layout?.footer?.sections ?? []}
                    expandedSections={expandedSections}
                    selectedSectionId={selectedSectionId}
                    selectedBlockId={selectedBlockId}
                    selectedSubBlockId={selectedSubBlockId}
                    onToggleSection={toggleSection}
                    onSelectSection={selectSection}
                    onSelectBlock={selectBlock}
                    onSelectSubBlock={selectSubBlock}
                    onAddSection={() => {
                      // TODO: Implementar modal de agregar sección
                    }}
                  />
                </BlockStack>
              </Box>
            </Scrollable>
          </BlockStack>
        </Card>
      </Box>
    </div>
  );
}
