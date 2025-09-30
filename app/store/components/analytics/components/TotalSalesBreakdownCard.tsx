import { Card, Text, Box, BlockStack, InlineStack, Tooltip, Icon } from '@shopify/polaris';
import { InfoIcon } from '@shopify/polaris-icons';
import { NoDataMessage } from '@/app/store/components/analytics/components/NoDataMessage';

interface BreakdownItem {
  label: string;
  value: string;
  trend?: React.ReactNode;
}

interface TotalSalesBreakdownCardProps {
  items: BreakdownItem[];
  className?: string;
}

export function TotalSalesBreakdownCard({ items, className: _className }: TotalSalesBreakdownCardProps) {
  const tooltipContent = (
    <BlockStack gap="100">
      <Text variant="bodyMd" as="p" fontWeight="bold">
        Desglose de ventas totales
      </Text>
      <Text variant="bodySm" as="p" tone="subdued">
        Análisis detallado de las ventas incluyendo ingresos brutos, descuentos, productos vendidos y métricas clave.
      </Text>
    </BlockStack>
  );

  return (
    <Card>
      <Box padding="400">
        <BlockStack gap="400">
          <InlineStack gap="100" blockAlign="center">
            <Text variant="headingXs" as="h3">
              Desglose de ventas totales
            </Text>
            <Tooltip content={tooltipContent} dismissOnMouseOut>
              <Icon source={InfoIcon} tone="subdued" />
            </Tooltip>
          </InlineStack>
          <NoDataMessage data={items}>
            <BlockStack gap="150">
              {items?.map((item, index) => (
                <Box key={index}>
                  <Box paddingBlock="200">
                    <InlineStack gap="200" align="space-between" blockAlign="center">
                      <Text variant="bodyMd" as="p">
                        {item.label}
                      </Text>
                      <InlineStack gap="100" blockAlign="center">
                        <Text variant="bodyMd" as="p" fontWeight="medium">
                          {item.value}
                        </Text>
                        {item.trend && <Box>{item.trend}</Box>}
                      </InlineStack>
                    </InlineStack>
                  </Box>
                  {index < items.length - 1 && (
                    <Box paddingInline="0">
                      <div
                        style={{
                          height: '1px',
                          backgroundColor: '#e1e5e9',
                          margin: '0',
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ))}
            </BlockStack>
          </NoDataMessage>
        </BlockStack>
      </Box>
    </Card>
  );
}
