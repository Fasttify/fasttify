import { useMemo } from 'react';
import type { IOrder } from '@/app/store/hooks/data/useOrders';
import { routes } from '@/utils/client/routes';
import {
  getOrderItems,
  getProductTitle,
  getProductImage,
  getItemQuantity,
  getItemUnitPrice,
  getItemTotalPrice,
  getProductSnapshot,
  formatDate,
  getStatusText,
  getStatusTone,
  getPaymentStatusText,
  getPaymentStatusTone,
  getCustomerName,
  getCustomerEmail,
  getCustomerPhone,
} from '@/app/store/components/orders/utils/order-utils';
import { processTimeline } from '@/app/store/components/orders/utils/process-timeline';
import { getCountryName } from '@/app/store/components/orders/utils/country-name';
import { getPaymentMethodText } from '@/app/store/components/orders/utils/payment-method';
import { useOrderFormatting } from '@/app/store/hooks/format/useOrderFormatting';
import type {
  ProcessedAddress,
  ProcessedCustomerData,
  ProcessedPricingData,
  ProcessedOrderData,
  ProcessedOrderItem,
} from '@/app/store/components/orders/types/util-type';

function parseAddress(addressData: any): ProcessedAddress | null {
  if (!addressData) return null;
  try {
    const address = typeof addressData === 'string' ? JSON.parse(addressData) : addressData;
    const countryName = getCountryName(address.country);
    const formattedAddress = `${address.address1}${address.address2 ? `, ${address.address2}` : ''}, ${address.city}, ${address.province} ${address.zip}`;
    return { ...address, countryName, formattedAddress };
  } catch {
    return null;
  }
}

function processItems(
  order: IOrder,
  formatOrderItemAmounts: ReturnType<typeof useOrderFormatting>['formatOrderItemAmounts']
): ProcessedOrderItem[] {
  return getOrderItems(order.items).map((item): ProcessedOrderItem => {
    const productTitle = getProductTitle(item);
    const productImage = getProductImage(item);
    const quantity = getItemQuantity(item);
    const unitPrice = getItemUnitPrice(item);
    const totalPrice = getItemTotalPrice(item);
    const productSnapshot = getProductSnapshot(item);
    const hasDiscount = productSnapshot?.compareAtPrice && productSnapshot.compareAtPrice > unitPrice;

    const { formattedUnitPrice, formattedTotalPrice, formattedSavings, formattedCompareAtPrice } =
      formatOrderItemAmounts({
        unitPrice: unitPrice ?? 0,
        totalPrice: totalPrice ?? 0,
        compareAtPrice: productSnapshot?.compareAtPrice ?? 0,
        quantity: quantity ?? 0,
      });

    return {
      id: item.id,
      productId: item.productId,
      productTitle,
      productImage,
      quantity,
      unitPrice,
      totalPrice,
      productSnapshot,
      productUrl: routes.store.products.edit(order.storeId, item.productId),
      sku: item.sku,
      formattedUnitPrice,
      formattedTotalPrice,
      formattedSavings,
      formattedCompareAtPrice,
      hasDiscount: !!hasDiscount,
      selectedAttributes: productSnapshot?.selectedAttributes || {},
      variantTitle: productSnapshot?.variantTitle,
      handle: productSnapshot?.handle,
    };
  });
}

function processCustomerData(order: IOrder): ProcessedCustomerData {
  return {
    customerName: getCustomerName(order.customerInfo),
    customerEmail: getCustomerEmail(order.customerInfo),
    customerPhone: getCustomerPhone(order.customerInfo),
    customerType: order.customerType === 'guest' ? 'Cliente Invitado' : 'Cliente Registrado',
    shipping: parseAddress(order.shippingAddress),
    billing: parseAddress(order.billingAddress),
  };
}

function processPricingData(
  order: IOrder,
  formatOrderAmounts: ReturnType<typeof useOrderFormatting>['formatOrderAmounts']
): ProcessedPricingData {
  const {
    subtotal = 0,
    shippingCost = 0,
    taxAmount = 0,
    totalAmount = 0,
    currency = 'COP',
    compareAtPrice = 0,
  } = order;
  const hasDiscount = (compareAtPrice ?? 0) > 0 && (compareAtPrice ?? 0) > (subtotal ?? 0);
  const discountAmount = hasDiscount ? (compareAtPrice ?? 0) - (subtotal ?? 0) : 0;
  const savingsAmount = hasDiscount ? discountAmount : 0;
  const savingsPercentage =
    hasDiscount && (compareAtPrice ?? 0) > 0 ? Math.round((savingsAmount / (compareAtPrice ?? 1)) * 100) : 0;

  const {
    formattedSubtotal,
    formattedShippingCost,
    formattedTaxAmount,
    formattedTotalAmount,
    formattedCompareAtPrice,
    formattedSavingsAmount,
  } = formatOrderAmounts({
    subtotal: Number(subtotal) || 0,
    shippingCost: Number(shippingCost) || 0,
    taxAmount: Number(taxAmount) || 0,
    totalAmount: Number(totalAmount) || 0,
    compareAtPrice: Number(compareAtPrice) || 0,
    savingsAmount: Number(savingsAmount) || 0,
  });

  return {
    subtotal: Number(subtotal) || 0,
    shippingCost: Number(shippingCost) || 0,
    taxAmount: Number(taxAmount) || 0,
    totalAmount: Number(totalAmount) || 0,
    currency: currency || 'COP',
    compareAtPrice: Number(compareAtPrice) || 0,
    hasDiscount,
    discountAmount,
    savingsAmount,
    savingsPercentage,
    formattedSubtotal,
    formattedShippingCost,
    formattedTaxAmount,
    formattedTotalAmount,
    formattedCompareAtPrice,
    formattedSavingsAmount,
  };
}

export function useOrderDataPreprocessing(order: IOrder | null): ProcessedOrderData | null {
  const { formatOrderAmounts, formatOrderItemAmounts } = useOrderFormatting(order?.currency || undefined);

  return useMemo(() => {
    if (!order) return null;

    const items = processItems(order, formatOrderItemAmounts);
    const timelineEvents = processTimeline(order);
    const customerData = processCustomerData(order);
    const pricingData = processPricingData(order, formatOrderAmounts);

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status || '',
      paymentStatus: order.paymentStatus || '',
      customerId: order.customerId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      currency: order.currency || 'COP',
      paymentMethod: order.paymentMethod || '',
      paymentId: order.paymentId,
      notes: order.notes,
      items,
      timelineEvents,
      customerData,
      pricingData,
      statusText: getStatusText(order.status || ''),
      statusTone: getStatusTone(order.status || ''),
      paymentStatusText: getPaymentStatusText(order.paymentStatus || ''),
      paymentStatusTone: getPaymentStatusTone(order.paymentStatus || ''),
      formattedCreatedAt: formatDate(order.createdAt),
      formattedUpdatedAt: formatDate(order.updatedAt),
      paymentMethodText: getPaymentMethodText(order.paymentMethod),
    };
  }, [order, formatOrderAmounts, formatOrderItemAmounts]);
}
