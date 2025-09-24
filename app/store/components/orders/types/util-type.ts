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
