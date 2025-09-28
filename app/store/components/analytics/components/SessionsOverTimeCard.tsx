import { Card, Text, Box, InlineStack, Tooltip, BlockStack, Icon } from '@shopify/polaris';
import { InfoIcon } from '@shopify/polaris-icons';
import { NoDataMessage } from '@/app/store/components/analytics/components/NoDataMessage';

interface SessionsOverTimeCardProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
}

export function SessionsOverTimeCard({ value, children, className: _className }: SessionsOverTimeCardProps) {
  const tooltipContent = (
    <BlockStack gap="100">
      <Text variant="bodyMd" as="p" fontWeight="bold">
        Sesiones totales
      </Text>
      <Text variant="bodySm" as="p" tone="subdued">
        Número total de sesiones iniciadas en tu tienda. Una sesión incluye todas las actividades de un visitante
        durante su visita.
      </Text>
    </BlockStack>
  );

  return (
    <Card>
      <Box padding="400">
        <InlineStack gap="100" blockAlign="center">
          <Text variant="headingXs" as="h3">
            Sesiones en el tiempo
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
