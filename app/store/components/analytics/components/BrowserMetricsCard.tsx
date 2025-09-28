import { Card, Text, Box, BlockStack, InlineStack, Tooltip, Icon } from '@shopify/polaris';
import { InfoIcon } from '@shopify/polaris-icons';
import { NoDataMessage } from '@/app/store/components/analytics/components/NoDataMessage';

interface BrowserMetricsCardProps {
  browserData: Record<string, number>;
  className?: string;
}

export function BrowserMetricsCard({ browserData, className: _className }: BrowserMetricsCardProps) {
  const totalSessions = Object.values(browserData).reduce((sum, value) => sum + value, 0);

  const browserNames: Record<string, string> = {
    chrome: 'Chrome',
    safari: 'Safari',
    firefox: 'Firefox',
    edge: 'Edge',
  };

  const tooltipContent = (
    <BlockStack gap="100">
      <Text variant="bodyMd" as="p" fontWeight="bold">
        Sesiones por navegador
      </Text>
      <Text variant="bodySm" as="p" tone="subdued">
        Distribución de sesiones según el navegador web utilizado por los visitantes.
      </Text>
    </BlockStack>
  );

  const browserItems = Object.entries(browserData)
    .sort(([, countA], [, countB]) => countB - countA) // Sort by count descending
    .map(([browserKey, count]) => {
      const percentage = totalSessions > 0 ? ((count / totalSessions) * 100).toFixed(1) : '0';
      return {
        browser: browserNames[browserKey] || browserKey.charAt(0).toUpperCase() + browserKey.slice(1),
        key: browserKey,
        count,
        percentage: parseFloat(percentage),
      };
    });

  return (
    <Card>
      <Box padding="400">
        <InlineStack gap="100" blockAlign="center">
          <Text variant="headingXs" as="h3">
            Sesiones por navegador
          </Text>
          <Tooltip content={tooltipContent} dismissOnMouseOut>
            <Icon source={InfoIcon} tone="subdued" />
          </Tooltip>
        </InlineStack>
        <Box paddingBlockStart="300">
          <NoDataMessage data={browserItems} message="No hay datos de navegadores disponibles.">
            <BlockStack gap="200">
              {browserItems.map((item) => (
                <InlineStack key={item.key} gap="200" align="space-between">
                  <InlineStack gap="100" blockAlign="center">
                    <Text variant="bodyMd" as="p">
                      {item.browser}
                    </Text>
                  </InlineStack>
                  <InlineStack gap="100">
                    <Text variant="bodyMd" as="p" fontWeight="semibold">
                      {item.count}
                    </Text>
                    <Text variant="bodySm" as="p" tone="inherit">
                      ({item.percentage}%)
                    </Text>
                  </InlineStack>
                </InlineStack>
              ))}
            </BlockStack>
          </NoDataMessage>
        </Box>
      </Box>
    </Card>
  );
}
