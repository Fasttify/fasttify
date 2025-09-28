import { Card, Text, Box, InlineStack, Tooltip, BlockStack, Icon } from '@shopify/polaris';
import { InfoIcon } from '@shopify/polaris-icons';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { NoDataMessage } from '@/app/store/components/analytics/components/NoDataMessage';

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
  const chartData = data || [];

  const tooltipContent = (
    <BlockStack gap="100">
      <Text variant="bodyMd" as="p" fontWeight="bold">
        Tasa de clientes recurrentes
      </Text>
      <Text variant="bodySm" as="p" tone="subdued">
        Porcentaje de clientes que han realizado más de una compra. Se calcula como: (Clientes recurrentes / Total de
        clientes) × 100
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
        <Box paddingBlockStart="050">
          <NoDataMessage data={data} style={{ height: '10px', width: '100%' }}>
            <div style={{ height: '10px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <YAxis hide />
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
