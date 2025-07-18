import type { PageSummary } from '@/app/store/components/page-management/types/page-types';
import { getStatusText, getStatusTone } from '@/app/store/components/page-management/utils/page-utils';
import { Badge, BlockStack, Box, Button, ButtonGroup, Card, Text } from '@shopify/polaris';
import { DeleteIcon, EditIcon } from '@shopify/polaris-icons';

interface PageListMobileProps {
  pages: PageSummary[];
  handleEditPage: (id: string) => void;
  handleDeletePage: (id: string) => void;
  selectedIds?: string[];
}

export function PageListMobile({ pages, handleEditPage, handleDeletePage, selectedIds }: PageListMobileProps) {
  return (
    <div className="sm:hidden">
      <Card>
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
                  </div>
                  {(!selectedIds || selectedIds.includes(page.id)) && (
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
                  )}
                </div>
                <Box paddingBlockStart="200">
                  <Badge tone={getStatusTone(page.status)}>{getStatusText(page.status)}</Badge>
                </Box>
              </Box>
              {index < pages.length - 1 && <hr />}
            </div>
          ))}
        </BlockStack>
      </Card>
    </div>
  );
}
