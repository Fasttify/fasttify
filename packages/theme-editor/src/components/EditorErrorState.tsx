import { Button, Card, Text, InlineStack, BlockStack, Icon } from '@shopify/polaris';
import { AlertTriangleIcon, RefreshIcon } from '@shopify/polaris-icons';

interface EditorErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const EditorErrorState = ({ error, onRetry }: EditorErrorStateProps) => {
  return (
    <div className="flex items-center justify-center h-screen w-full p-4">
      <Card>
        <div className="p-6">
          <BlockStack gap="400" align="center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50">
              <Icon source={AlertTriangleIcon} tone="critical" />
            </div>

            <BlockStack gap="200" align="center">
              <Text as="h2" variant="headingMd" fontWeight="semibold" tone="critical">
                Error al cargar el editor
              </Text>

              <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                {error}
              </Text>
            </BlockStack>

            <InlineStack gap="200">
              <Button variant="primary" icon={RefreshIcon} onClick={onRetry}>
                Reintentar
              </Button>

              <Button variant="secondary" onClick={() => window.location.reload()}>
                Recargar página
              </Button>
            </InlineStack>
          </BlockStack>
        </div>
      </Card>
    </div>
  );
};
