import { Card, Text, Box, BlockStack, InlineStack, Tooltip, Icon } from '@shopify/polaris';
import { InfoIcon } from '@shopify/polaris-icons';
import { NoDataMessage } from '@/app/store/components/analytics/components/NoDataMessage';

interface BreakdownStep {
  label: string;
  percentage: string;
  count: string;
}

interface ConversionRateBreakdownCardProps {
  value: string;
  steps: BreakdownStep[];
  children?: React.ReactNode;
  className?: string;
}

export function ConversionRateBreakdownCard({
  value,
  steps,
  children,
  className: _className,
}: ConversionRateBreakdownCardProps) {
  const tooltipContent = (
    <BlockStack gap="100">
      <Text variant="bodyMd" as="p" fontWeight="bold">
        Desglose de tasa de conversión
      </Text>
      <Text variant="bodySm" as="p" tone="subdued">
        Análisis paso a paso del embudo de conversión, desde visitantes únicos hasta compras completadas.
      </Text>
    </BlockStack>
  );

  return (
    <Card>
      <Box padding="400">
        <InlineStack gap="100" blockAlign="center">
          <Text variant="headingXs" as="h3">
            Desglose de tasa de conversión
          </Text>
          <Tooltip content={tooltipContent} dismissOnMouseOut>
            <Icon source={InfoIcon} tone="subdued" />
          </Tooltip>
        </InlineStack>
        <Text variant="headingLg" as="p" tone="inherit">
          {value}
        </Text>
        <Box paddingBlockStart="400">
          <BlockStack gap="300">
            <NoDataMessage data={steps}>
              <BlockStack gap="200">
                {steps?.map((step, index) => (
                  <InlineStack key={index} gap="200" align="space-between" blockAlign="center">
                    <Text variant="bodyMd" as="p">
                      {step.label}
                    </Text>
                    <InlineStack gap="100" blockAlign="center">
                      <Text variant="bodyMd" as="p">
                        {step.percentage}
                      </Text>
                      <Text variant="bodyMd" tone="inherit" as="p">
                        {step.count}
                      </Text>
                    </InlineStack>
                  </InlineStack>
                ))}
              </BlockStack>
            </NoDataMessage>
            {children || (
              <div
                style={{
                  height: '150px',
                  backgroundColor: '#f6f6f7',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text variant="bodyMd" tone="subdued" as="p">
                  No hay datos para este rango de fechas
                </Text>
              </div>
            )}
          </BlockStack>
        </Box>
      </Box>
    </Card>
  );
}
