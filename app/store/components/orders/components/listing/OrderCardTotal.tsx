import { Text, Box } from '@shopify/polaris';
import { useOrderFormatting } from '@/app/store/hooks/format/useOrderFormatting';
import type { IOrder } from '@/app/store/hooks/data/useOrders';

interface OrderCardTotalProps {
  order: IOrder;
}

export function OrderCardTotal({ order }: OrderCardTotalProps) {
  const { formatMoney } = useOrderFormatting(order.currency || undefined);

  return (
    <Box>
      <Text variant="bodySm" tone="subdued" as="p">
        Total
      </Text>
      <Text variant="bodyMd" as="p">
        {formatMoney(order.totalAmount ?? 0)}
      </Text>
    </Box>
  );
}
