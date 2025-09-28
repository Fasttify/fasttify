import { Card, Text, Box, BlockStack, InlineStack, Tooltip, Icon } from '@shopify/polaris';
import { InfoIcon } from '@shopify/polaris-icons';
import React from 'react';
import { NoDataMessage } from '@/app/store/components/analytics/components/NoDataMessage';

interface TrafficSourceCardProps {
  referrerData: Record<string, number>;
  className?: string;
}

export function TrafficSourceCard({ referrerData, className: _className }: TrafficSourceCardProps) {
  const totalSessions = Object.values(referrerData).reduce((sum, value) => sum + value, 0);

  const referrerNames: Record<string, string> = {
    google: 'Google',
    facebook: 'Facebook',
    instagram: 'Instagram',
    direct: 'Directo',
  };

  const tooltipContent = (
    <BlockStack gap="100">
      <Text variant="bodyMd" as="p" fontWeight="bold">
        Fuentes de tráfico
      </Text>
      <Text variant="bodySm" as="p" tone="subdued">
        Distribución de sesiones según la fuente de donde provienen los visitantes (buscadores, redes sociales, tráfico
        directo).
      </Text>
    </BlockStack>
  );

  const referrerItems = Object.entries(referrerData)
    .sort(([, countA], [, countB]) => countB - countA) // Sort by count descending
    .map(([referrerKey, count]) => {
      const percentage = totalSessions > 0 ? ((count / totalSessions) * 100).toFixed(1) : '0';
      return {
        referrer: referrerNames[referrerKey] || referrerKey.charAt(0).toUpperCase() + referrerKey.slice(1),
        key: referrerKey,
        count,
        percentage: parseFloat(percentage),
      };
    });

  return (
    <Card>
      <Box padding="400">
        <InlineStack gap="100" blockAlign="center">
          <Text variant="headingXs" as="h3">
            Fuentes de tráfico
          </Text>
          <Tooltip content={tooltipContent} dismissOnMouseOut>
            <Icon source={InfoIcon} tone="subdued" />
          </Tooltip>
        </InlineStack>
        <Box paddingBlockStart="300">
          <NoDataMessage data={referrerItems} message="No hay datos de fuentes de tráfico disponibles.">
            <BlockStack gap="200">
              {referrerItems.map((item) => (
                <InlineStack key={item.key} gap="200" align="space-between">
                  <InlineStack gap="100" blockAlign="center">
                    <Text variant="bodyMd" as="p">
                      {item.referrer}
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
