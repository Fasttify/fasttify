import { useMemo } from 'react';
import type { IOrder } from '@/app/store/hooks/data/useOrders';
import {
  getOrderItems,
  getProductTitle,
  getProductImage,
  getItemQuantity,
  getItemUnitPrice,
  getItemTotalPrice,
  getProductSnapshot,
  formatCurrency,
  formatDate,
  getStatusText,
  getStatusTone,
  getPaymentStatusText,
  getPaymentStatusTone,
  getCustomerName,
  getCustomerEmail,
  getCustomerPhone,
} from '../utils/order-utils';

export interface ProcessedOrderItem {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productSnapshot: any;
  productUrl: string;
  sku?: string;
  formattedUnitPrice: string;
  formattedTotalPrice: string;
  formattedSavings?: string;
  hasDiscount: boolean;
  selectedAttributes: Record<string, any>;
  variantTitle?: string;
  handle?: string;
}

export interface ProcessedTimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: any;
  tone: string;
  show: boolean;
}

export interface ProcessedAddress {
  address1: string;
  address2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  countryName: string;
  formattedAddress: string;
}

export interface ProcessedCustomerData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerType: string;
  shipping?: ProcessedAddress | null;
  billing?: ProcessedAddress | null;
}

export interface ProcessedPricingData {
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  compareAtPrice: number;
  hasDiscount: boolean;
  discountAmount: number;
  savingsAmount: number;
  savingsPercentage: number;
  formattedSubtotal: string;
  formattedShippingCost: string;
  formattedTaxAmount: string;
  formattedTotalAmount: string;
  formattedCompareAtPrice: string;
  formattedSavingsAmount: string;
}

export interface ProcessedOrderData {
  // Datos básicos
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  customerId: string | null | undefined;
  createdAt: string;
  updatedAt: string;
  currency: string;
  paymentMethod: string;
  paymentId?: string | null;
  notes?: string | null;

  // Datos procesados
  items: ProcessedOrderItem[];
  timelineEvents: ProcessedTimelineEvent[];
  customerData: ProcessedCustomerData;
  pricingData: ProcessedPricingData;

  // Estados formateados
  statusText: string;
  statusTone: string;
  paymentStatusText: string;
  paymentStatusTone: string;
  formattedCreatedAt: string;
  formattedUpdatedAt: string;
  paymentMethodText: string;
}

export function useOrderDataPreprocessing(order: IOrder | null): ProcessedOrderData | null {
  return useMemo(() => {
    if (!order) return null;

    // Helper functions
    const getCountryName = (countryCode: string) => {
      const countries: Record<string, string> = {
        CO: 'Colombia',
        US: 'Estados Unidos',
        MX: 'México',
        ES: 'España',
        AR: 'Argentina',
        BR: 'Brasil',
        CL: 'Chile',
        PE: 'Perú',
        VE: 'Venezuela',
        EC: 'Ecuador',
        BO: 'Bolivia',
        PY: 'Paraguay',
        UY: 'Uruguay',
        GY: 'Guyana',
        SR: 'Surinam',
        GF: 'Guayana Francesa',
      };
      return countries[countryCode] || countryCode;
    };

    const parseAddress = (addressData: any): ProcessedAddress | null => {
      if (!addressData) return null;

      try {
        const address = typeof addressData === 'string' ? JSON.parse(addressData) : addressData;
        const countryName = getCountryName(address.country);
        const formattedAddress = `${address.address1}${address.address2 ? `, ${address.address2}` : ''}, ${address.city}, ${address.province} ${address.zip}`;

        return {
          ...address,
          countryName,
          formattedAddress,
        };
      } catch {
        return null;
      }
    };

    const getPaymentMethodText = (method: string | null | undefined) => {
      if (!method) return 'No especificado';

      const methodMap: Record<string, string> = {
        Manual: 'Pago Manual',
        CreditCard: 'Tarjeta de Crédito',
        DebitCard: 'Tarjeta de Débito',
        PayPal: 'PayPal',
        Stripe: 'Stripe',
        MercadoPago: 'MercadoPago',
        Cash: 'Efectivo',
        BankTransfer: 'Transferencia Bancaria',
      };

      return methodMap[method] || method;
    };

    // Procesar items
    const items = getOrderItems(order.items).map((item): ProcessedOrderItem => {
      const productTitle = getProductTitle(item);
      const productImage = getProductImage(item);
      const quantity = getItemQuantity(item);
      const unitPrice = getItemUnitPrice(item);
      const totalPrice = getItemTotalPrice(item);
      const productSnapshot = getProductSnapshot(item);

      const hasDiscount = productSnapshot?.compareAtPrice && productSnapshot.compareAtPrice > unitPrice;
      const savingsAmount = hasDiscount ? (productSnapshot.compareAtPrice - unitPrice) * quantity : 0;

      return {
        id: item.id,
        productId: item.productId,
        productTitle,
        productImage,
        quantity,
        unitPrice,
        totalPrice,
        productSnapshot,
        productUrl: `/store/${order.storeId}/products/${item.productId}`,
        sku: item.sku,
        formattedUnitPrice: formatCurrency(unitPrice ?? 0, order.currency ?? 'COP'),
        formattedTotalPrice: formatCurrency(totalPrice ?? 0, order.currency ?? 'COP'),
        formattedSavings: hasDiscount ? formatCurrency(savingsAmount, order.currency ?? 'COP') : undefined,
        hasDiscount: !!hasDiscount,
        selectedAttributes: productSnapshot?.selectedAttributes || {},
        variantTitle: productSnapshot?.variantTitle,
        handle: productSnapshot?.handle,
      };
    });

    // Procesar timeline events
    const timelineEvents: ProcessedTimelineEvent[] = [
      {
        id: 'created',
        title: 'Orden Creada',
        description: 'La orden fue creada exitosamente',
        date: order.createdAt,
        icon: 'PageClockFilledIcon',
        tone: 'info',
        show: true,
      },
      {
        id: 'customer',
        title: 'Cliente Registrado',
        description: `Cliente ${order.customerType === 'guest' ? 'invitado' : 'registrado'} agregado`,
        date: order.createdAt,
        icon: 'PageClockFilledIcon',
        tone: 'info',
        show: true,
      },
      {
        id: 'payment_method',
        title: 'Método de Pago Seleccionado',
        description: `Método: ${order.paymentMethod || 'No especificado'}`,
        date: order.createdAt,
        icon: 'CreditCardIcon',
        tone: 'info',
        show: true,
      },
      {
        id: 'shipping_address',
        title: 'Dirección de Envío Configurada',
        description: 'Dirección de envío configurada para la orden',
        date: order.createdAt,
        icon: 'LocationIcon',
        tone: 'info',
        show: true,
      },
      {
        id: 'updated',
        title: 'Última Actualización',
        description: 'La orden fue modificada por última vez',
        date: order.updatedAt,
        icon: 'PageClockFilledIcon',
        tone: 'info',
        show: !!order.updatedAt && order.updatedAt !== order.createdAt,
      },
      {
        id: 'status',
        title: `Estado: ${order.status}`,
        description: `La orden está actualmente ${order.status}`,
        date: order.updatedAt || order.createdAt,
        icon: 'InfoIcon',
        tone: getStatusTone(order.status || ''),
        show: true,
      },
      {
        id: 'payment_status',
        title: `Estado del Pago: ${order.paymentStatus}`,
        description: `El pago está ${order.paymentStatus}`,
        date: order.updatedAt || order.createdAt,
        icon: 'CreditCardIcon',
        tone: getPaymentStatusTone(order.paymentStatus || ''),
        show: true,
      },
    ].filter((event) => event.show);

    // Procesar datos del cliente
    const customerData: ProcessedCustomerData = {
      customerName: getCustomerName(order.customerInfo),
      customerEmail: getCustomerEmail(order.customerInfo),
      customerPhone: getCustomerPhone(order.customerInfo),
      customerType: order.customerType === 'guest' ? 'Cliente Invitado' : 'Cliente Registrado',
      shipping: parseAddress(order.shippingAddress),
      billing: parseAddress(order.billingAddress),
    };

    // Procesar datos de precios
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

    const pricingData: ProcessedPricingData = {
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
      formattedSubtotal: formatCurrency(Number(subtotal) || 0, currency || 'COP'),
      formattedShippingCost: formatCurrency(Number(shippingCost) || 0, currency || 'COP'),
      formattedTaxAmount: formatCurrency(Number(taxAmount) || 0, currency || 'COP'),
      formattedTotalAmount: formatCurrency(Number(totalAmount) || 0, currency || 'COP'),
      formattedCompareAtPrice: formatCurrency(Number(compareAtPrice) || 0, currency || 'COP'),
      formattedSavingsAmount: formatCurrency(Number(savingsAmount) || 0, currency || 'COP'),
    };

    return {
      // Datos básicos
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

      // Datos procesados
      items,
      timelineEvents,
      customerData,
      pricingData,

      // Estados formateados
      statusText: getStatusText(order.status || ''),
      statusTone: getStatusTone(order.status || ''),
      paymentStatusText: getPaymentStatusText(order.paymentStatus || ''),
      paymentStatusTone: getPaymentStatusTone(order.paymentStatus || ''),
      formattedCreatedAt: formatDate(order.createdAt),
      formattedUpdatedAt: formatDate(order.updatedAt),
      paymentMethodText: getPaymentMethodText(order.paymentMethod),
    };
  }, [order]);
}
