import { Text } from '@shopify/polaris';
import { useOrderFormatting } from '@/app/store/hooks/format/useOrderFormatting';
import type { IOrder } from '@/app/store/hooks/data/useOrders';

interface OrderTotalCellProps {
  order: IOrder;
}

export function OrderTotalCell({ order }: OrderTotalCellProps) {
  const { formatMoney } = useOrderFormatting(order.currency || undefined);

  return (
    <>
      <Text variant="bodySm" fontWeight="semibold" as="span">
        {formatMoney(order.totalAmount ?? 0)}
      </Text>
      <div style={{ marginTop: '2px' }}>
        <Text variant="bodySm" tone="subdued" as="span">
          {formatMoney(order.subtotal ?? 0)} + envío
        </Text>
      </div>
    </>
  );
}
