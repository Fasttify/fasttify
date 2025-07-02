import { Badge, BlockStack, Box, Button, ButtonGroup, LegacyCard, Text } from '@shopify/polaris';
import { EditIcon, DeleteIcon } from '@shopify/polaris-icons';
import type { Page } from '@/app/store/components/page-management/types/page-types';
import { getStatusText, getStatusTone, truncateContent } from '@/app/store/components/page-management/utils/page-utils';

interface PageListMobileProps {
  pages: Page[];
  handleEditPage: (id: string) => void;
  handleDeletePage: (id: string) => void;
}

export function PageListMobile({ pages, handleEditPage, handleDeletePage }: PageListMobileProps) {
  return (
    <div className="sm:hidden">
      <LegacyCard>
        <BlockStack gap="0">
          {pages.map((page, index) => (
            <div key={page.id}>
              <Box padding="400">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <div>
                    <Text as="h3" variant="bodyMd" fontWeight="semibold">
                      {page.title}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {truncateContent(page.content || '', 50)}
                    </Text>
                  </div>
                  <ButtonGroup>
                    <Button
                      icon={EditIcon}
                      onClick={() => handleEditPage(page.id)}
                      size="slim"
                      accessibilityLabel={`Editar ${page.title}`}
                    />
                    <Button
                      icon={DeleteIcon}
                      onClick={() => handleDeletePage(page.id)}
                      size="slim"
                      tone="critical"
                      accessibilityLabel={`Eliminar ${page.title}`}
                    />
                  </ButtonGroup>
                </div>
                <Box paddingBlockStart="200">
                  <Badge tone={getStatusTone(page.status)}>{getStatusText(page.status)}</Badge>
                </Box>
              </Box>
              {index < pages.length - 1 && <hr />}
            </div>
          ))}
        </BlockStack>
      </LegacyCard>
    </div>
  );
}
