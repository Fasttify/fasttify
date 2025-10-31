/*
 * Theme Studio - Presentación
 */

'use client';

import { Card, BlockStack, Text, Scrollable, Box } from '@shopify/polaris';
import { useTemplateStructure } from '../../hooks/useTemplateStructure';
import { useLayoutStructure } from '../../hooks/useLayoutStructure';
import { useStoreTemplates } from '../../hooks/useStoreTemplates';
import { useSidebarState } from '../../hooks/useSidebarState';
import { SidebarLoading } from './SidebarLoading';
import { SectionGroup } from './section-group/SectionGroup';

interface SidebarProps {
  storeId: string;
  apiBaseUrl: string;
  currentPageId: string;
}

export function Sidebar({ storeId, apiBaseUrl, currentPageId }: SidebarProps) {
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
    toggleSection,
    selectSection,
    selectBlock,
    clearSelection,
  } = useSidebarState();

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
            <Box borderColor="border" borderBlockEndWidth="025" />
            <Scrollable style={{ height: 'calc(100vh - 160px)' }}>
              <Box padding="200">
                <BlockStack gap="400">
                  <SectionGroup
                    title="Header"
                    sections={layout?.header?.sections ?? []}
                    expandedSections={expandedSections}
                    selectedSectionId={selectedSectionId}
                    onToggleSection={toggleSection}
                    onSelectSection={selectSection}
                    onAddSection={() => {
                      // TODO: Implementar modal de agregar sección
                    }}
                  />

                  <SectionGroup
                    title="Template"
                    sections={template?.sections ?? []}
                    sectionOrder={template?.order}
                    expandedSections={expandedSections}
                    selectedSectionId={selectedSectionId}
                    onToggleSection={toggleSection}
                    onSelectSection={selectSection}
                    onAddSection={() => {
                      // TODO: Implementar modal de agregar sección
                    }}
                  />

                  <SectionGroup
                    title="Footer"
                    sections={layout?.footer?.sections ?? []}
                    expandedSections={expandedSections}
                    selectedSectionId={selectedSectionId}
                    onToggleSection={toggleSection}
                    onSelectSection={selectSection}
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
