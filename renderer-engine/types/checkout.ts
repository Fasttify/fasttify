export interface CustomerInfo {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface Address {
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
}

export interface StartCheckoutRequest {
  storeId: string;
  cartId?: string;
  sessionId: string;
  customerInfo?: CustomerInfo;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
}

export interface CheckoutSession {
  token: string;
  storeId: string;
  cartId?: string;
  sessionId: string;
  status: 'open' | 'completed' | 'expired' | 'cancelled';
  expiresAt: string;
  currency: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  itemsSnapshot?: CartSnapshot;
  customerInfo?: CustomerInfo;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
  storeOwner: string;
}

export interface CartSnapshot {
  items: any[];
  itemCount: number;
  cartTotal: number;
  snapshotAt: string;
}

export interface CheckoutResponse {
  success: boolean;
  session?: CheckoutSession;
  error?: string;
}

export interface CheckoutContext {
  token: string;
  line_items: any[];
  item_count: number;
  total_price: number;
  subtotal_price: number;
  shipping_price: number;
  tax_price: number;
  currency: string;
  customer: CustomerInfo;
  shipping_address: Address;
  billing_address: Address;
  note?: string;
  requires_shipping: boolean;
  expires_at: string;
}

export type CheckoutStatus = 'open' | 'completed' | 'expired' | 'cancelled';

export interface UpdateCustomerInfoRequest {
  token: string;
  customerInfo?: CustomerInfo;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
}
