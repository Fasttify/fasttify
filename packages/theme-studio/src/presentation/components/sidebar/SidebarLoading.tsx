/*
 * Theme Studio - Presentación
 */

'use client';

import { Card, BlockStack, Scrollable, Box, SkeletonBodyText } from '@shopify/polaris';

export function SidebarLoading() {
  return (
    <div>
      <Box padding="200">
        <Card padding="300">
          <BlockStack gap="300">
            <SkeletonBodyText lines={1} />
            <Scrollable style={{ height: 'calc(100vh - 160px)' }}>
              <Box padding="200">
                <BlockStack gap="200">
                  <SkeletonBodyText lines={3} />
                  <SkeletonBodyText lines={3} />
                  <SkeletonBodyText lines={3} />
                </BlockStack>
              </Box>
            </Scrollable>
          </BlockStack>
        </Card>
      </Box>
    </div>
  );
}
