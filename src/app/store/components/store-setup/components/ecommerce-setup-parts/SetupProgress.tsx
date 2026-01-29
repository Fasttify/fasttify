import { Box, InlineStack, ProgressBar, Text } from '@shopify/polaris';

interface SetupProgressProps {
  completedTasks: number;
  totalTasks: number;
}

export function SetupProgress({ completedTasks, totalTasks }: SetupProgressProps) {
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Box padding="400" borderBlockEndWidth="025" borderColor="border" borderRadius="200" background="bg-surface">
      <Box paddingBlockEnd="150">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="p" variant="bodySm" tone="subdued">
            {completedTasks} de {totalTasks} pasos completados
          </Text>
          <Text as="p" variant="bodySm" tone="subdued" numeric>
            {progress}%
          </Text>
        </InlineStack>
      </Box>
      <ProgressBar progress={progress} size="small" />
    </Box>
  );
}
