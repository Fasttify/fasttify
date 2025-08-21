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

export interface UserStoreCurrency {
  storeCurrency?: string;
}

export interface CheckoutSessionData {
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
  itemsSnapshot: string;
  customerInfo?: string | null;
  shippingAddress?: string | null;
  billingAddress?: string | null;
  notes?: string;
  storeOwner: string;
}

export interface CheckoutTotals {
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
}

export interface CheckoutItemSnapshot {
  id: string;
  product_id: string;
  variant_id?: string;
  title: string;
  price: number;
  unitPrice: number;
  quantity: number;
  image?: string;
  url?: string;
  variant_title?: string;
  attributes: any[];
  selectedAttributes: Record<string, string>;
}
