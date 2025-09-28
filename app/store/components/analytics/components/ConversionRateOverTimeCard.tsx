import { Card, Text, Box, InlineStack, Tooltip, BlockStack, Icon } from '@shopify/polaris';
import { InfoIcon } from '@shopify/polaris-icons';
import { NoDataMessage } from '@/app/store/components/analytics/components/NoDataMessage';

interface ConversionRateOverTimeCardProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
}

export function ConversionRateOverTimeCard({
  value,
  children,
  className: _className,
}: ConversionRateOverTimeCardProps) {
  const tooltipContent = (
    <BlockStack gap="100">
      <Text variant="bodyMd" as="p" fontWeight="bold">
        Tasa de conversión
      </Text>
      <Text variant="bodySm" as="p" tone="subdued">
        Porcentaje de visitantes que realizan una compra. Se calcula como: (Órdenes completadas ÷ Vistas de tienda) ×
        100
      </Text>
    </BlockStack>
  );

  return (
    <Card>
      <Box padding="400">
        <InlineStack gap="100" blockAlign="center">
          <Text variant="headingXs" as="h3">
            Tasa de conversión en el tiempo
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
