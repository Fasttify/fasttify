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

export interface AddToCartRequest {
  storeId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  sessionId?: string;
  selectedAttributes?: Record<string, string>;
}

export interface UpdateCartRequest {
  storeId: string;
  itemId: string;
  quantity: number;
  sessionId?: string;
}

export interface CartResponse {
  success: boolean;
  cart?: any;
  error?: string;
}

export interface UserStoreCurrency {
  storeCurrency?: string;
}

export interface TransformedCartItem {
  id: string;
  cartId: string;
  storeId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productSnapshot: string;
  owner: string;
  createdAt?: string;
  updatedAt?: string;
  // Campos transformados del productSnapshot
  attributes: any[];
  selectedAttributes: Record<string, string>;
  title: string;
  price: number;
  image?: string;
  url?: string;
  variant_title?: string;
}
