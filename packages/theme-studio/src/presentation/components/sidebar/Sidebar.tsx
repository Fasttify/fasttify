/*
 * Theme Studio - Presentación
 */

'use client';

import { Card, BlockStack, Text, Scrollable, Box } from '@shopify/polaris';
import { useTemplateStructure } from '../../hooks/useTemplateStructure';
import { useLayoutStructure } from '../../hooks/useLayoutStructure';
import { useStoreTemplates } from '../../hooks/useStoreTemplates';
import { SidebarLoading } from './SidebarLoading';

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
            <Text as="h2" variant="headingMd">
              {currentPageTitle}
            </Text>
            <Scrollable style={{ height: 'calc(100vh - 160px)' }}>
              <Box padding="200">
                <BlockStack gap="400">
                  {/* TODO: Header section */}
                  {(layout?.header?.sections?.length ?? 0) > 0 && (
                    <div>
                      <Text as="h3" variant="headingSm" fontWeight="semibold">
                        Header
                      </Text>
                      {/* TODO: Render header sections */}
                    </div>
                  )}

                  {/* Template sections */}
                  {(template?.sections?.length ?? 0) > 0 && (
                    <div>
                      <Text as="h3" variant="headingSm" fontWeight="semibold">
                        Template
                      </Text>
                      {/* TODO: Render template sections */}
                    </div>
                  )}

                  {/* Footer section */}
                  {(layout?.footer?.sections?.length ?? 0) > 0 && (
                    <div>
                      <Text as="h3" variant="headingSm" fontWeight="semibold">
                        Footer
                      </Text>
                      {/* TODO: Render footer sections */}
                    </div>
                  )}
                </BlockStack>
              </Box>
            </Scrollable>
          </BlockStack>
        </Card>
      </Box>
    </div>
  );
}
