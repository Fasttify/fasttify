import { Card, Text, Box } from '@shopify/polaris';

interface NoDataCardProps {
  title: string;
  message?: string;
  className?: string;
}

export function NoDataCard({
  title,
  message = 'No hay datos para este rango de fechas',
  className: _className,
}: NoDataCardProps) {
  return (
    <Card>
      <Box padding="400">
        <Text variant="headingMd" as="h3">
          {title}
        </Text>
        <Box paddingBlockStart="400" minHeight="200px">
          <Text variant="bodyLg" tone="subdued" as="p">
            {message}
          </Text>
        </Box>
      </Box>
    </Card>
  );
}
