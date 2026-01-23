import { Card, Text, Box, InlineStack, Tooltip, BlockStack, Icon } from '@shopify/polaris';
import { InfoIcon } from '@shopify/polaris-icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';
import { NoDataMessage } from '@/app/store/components/analytics/components/NoDataMessage';
import { useAnalyticsCurrencyFormatting } from '@/app/store/hooks/data/useStoreAnalytics/utils/useAnalyticsCurrencyFormatting';
import { generateFlatLineData } from '@/app/store/components/analytics/utils/chartDataUtils';

interface AverageOrderValueCardProps {
  value: string;
  data?: Array<{ name: string; value: number }>;
  children?: React.ReactNode;
  className?: string;
}

export function AverageOrderValueCard({
  value,
  data,
  children: _children,
  className: _className,
}: AverageOrderValueCardProps) {
  const { formatCurrency } = useAnalyticsCurrencyFormatting();
  const chartData = generateFlatLineData(data, 2, 0);
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
          <NoDataMessage data={data} style={{ height: '200px', width: '100%' }}>
            <div style={{ height: '200px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e1e5e9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e1e5e9' }}
                    tickLine={{ stroke: '#e1e5e9' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e1e5e9' }}
                    tickLine={{ stroke: '#e1e5e9' }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
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
                                Valor promedio: {formatCurrency(currentValue)}
                              </Text>
                            </BlockStack>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </NoDataMessage>
        </Box>
      </Box>
    </Card>
  );
}
