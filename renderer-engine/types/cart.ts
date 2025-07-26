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
