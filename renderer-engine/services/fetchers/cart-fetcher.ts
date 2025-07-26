import { logger } from '@/renderer-engine/lib/logger';
import { dataFetcher } from '@/renderer-engine/services/fetchers/data-fetcher';
import type {
  AddToCartRequest,
  Cart,
  CartContext,
  CartItem,
  CartRaw,
  CartResponse,
  UpdateCartRequest,
} from '@/renderer-engine/types';
import { cookiesClient } from '@/utils/server/AmplifyServer';

export class CartFetcher {
  /**
   * Obtiene el carrito actual para una tienda.
   * Siempre intentará obtener un carrito basado en el sessionId proporcionado.
   * Si no existe, creará un nuevo carrito de invitado.
   */
  public async getCart(storeId: string, sessionId: string): Promise<Cart> {
    logger.info(`[CartFetcher] getCart called with sessionId: ${sessionId}`, null, 'CartFetcher');

    try {
      let rawCartData: CartRaw | undefined;

      const guestCartResponse = await cookiesClient.models.Cart.listCartByStoreId(
        { storeId },
        { filter: { sessionId: { eq: sessionId }, userId: { attributeExists: false } } }
      );

      if (guestCartResponse.data && guestCartResponse.data.length > 0) {
        rawCartData = guestCartResponse.data[0];
      } else {
        rawCartData = undefined;
      }

      if (!rawCartData) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 días de expiración

        const newCartData: any = {
          storeId,
          itemCount: 0,
          totalAmount: 0,
          expiresAt: expiresAt.toISOString(),
          sessionId: sessionId,
        };

        const { data: createdCart } = await cookiesClient.models.Cart.create(newCartData);
        if (!createdCart) {
          throw new Error('Failed to create new cart.');
        }
        logger.info(`[CartFetcher] NEW Cart created with sessionId: ${createdCart.sessionId}`, null, 'CartFetcher');
        rawCartData = createdCart;
      }

      if (!rawCartData) {
        throw new Error('Cart could not be retrieved or created.');
      }

      const { data: items } = await cookiesClient.models.CartItem.listCartItemByCartId({ cartId: rawCartData.id });

      const cart: Cart = {
        ...rawCartData,
        items: items as CartItem[],
      };

      return cart;
    } catch (error) {
      logger.error('Error getting or creating cart', error, 'CartFetcher');
      throw new Error('Failed to retrieve or create cart.');
    }
  }

  /**
   * Agrega un producto al carrito o actualiza su cantidad si ya existe.
   */
  public async addToCart(request: AddToCartRequest): Promise<CartResponse> {
    try {
      const { storeId, productId, variantId, quantity = 1, sessionId } = request;

      const currentCart = await this.getCart(storeId, sessionId || '');
      if (!currentCart) {
        return { success: false, error: 'Cart not found or could not be created.' };
      }

      const product = await dataFetcher.getProduct(storeId, productId);
      if (!product) {
        return { success: false, error: 'Product not found.' };
      }

      const productPrice = product.price || 0;
      const productSnapshot = JSON.stringify({
        id: product.id,
        storeId: product.storeId,
        name: product.name,
        title: product.name,
        slug: product.slug,
        attributes: product.attributes,
        featured_image: product.featured_image,
        quantity: product.quantity,
        description: product.description,
        price: product.price,
        compare_at_price: product.compare_at_price,
        url: product.url,
        images: product.images,
        variants: product.variants,
        status: product.status,
        category: product.category,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      });

      // Buscar si el item ya existe en el carrito
      const cartItemsResponse = await cookiesClient.models.CartItem.listCartItemByCartId(
        { cartId: currentCart.id },
        { filter: { productId: { eq: productId }, variantId: { eq: variantId || undefined } } }
      );

      // Asegurarse de que data no es nulo/undefined antes de acceder a [0]
      let existingCartItem =
        cartItemsResponse.data && cartItemsResponse.data.length > 0 ? cartItemsResponse.data[0] : undefined;

      if (existingCartItem) {
        // Actualizar cantidad del item existente
        const updatedQuantity = existingCartItem.quantity + quantity;
        const updatedTotalPrice = updatedQuantity * existingCartItem.unitPrice;

        const { data: updatedItem } = await cookiesClient.models.CartItem.update({
          id: existingCartItem.id,
          quantity: updatedQuantity,
          totalPrice: updatedTotalPrice,
          owner: currentCart.sessionId || 'public',
        });
        if (!updatedItem) {
          throw new Error('Failed to update cart item.');
        }
      } else {
        // Crear nuevo item
        const newItemTotalPrice = productPrice * quantity;
        const { data: createdItem } = await cookiesClient.models.CartItem.create({
          cartId: currentCart.id,
          storeId: currentCart.storeId,
          productId: productId,
          variantId: variantId,
          quantity: quantity,
          unitPrice: productPrice,
          totalPrice: newItemTotalPrice,
          productSnapshot: productSnapshot,
          owner: currentCart.sessionId || 'public',
        });
        if (!createdItem) {
          throw new Error('Failed to create cart item.');
        }
      }

      // Recalcular y actualizar totales del carrito
      await this.recalculateCartTotals(currentCart.id);

      const updatedCart = await this.getCart(storeId, sessionId || '');
      return { success: true, cart: updatedCart };
    } catch (error) {
      logger.error('Error adding to cart', error, 'CartFetcher');
      return { success: false, error: 'Failed to add item to cart.' };
    }
  }

  /**
   * Actualiza la cantidad de un item en el carrito o lo elimina si la cantidad es <= 0.
   */
  public async updateCartItem(request: UpdateCartRequest): Promise<CartResponse> {
    try {
      const { storeId, itemId, quantity, sessionId } = request;

      const currentCart = await this.getCart(storeId, sessionId || '');
      if (!currentCart) {
        return { success: false, error: 'Cart not found.' };
      }

      const { data: existingItem } = await cookiesClient.models.CartItem.get({ id: itemId });

      if (!existingItem || existingItem.cartId !== currentCart.id) {
        return { success: false, error: 'Cart item not found in current cart.' };
      }

      if (quantity <= 0) {
        // Eliminar item si la cantidad es 0 o negativa
        await cookiesClient.models.CartItem.delete({ id: itemId });
      } else {
        // Actualizar item
        const updatedTotalPrice = existingItem.unitPrice * quantity;
        await cookiesClient.models.CartItem.update({
          id: itemId,
          quantity: quantity,
          totalPrice: updatedTotalPrice,
        });
      }

      // Recalcular y actualizar totales del carrito
      await this.recalculateCartTotals(currentCart.id);

      const updatedCart = await this.getCart(storeId, sessionId || '');
      return { success: true, cart: updatedCart };
    } catch (error) {
      logger.error('Error updating cart item', error, 'CartFetcher');
      return { success: false, error: 'Failed to update cart item.' };
    }
  }

  /**
   * Elimina un item del carrito.
   */
  public async removeFromCart(storeId: string, itemId: string, sessionId?: string): Promise<CartResponse> {
    try {
      const currentCart = await this.getCart(storeId, sessionId || '');
      if (!currentCart) {
        return { success: false, error: 'Cart not found.' };
      }

      const { data: existingItem } = await cookiesClient.models.CartItem.get({ id: itemId });

      if (!existingItem || existingItem.cartId !== currentCart.id) {
        return { success: false, error: 'Cart item not found in current cart.' };
      }

      await cookiesClient.models.CartItem.delete({ id: itemId });

      // Recalcular y actualizar totales del carrito
      await this.recalculateCartTotals(currentCart.id);

      const updatedCart = await this.getCart(storeId, sessionId || '');
      return { success: true, cart: updatedCart };
    } catch (error) {
      logger.error('Error removing from cart', error, 'CartFetcher');
      return { success: false, error: 'Failed to remove item from cart.' };
    }
  }

  /**
   * Limpia completamente el carrito (elimina todos los ítems).
   */
  public async clearCart(storeId: string, sessionId?: string): Promise<CartResponse> {
    try {
      const currentCart = await this.getCart(storeId, sessionId || '');
      if (!currentCart) {
        return { success: false, error: 'Cart not found.' };
      }

      // Obtener todos los ítems del carrito y eliminarlos
      const { data: cartItems } = await cookiesClient.models.CartItem.listCartItemByCartId({
        cartId: currentCart.id,
      });

      for (const item of cartItems) {
        await cookiesClient.models.CartItem.delete({ id: item.id });
      }

      // Resetear totales del carrito
      await cookiesClient.models.Cart.update({
        id: currentCart.id,
        itemCount: 0,
        totalAmount: 0,
      });

      const updatedCart = await this.getCart(storeId, sessionId || '');
      return { success: true, cart: updatedCart };
    } catch (error) {
      logger.error('Error clearing cart', error, 'CartFetcher');
      return { success: false, error: 'Failed to clear cart.' };
    }
  }

  /**
   * Transforma el carrito al formato para Liquid Context.
   */
  public transformCartToContext(cart: Cart): CartContext {
    const totalItems = Array.isArray(cart.items) ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;
    const totalPrice = Array.isArray(cart.items) ? cart.items.reduce((total, item) => total + item.totalPrice, 0) : 0;

    return {
      id: cart.id,
      item_count: totalItems,
      total_price: totalPrice,
      items: Array.isArray(cart.items)
        ? cart.items.map((item) => {
            let productSnapshotParsed: any = {};
            // Asegurarse de que productSnapshot sea un string antes de intentar parsear
            if (typeof item.productSnapshot === 'string') {
              try {
                productSnapshotParsed = JSON.parse(item.productSnapshot);
              } catch (e) {
                logger.error('Failed to parse productSnapshot for cart item', e, 'CartFetcher');
              }
            }

            return {
              id: item.id,
              product_id: item.productId,
              variant_id: item.variantId || '',
              title: productSnapshotParsed.name || 'N/A',
              price: item.unitPrice,
              quantity: item.quantity,
              line_price: item.totalPrice,
              image: productSnapshotParsed.images?.[0] || '',
              url: `/products/${productSnapshotParsed.slug || productSnapshotParsed.id}`,
            };
          })
        : [],
      created_at: cart.createdAt,
      updated_at: cart.updatedAt,
    };
  }

  /**
   * Recalcula los totales del carrito (cantidad de ítems y precio total).
   */
  private async recalculateCartTotals(cartId: string): Promise<void> {
    const { data: cartItems } = await cookiesClient.models.CartItem.listCartItemByCartId({ cartId });

    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const totalAmount = cartItems.reduce((total, item) => total + item.totalPrice, 0);

    await cookiesClient.models.Cart.update({
      id: cartId,
      itemCount: totalItems,
      totalAmount: totalAmount,
    });
  }
}

export const cartFetcher = new CartFetcher();
