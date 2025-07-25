import type { Schema } from '@/amplify/data/resource';

export type Cart = Schema['Cart']['type'] & {
  items: Schema['CartItem']['type'][];
};
export type CartItem = Schema['CartItem']['type'];

export interface AddToCartRequest {
  storeId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  properties?: Record<string, any>;
}

export interface UpdateCartRequest {
  storeId: string;
  itemId: string;
  quantity: number;
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
  properties: Record<string, any>;
}

export interface CartContext {
  id: string;
  token: string;
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
