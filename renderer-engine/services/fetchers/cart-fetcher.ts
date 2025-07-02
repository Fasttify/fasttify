import { logger } from '@/renderer-engine/lib/logger';
import { productFetcher } from '@/renderer-engine/services/fetchers/product-fetcher';
import type {
  AddToCartRequest,
  Cart,
  CartContext,
  CartItem,
  CartResponse,
  UpdateCartRequest,
} from '@/renderer-engine/types';

interface CartStorageOptions {
  expirationDays?: number;
}

export class CartFetcher {
  private readonly CART_STORAGE_KEY = 'fasttify_cart';
  private readonly DEFAULT_EXPIRATION_DAYS = 30;

  /**
   * Obtiene el carrito actual para una tienda
   */
  public async getCart(storeId: string): Promise<Cart> {
    try {
      // Para invitados, usar localStorage
      const existingCart = this.getCartFromStorage(storeId);

      if (existingCart && !this.isCartExpired(existingCart)) {
        return existingCart;
      }

      // Crear nuevo carrito si no existe o está expirado
      return this.createNewCart(storeId);
    } catch (error) {
      logger.error('Error getting cart', error, 'CartFetcher');
      return this.createNewCart(storeId);
    }
  }

  /**
   * Agrega un producto al carrito
   */
  public async addToCart(request: AddToCartRequest): Promise<CartResponse> {
    try {
      const { storeId, productId, variantId, quantity = 1, properties = {} } = request;

      // Obtener información del producto
      const product = await productFetcher.getProduct(storeId, productId);
      if (!product) {
        return {
          success: false,
          error: 'Product not found',
          cart: await this.getCart(storeId),
        };
      }

      // Obtener carrito actual
      const cart = await this.getCart(storeId);

      // Verificar si el producto ya existe en el carrito
      const existingItemIndex = cart.items.findIndex(
        (item) =>
          item.productId === productId &&
          item.variantId === variantId &&
          JSON.stringify(item.properties) === JSON.stringify(properties)
      );

      if (existingItemIndex >= 0) {
        // Actualizar cantidad del item existente
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].linePrice =
          cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].price;
      } else {
        // Crear nuevo item
        const productPrice = parseInt(product.price) || 0;
        const newItem: CartItem = {
          id: this.generateCartItemId(),
          productId,
          variantId,
          title: product.title,
          price: productPrice,
          quantity,
          linePrice: productPrice * quantity,
          image: product.featured_image,
          url: product.url,
          properties,
        };
        cart.items.push(newItem);
      }

      // Recalcular totales
      this.recalculateCartTotals(cart);

      // Guardar carrito
      this.saveCartToStorage(cart);

      return {
        success: true,
        cart,
        item: cart.items.find((item) => item.productId === productId),
      };
    } catch (error) {
      logger.error('Error adding to cart', error, 'CartFetcher');
      return {
        success: false,
        error: 'Failed to add item to cart',
        cart: await this.getCart(request.storeId),
      };
    }
  }

  /**
   * Actualiza un item del carrito
   */
  public async updateCartItem(request: UpdateCartRequest): Promise<CartResponse> {
    try {
      const { storeId, itemId, quantity, properties } = request;

      const cart = await this.getCart(storeId);
      const itemIndex = cart.items.findIndex((item) => item.id === itemId);

      if (itemIndex === -1) {
        return {
          success: false,
          error: 'Cart item not found',
          cart,
        };
      }

      if (quantity <= 0) {
        // Eliminar item si quantity es 0 o negativo
        cart.items.splice(itemIndex, 1);
      } else {
        // Actualizar item
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].linePrice = cart.items[itemIndex].price * quantity;

        if (properties) {
          cart.items[itemIndex].properties = properties;
        }
      }

      // Recalcular totales
      this.recalculateCartTotals(cart);

      // Guardar carrito
      this.saveCartToStorage(cart);

      return {
        success: true,
        cart,
        item: quantity > 0 ? cart.items[itemIndex] : undefined,
      };
    } catch (error) {
      logger.error('Error updating cart item', error, 'CartFetcher');
      return {
        success: false,
        error: 'Failed to update cart item',
        cart: await this.getCart(request.storeId),
      };
    }
  }

  /**
   * Elimina un item del carrito
   */
  public async removeFromCart(storeId: string, itemId: string): Promise<CartResponse> {
    try {
      const cart = await this.getCart(storeId);
      const itemIndex = cart.items.findIndex((item) => item.id === itemId);

      if (itemIndex === -1) {
        return {
          success: false,
          error: 'Cart item not found',
          cart,
        };
      }

      // Eliminar item
      cart.items.splice(itemIndex, 1);

      // Recalcular totales
      this.recalculateCartTotals(cart);

      // Guardar carrito
      this.saveCartToStorage(cart);

      return {
        success: true,
        cart,
      };
    } catch (error) {
      logger.error('Error removing from cart', error, 'CartFetcher');
      return {
        success: false,
        error: 'Failed to remove item from cart',
        cart: await this.getCart(storeId),
      };
    }
  }

  /**
   * Limpia completamente el carrito
   */
  public async clearCart(storeId: string): Promise<CartResponse> {
    try {
      const cart = this.createNewCart(storeId);
      this.saveCartToStorage(cart);

      return {
        success: true,
        cart,
      };
    } catch (error) {
      logger.error('Error clearing cart', error, 'CartFetcher');
      return {
        success: false,
        error: 'Failed to clear cart',
        cart: await this.getCart(storeId),
      };
    }
  }

  /**
   * Transforma el carrito al formato para Liquid Context
   */
  public transformCartToContext(cart: Cart): CartContext {
    return {
      id: cart.id,
      item_count: cart.totalItems,
      total_price: cart.totalPrice,
      items: cart.items.map((item) => ({
        id: item.id,
        product_id: item.productId,
        variant_id: item.variantId || '',
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        line_price: item.linePrice,
        image: item.image || '',
        url: item.url,
        properties: item.properties || {},
      })),
      created_at: cart.createdAt,
      updated_at: cart.updatedAt,
    };
  }

  /**
   * Crea un nuevo carrito vacío
   */
  private createNewCart(storeId: string, options: CartStorageOptions = {}): Cart {
    const now = new Date().toISOString();
    const expirationDays = options.expirationDays || this.DEFAULT_EXPIRATION_DAYS;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    return {
      id: this.generateCartId(),
      storeId,
      items: [],
      totalItems: 0,
      totalPrice: 0,
      createdAt: now,
      updatedAt: now,
      expiresAt: expiresAt.toISOString(),
    };
  }

  /**
   * Obtiene el carrito desde localStorage
   */
  private getCartFromStorage(storeId: string): Cart | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(`${this.CART_STORAGE_KEY}_${storeId}`);
      if (!stored) return null;

      const cart: Cart = JSON.parse(stored);
      return cart.storeId === storeId ? cart : null;
    } catch (error) {
      logger.error('Error reading cart from storage', error, 'CartFetcher');
      return null;
    }
  }

  /**
   * Guarda el carrito en localStorage
   */
  private saveCartToStorage(cart: Cart): void {
    if (typeof window === 'undefined') return;

    try {
      cart.updatedAt = new Date().toISOString();
      localStorage.setItem(`${this.CART_STORAGE_KEY}_${cart.storeId}`, JSON.stringify(cart));
    } catch (error) {
      logger.error('Error saving cart to storage', error, 'CartFetcher');
    }
  }

  /**
   * Verifica si el carrito ha expirado
   */
  private isCartExpired(cart: Cart): boolean {
    if (!cart.expiresAt) return false;
    return new Date() > new Date(cart.expiresAt);
  }

  /**
   * Recalcula los totales del carrito
   */
  private recalculateCartTotals(cart: Cart): void {
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + item.linePrice, 0);
  }

  /**
   * Genera un ID único para el carrito
   */
  private generateCartId(): string {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Genera un ID único para un item del carrito
   */
  private generateCartItemId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Limpia carritos expirados del localStorage
   */
  public cleanupExpiredCarts(): void {
    if (typeof window === 'undefined') return;

    try {
      const keys = Object.keys(localStorage);
      const cartKeys = keys.filter((key) => key.startsWith(this.CART_STORAGE_KEY));

      cartKeys.forEach((key) => {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const cart: Cart = JSON.parse(stored);
            if (this.isCartExpired(cart)) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Si hay error parseando, eliminar la key corrupta
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      logger.error('Error cleaning up expired carts', error, 'CartFetcher');
    }
  }
}

export const cartFetcher = new CartFetcher();
