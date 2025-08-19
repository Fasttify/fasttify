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

import type { Schema } from '@/amplify/data/resource';

export type Cart = Omit<Schema['Cart']['type'], 'items'> & {
  items: CartItem[];
};
export type CartItem = Schema['CartItem']['type'];
export type CartRaw = Schema['Cart']['type'];

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

export interface CartItemContext {
  id: string;
  product_id: string;
  variant_id: string;
  title: string;
  variant_title?: string;
  price: number;
  quantity: number;
  line_price: number;
  image?: string;
  url?: string;
  attributes?: any[];
  selectedAttributes?: Record<string, string>;
}

export interface CartContext {
  id: string;
  token?: string;
  item_count: number;
  total_price: number;
  items: CartItemContext[];
  created_at?: string;
  updated_at?: string;
  currency?: string;
  requires_shipping?: boolean;
  cart_level_discount_applications?: any[];
  original_total_price?: number;
  original_total_duties?: number;
  total_discount?: number;
  total_line_items_price?: number;
}

export interface CartResponse {
  success: boolean;
  cart?: Cart;
  error?: string;
  item?: CartItemContext;
}
