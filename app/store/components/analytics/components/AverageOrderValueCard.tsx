import { Card, Text, Box, InlineStack, Tooltip, BlockStack, Icon } from '@shopify/polaris';
import { InfoIcon } from '@shopify/polaris-icons';
import { NoDataMessage } from '@/app/store/components/analytics/components/NoDataMessage';

interface AverageOrderValueCardProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
}

export function AverageOrderValueCard({ value, children, className: _className }: AverageOrderValueCardProps) {
  const tooltipContent = (
    <BlockStack gap="100">
      <Text variant="bodyMd" as="p" fontWeight="bold">
        Valor promedio de orden
      </Text>
      <Text variant="bodySm" as="p" tone="subdued">
        Valor promedio de cada pedido completado. Se calcula como: Total de ingresos ÷ Número total de órdenes
      </Text>
    </BlockStack>
  );

  return (
    <Card>
      <Box padding="400">
        <InlineStack gap="100" blockAlign="center">
          <Text variant="headingXs" as="h3">
            Valor promedio de orden
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
