import { Card, Text, Box, InlineStack, Tooltip, BlockStack, Icon } from '@shopify/polaris';
import { InfoIcon } from '@shopify/polaris-icons';
import { NoDataMessage } from '@/app/store/components/analytics/components/NoDataMessage';

interface TotalSalesByProductCardProps {
  className?: string;
}

export function TotalSalesByProductCard({ className: _className }: TotalSalesByProductCardProps) {
  const tooltipContent = (
    <BlockStack gap="100">
      <Text variant="bodyMd" as="p" fontWeight="bold">
        Ventas totales por producto
      </Text>
      <Text variant="bodySm" as="p" tone="subdued">
        Ranking de productos más vendidos mostrando ingresos generados por cada producto individual.
      </Text>
    </BlockStack>
  );

  return (
    <Card>
      <Box padding="400">
        <InlineStack gap="100" blockAlign="center">
          <Text variant="headingXs" as="h3">
            Ventas totales por producto
          </Text>
          <Tooltip content={tooltipContent} dismissOnMouseOut>
            <Icon source={InfoIcon} tone="subdued" />
          </Tooltip>
        </InlineStack>
        <Box paddingBlockStart="400">
          <NoDataMessage data={null} style={{ height: '200px', borderRadius: '8px', backgroundColor: '#f6f6f7' }}>
            <div>Contenido del gráfico</div>
          </NoDataMessage>
        </Box>
      </Box>
    </Card>
  );
}
