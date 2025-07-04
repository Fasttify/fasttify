import type { PageSummary } from '@/app/store/components/page-management/types/page-types';
import { getStatusText, getStatusTone } from '@/app/store/components/page-management/utils/page-utils';
import { Badge, BlockStack, Box, Button, ButtonGroup, LegacyCard, Text } from '@shopify/polaris';
import { DeleteIcon, EditIcon } from '@shopify/polaris-icons';

interface PageListMobileProps {
  pages: PageSummary[];
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
