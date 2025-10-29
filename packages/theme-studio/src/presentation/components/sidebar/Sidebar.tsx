/*
 * Theme Studio - Presentación
 */

'use client';

import { Card, BlockStack, Button, Text, Scrollable, Box } from '@shopify/polaris';

interface SidebarProps {
  storeId: string;
  apiBaseUrl: string;
}

export function Sidebar({ storeId }: SidebarProps) {
  return (
    <div>
      <Box padding="200">
        <Card padding="300">
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">
              Secciones
            </Text>
            <Scrollable style={{ height: 'calc(100vh - 160px)' }}>
              <Box padding="200">
                <BlockStack gap="200">
                  {/* Lista de secciones (placeholder) */}
                  <Button fullWidth>Agregar sección</Button>
                </BlockStack>
              </Box>
            </Scrollable>
          </BlockStack>
        </Card>
      </Box>
    </div>
  );
}
