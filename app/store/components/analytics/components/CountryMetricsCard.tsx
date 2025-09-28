import { Card, Text, Box, BlockStack, InlineStack, Tooltip, Icon } from '@shopify/polaris';
import { InfoIcon } from '@shopify/polaris-icons';
import React from 'react';
import { NoDataMessage } from '@/app/store/components/analytics/components/NoDataMessage';

interface CountryMetricsCardProps {
  countryData: Record<string, number>;
  className?: string;
}

export function CountryMetricsCard({ countryData, className: _className }: CountryMetricsCardProps) {
  const totalSessions = Object.values(countryData).reduce((sum, value) => sum + value, 0);

  const countryNames: Record<string, string> = {
    CO: 'Colombia',
    US: 'Estados Unidos',
    MX: 'México',
    AR: 'Argentina',
  };

  const tooltipContent = (
    <BlockStack gap="100">
      <Text variant="bodyMd" as="p" fontWeight="bold">
        Sesiones por país
      </Text>
      <Text variant="bodySm" as="p" tone="subdued">
        Distribución geográfica de las sesiones de usuarios según su país de origen.
      </Text>
    </BlockStack>
  );

  const countryItems = Object.entries(countryData)
    .sort(([, countA], [, countB]) => countB - countA) // Sort by count descending
    .map(([countryCode, count]) => {
      const percentage = totalSessions > 0 ? ((count / totalSessions) * 100).toFixed(1) : '0';
      return {
        country: countryNames[countryCode] || countryCode,
        code: countryCode,
        count,
        percentage: parseFloat(percentage),
      };
    });

  return (
    <Card>
      <Box padding="400">
        <InlineStack gap="100" blockAlign="center">
          <Text variant="headingXs" as="h3">
            Sesiones por país
          </Text>
          <Tooltip content={tooltipContent} dismissOnMouseOut>
            <Icon source={InfoIcon} tone="subdued" />
          </Tooltip>
        </InlineStack>
        <Box paddingBlockStart="300">
          <NoDataMessage data={countryItems} message="No hay datos de países disponibles.">
            <BlockStack gap="200">
              {countryItems.map((item) => (
                <InlineStack key={item.code} gap="200" align="space-between">
                  <InlineStack gap="100" blockAlign="center">
                    <Text variant="bodyMd" as="p">
                      {item.country}
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
