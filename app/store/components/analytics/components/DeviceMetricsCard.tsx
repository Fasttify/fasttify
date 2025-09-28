import { Card, Text, Box, BlockStack, InlineStack, Tooltip, Icon } from '@shopify/polaris';
import { InfoIcon } from '@shopify/polaris-icons';
import { NoDataMessage } from '@/app/store/components/analytics/components/NoDataMessage';

interface DeviceMetricsCardProps {
  deviceData: Record<string, number>;
  className?: string;
}

export function DeviceMetricsCard({ deviceData, className: _className }: DeviceMetricsCardProps) {
  const totalSessions = Object.values(deviceData).reduce((sum, value) => sum + value, 0);

  const deviceTypes = [
    { key: 'mobile', label: 'Móvil', color: '#3B82F6' },
    { key: 'desktop', label: 'Escritorio', color: '#10B981' },
    { key: 'tablet', label: 'Tablet', color: '#F59E0B' },
  ];

  const tooltipContent = (
    <BlockStack gap="100">
      <Text variant="bodyMd" as="p" fontWeight="bold">
        Sesiones por dispositivo
      </Text>
      <Text variant="bodySm" as="p" tone="subdued">
        Distribución de sesiones según el tipo de dispositivo utilizado por los visitantes (móvil, escritorio, tablet).
      </Text>
    </BlockStack>
  );

  return (
    <Card>
      <Box padding="400">
        <InlineStack gap="100" blockAlign="center">
          <Text variant="headingXs" as="h3">
            Sesiones por dispositivo
          </Text>
          <Tooltip content={tooltipContent} dismissOnMouseOut>
            <Icon source={InfoIcon} tone="subdued" />
          </Tooltip>
        </InlineStack>
        <Box paddingBlockStart="300">
          <NoDataMessage
            data={totalSessions > 0 ? deviceTypes : null}
            message="No hay datos de dispositivos disponibles.">
            <BlockStack gap="200">
              {deviceTypes.map(({ key, label, color }) => {
                const value = deviceData[key] || 0;
                const percentage = totalSessions > 0 ? ((value / totalSessions) * 100).toFixed(1) : '0';

                return (
                  <InlineStack key={key} gap="200" align="space-between">
                    <InlineStack gap="100" blockAlign="center">
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: color,
                        }}
                      />
                      <Text variant="bodyMd" as="p">
                        {label}
                      </Text>
                    </InlineStack>
                    <InlineStack gap="100">
                      <Text variant="bodyMd" as="p" fontWeight="semibold">
                        {value}
                      </Text>
                      <Text variant="bodySm" as="p" tone="inherit">
                        ({percentage}%)
                      </Text>
                    </InlineStack>
                  </InlineStack>
                );
              })}
            </BlockStack>
          </NoDataMessage>
        </Box>
      </Box>
    </Card>
  );
}
