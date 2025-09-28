import { Card, Text, InlineStack, Box } from '@shopify/polaris';

interface MetricCardProps {
  title: string;
  value: string;
  trend?: React.ReactNode;
  className?: string;
}

export function MetricCard({ title, value, trend, className: _className }: MetricCardProps) {
  return (
    <Card>
      <Box padding="100">
        <InlineStack gap="100" align="space-between" blockAlign="start">
          <Box>
            <Text variant="bodySm" tone="subdued" as="p">
              {title}
            </Text>
            <Text variant="headingMd" as="h3">
              {value}
            </Text>
          </Box>
          {trend && <Box>{trend}</Box>}
        </InlineStack>
      </Box>
    </Card>
  );
}
