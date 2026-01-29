import { Button, InlineStack } from '@shopify/polaris';

interface DateRangeActionsProps {
  loading?: boolean;
  onApply: () => void;
  onCancel: () => void;
}

export function DateRangeActions({ loading = false, onApply, onCancel }: DateRangeActionsProps) {
  return (
    <InlineStack align="end" gap="200">
      <Button onClick={onCancel} disabled={loading}>
        Cancelar
      </Button>
      <Button variant="primary" onClick={onApply} loading={loading} disabled={loading}>
        Aplicar
      </Button>
    </InlineStack>
  );
}
