/*
 * Theme Studio - Presentación
 */

'use client';

import { Card, BlockStack, Text, Button, Box, Scrollable } from '@shopify/polaris';

interface SettingsPaneProps {
  storeId: string;
}

export function SettingsPane({ storeId }: SettingsPaneProps) {
  return (
    <div>
      <Box padding="200">
        <Card padding="300">
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">
              Ajustes
            </Text>
            <Scrollable style={{ height: 'calc(100vh - 160px)' }}>
              <Box padding="200">
                {/* Aquí irán los formularios generados desde el schema de la sección seleccionada */}
                <BlockStack gap="200">
                  <Button variant="primary">Guardar</Button>
                </BlockStack>
              </Box>
            </Scrollable>
          </BlockStack>
        </Card>
      </Box>
    </div>
  );
}
