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
  children: _children,
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
          <NoDataMessage data={steps}>
            <BlockStack gap="100">
              {steps?.map((step, index) => (
                <Box key={index}>
                  <Box padding="100">
                    <InlineStack gap="200" align="space-between" blockAlign="center">
                      <Text variant="bodyMd" as="p">
                        {step.label}
                      </Text>
                      <InlineStack gap="100" blockAlign="center">
                        <Text variant="bodyMd" as="p" fontWeight="medium">
                          {step.percentage}
                        </Text>
                        <Text variant="bodyMd" tone="inherit" as="p" fontWeight="medium">
                          {step.count}
                        </Text>
                      </InlineStack>
                    </InlineStack>
                  </Box>
                  {index < steps.length - 1 && (
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
        </Box>
      </Box>
    </Card>
  );
}
