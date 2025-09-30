import { Card, Text, Box, InlineStack, Tooltip, BlockStack, Icon } from '@shopify/polaris';
import { InfoIcon } from '@shopify/polaris-icons';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { NoDataMessage } from '@/app/store/components/analytics/components/NoDataMessage';
import { useAnalyticsCurrencyFormatting } from '@/app/store/hooks/data/useStoreAnalytics/utils/useAnalyticsCurrencyFormatting';

interface ReturningCustomerRateCardProps {
  value: string;
  trend?: React.ReactNode;
  data?: Array<{ name: string; value: number }>;
  className?: string;
}

export function ReturningCustomerRateCard({
  value,
  trend,
  data,
  className: _className,
}: ReturningCustomerRateCardProps) {
  const { formatPercentage } = useAnalyticsCurrencyFormatting();
  const chartData = data || [];

  const tooltipContent = (
    <BlockStack gap="100">
      <Text variant="bodyMd" as="p" fontWeight="bold">
        Tasa de clientes recurrentes
      </Text>
      <Text variant="bodySm" as="p" tone="subdued">
        El número principal muestra el promedio del período. El gráfico muestra la tasa por día individual.
      </Text>
    </BlockStack>
  );

  return (
    <Card>
      <Box padding="100">
        <InlineStack gap="100" align="space-between" blockAlign="start">
          <Box>
            <InlineStack gap="100" blockAlign="center">
              <Text variant="headingXs" as="p">
                Tasa de clientes recurrentes
              </Text>
              <Tooltip content={tooltipContent} dismissOnMouseOut>
                <Icon source={InfoIcon} tone="subdued" />
              </Tooltip>
            </InlineStack>
            <Text variant="headingMd" as="h3">
              {value}
            </Text>
          </Box>
          {trend && <Box>{trend}</Box>}
        </InlineStack>
        <Box paddingBlockStart="100">
          <NoDataMessage data={data} style={{ height: '60px', width: '100%' }}>
            <div style={{ height: '60px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <RechartsTooltip
                    content={({ active, payload, label }: any) => {
                      if (active && payload && payload.length) {
                        const currentValue = payload[0].value;
                        return (
                          <div
                            style={{
                              backgroundColor: '#fff',
                              border: '1px solid #e1e5e9',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            }}>
                            <BlockStack gap="100">
                              <Text variant="bodySm" as="p" fontWeight="bold">
                                {label}
                              </Text>
                              <Text variant="bodySm" as="p">
                                Tasa este día: {formatPercentage(currentValue)}
                              </Text>
                              <Text variant="bodySm" as="p" tone="subdued">
                                Clientes que regresaron
                              </Text>
                            </BlockStack>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </NoDataMessage>
        </Box>
      </Box>
    </Card>
  );
}
