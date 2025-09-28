import { Card, Text, Box, InlineStack, Tooltip, BlockStack, Icon } from '@shopify/polaris';
import { InfoIcon } from '@shopify/polaris-icons';
import { NoDataMessage } from '@/app/store/components/analytics/components/NoDataMessage';

interface TotalSalesChartCardProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
}

export function TotalSalesChartCard({ value, children, className: _className }: TotalSalesChartCardProps) {
  const tooltipContent = (
    <BlockStack gap="100">
      <Text variant="bodyMd" as="p" fontWeight="bold">
        Ventas totales en el tiempo
      </Text>
      <Text variant="bodySm" as="p" tone="subdued">
        Evolución temporal de los ingresos totales generados por todas las ventas en el período seleccionado.
      </Text>
    </BlockStack>
  );

  return (
    <Card>
      <Box padding="400">
        <InlineStack gap="100" blockAlign="center">
          <Text variant="headingXs" as="h3">
            Ventas totales en el tiempo
          </Text>
          <Tooltip content={tooltipContent} dismissOnMouseOut>
            <Icon source={InfoIcon} tone="subdued" />
          </Tooltip>
        </InlineStack>
        <Text variant="headingLg" as="p" tone="inherit">
          {value}
        </Text>
        <Box paddingBlockStart="400">
          <NoDataMessage data={null} style={{ height: '200px', backgroundColor: '#f6f6f7', borderRadius: '8px' }}>
            {children || <div>Contenido del gráfico</div>}
          </NoDataMessage>
        </Box>
      </Box>
    </Card>
  );
}
