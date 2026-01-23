import { ProgressBar, BlockStack, Text } from '@shopify/polaris';

interface UploadProgressProps {
  overallPercent: number;
  total: number;
  completed: number;
  failed: number;
}

export default function UploadProgress({ overallPercent, total, completed, failed }: UploadProgressProps) {
  return (
    <BlockStack gap="200">
      <Text as="p" variant="bodySm">
        Subiendo {completed} de {total} archivos
        {failed > 0 && ` • ${failed} fallidos`}
      </Text>
      <ProgressBar progress={overallPercent} size="small" />
    </BlockStack>
  );
}
