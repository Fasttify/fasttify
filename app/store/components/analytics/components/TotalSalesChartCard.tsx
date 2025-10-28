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
import { formatDateForChartAnalytics } from '@/app/store/hooks/data/useStoreAnalytics/utils/dateUtils';
import { generateFlatLineData } from '@/app/store/components/analytics/utils/chartDataUtils';

interface TotalSalesChartCardProps {
  value: string;
  data?: Array<{ name: string; value: number }>;
  children?: React.ReactNode;
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
  }>;
  label?: string;
  chartData: Array<{ name: string; value: number }>;
  totalSales: number;
  formatCurrency: (value: number) => string;
  formatPercentage: (value: number) => string;
}

function CustomTooltip({
  active,
  payload,
  label,
  chartData,
  totalSales,
  formatCurrency,
  formatPercentage,
}: CustomTooltipProps) {
  if (active && payload && payload.length && label) {
    const currentValue = payload[0].value;
    const currentIndex = chartData.findIndex((item) => item.name === label);
    const previousValue = currentIndex > 0 ? chartData[currentIndex - 1].value : null;

    const change = previousValue !== null ? currentValue - previousValue : null;
    const changePercentage =
      previousValue && previousValue > 0 && change !== null ? (change / previousValue) * 100 : null;

    const percentageOfTotal = totalSales > 0 ? (currentValue / totalSales) * 100 : 0;

    return (
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          minWidth: '200px',
        }}>
        <BlockStack gap="150">
          <Text variant="bodyMd" as="p" fontWeight="bold">
            {formatDateForChartAnalytics(label)}
          </Text>
          <Text variant="bodySm" as="p">
            Ventas: {formatCurrency(currentValue)}
          </Text>
          <Text variant="bodySm" as="p">
            % del total: {formatPercentage(percentageOfTotal)}
          </Text>
          {change !== null && (
            <Text variant="bodySm" as="p" tone={change >= 0 ? 'success' : 'critical'} fontWeight="medium">
              Cambio vs día anterior: {change >= 0 ? '+' : ''}
              {formatCurrency(change)}
              {changePercentage !== null && (
                <span>
                  {' '}
                  ({change >= 0 ? '+' : ''}
                  {formatPercentage(changePercentage)})
                </span>
              )}
            </Text>
          )}
        </BlockStack>
      </div>
    );
  }
  return null;
}

export function TotalSalesChartCard({
  value,
  data,
  children: _children,
  className: _className,
}: TotalSalesChartCardProps) {
  const { formatCurrency, formatPercentage } = useAnalyticsCurrencyFormatting();
  const chartData = generateFlatLineData(data, 2, 0);

  // Calcular el total de ventas para porcentajes
  const totalSales = chartData.reduce((sum, item) => sum + item.value, 0);
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
          <NoDataMessage data={data} style={{ height: '300px', width: '100%' }}>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: 35, bottom: 5 }}>
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
                    content={(props) => (
                      <CustomTooltip
                        {...props}
                        chartData={chartData}
                        totalSales={totalSales}
                        formatCurrency={formatCurrency}
                        formatPercentage={formatPercentage}
                      />
                    )}
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
