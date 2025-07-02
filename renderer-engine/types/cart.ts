export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  price: number;
  quantity: number;
  linePrice: number;
  image?: string;
  url: string;
  properties?: Record<string, any>;
}

export interface Cart {
  id: string;
  storeId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface CartContext {
  id: string;
  item_count: number;
  total_price: number;
  items: Array<{
    id: string;
    product_id: string;
    variant_id: string;
    title: string;
    price: number;
    quantity: number;
    line_price: number;
    image: string;
    url: string;
    properties: Record<string, any>;
  }>;
  created_at: string;
  updated_at: string;
}

export interface AddToCartRequest {
  storeId: string;
  productId: string;
  variantId?: string;
  quantity?: number;
  properties?: Record<string, any>;
}

export interface UpdateCartRequest {
  storeId: string;
  itemId: string;
  quantity: number;
  properties?: Record<string, any>;
}

export interface CartResponse {
  success: boolean;
  cart: Cart;
  error?: string;
  item?: CartItem;
}
