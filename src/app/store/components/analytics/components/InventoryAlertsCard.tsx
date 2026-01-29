import { Card, Text, Box, InlineStack, Tooltip, BlockStack, Icon } from '@shopify/polaris';
import { InfoIcon } from '@shopify/polaris-icons';
import { NoDataMessage } from '@/app/store/components/analytics/components/NoDataMessage';

interface InventoryAlertsCardProps {
  lowStockAlerts: number;
  outOfStockProducts: number;
  className?: string;
}

export function InventoryAlertsCard({
  lowStockAlerts,
  outOfStockProducts,
  className: _className,
}: InventoryAlertsCardProps) {
  const tooltipContent = (
    <BlockStack gap="100">
      <Text variant="bodyMd" as="p" fontWeight="bold">
        Alertas de inventario
      </Text>
      <Text variant="bodySm" as="p" tone="subdued">
        Productos con stock bajo y productos completamente agotados que requieren atención inmediata.
      </Text>
    </BlockStack>
  );

  const totalAlerts = lowStockAlerts + outOfStockProducts;

  return (
    <Card>
      <Box padding="400">
        <InlineStack gap="100" blockAlign="center">
          <Text variant="headingXs" as="h3">
            Alertas de inventario
          </Text>
          <Tooltip content={tooltipContent} dismissOnMouseOut>
            <Icon source={InfoIcon} tone="subdued" />
          </Tooltip>
        </InlineStack>
        <Text variant="headingLg" as="p" tone={totalAlerts > 0 ? 'critical' : 'inherit'}>
          {totalAlerts}
        </Text>
        <Box paddingBlockStart="300">
          <NoDataMessage
            data={totalAlerts > 0 ? [{ alerts: totalAlerts }] : null}
            message="No hay alertas de inventario.">
            <BlockStack gap="200">
              <InlineStack gap="200" align="space-between">
                <Text variant="bodyMd" as="p">
                  Stock bajo
                </Text>
                <Text variant="bodyMd" as="p" tone={lowStockAlerts > 0 ? 'critical' : 'inherit'}>
                  {lowStockAlerts}
                </Text>
              </InlineStack>
              <InlineStack gap="200" align="space-between">
                <Text variant="bodyMd" as="p">
                  Agotados
                </Text>
                <Text variant="bodyMd" as="p" tone={outOfStockProducts > 0 ? 'critical' : 'inherit'}>
                  {outOfStockProducts}
                </Text>
              </InlineStack>
            </BlockStack>
          </NoDataMessage>
        </Box>
      </Box>
    </Card>
  );
}
