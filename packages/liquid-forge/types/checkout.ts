/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  createdAt?: string;
  updatedAt?: string;
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
  order?: any;
  warning?: string;
  error?: string;
}

export interface CheckoutContext {
  storeId: string;
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
  created_at?: string;
  updated_at?: string;
  status?: string;
  session_id?: string;
  cart_id?: string;
  totals?: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
}

export type CheckoutStatus = 'open' | 'completed' | 'expired' | 'cancelled';

export interface UpdateCustomerInfoRequest {
  token: string;
  customerInfo?: CustomerInfo;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
}
