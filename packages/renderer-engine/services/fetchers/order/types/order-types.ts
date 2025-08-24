/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface CreateOrderRequest {
  checkoutSession: any; // CheckoutSession type
  paymentMethod?: string;
  paymentId?: string;
  customerEmail?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order?: any; // Order type
  error?: string;
}

export interface OrderItemData {
  orderId: string;
  storeId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productSnapshot: string;
  compareAtPrice?: number | null;
  storeOwner: string;
}

export interface ProductSnapshotData {
  id: string;
  title: string;
  variantTitle?: string | null;
  price: number;
  image?: string | null;
  handle?: string | null;
  variantHandle?: string | null;
  compareAtPrice?: number | null;
  attributes: any[];
  selectedAttributes: Record<string, string>;
  snapshotAt: string;
}

export interface OrderValidationResult {
  isValid: boolean;
  errors: string[];
}
