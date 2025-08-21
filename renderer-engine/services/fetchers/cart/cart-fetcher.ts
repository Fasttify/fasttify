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

import { logger } from '@/renderer-engine/lib/logger';
import { dataFetcher } from '@/renderer-engine/services/fetchers/data-fetcher';
import type { Cart, CartRaw } from '@/renderer-engine/types';
import { cookiesClient } from '@/utils/server/AmplifyServer';
import { cartContextTransformer } from './cart-context-transformer';
import { cartItemTransformer } from './cart-item-transformer';
import { cartTotalsCalculator } from './cart-totals-calculator';
import type { AddToCartRequest, CartResponse, UpdateCartRequest, UserStoreCurrency } from './types/cart-types';

export class CartFetcher {
  /**
   * Obtiene el carrito actual para una tienda.
   * Siempre intentará obtener un carrito basado en el sessionId proporcionado.
   * Si no existe, creará un nuevo carrito de invitado.
   */
  public async getCart(storeId: string, sessionId: string): Promise<Cart> {
    try {
      let rawCartData: CartRaw | undefined;

      const guestCartResponse = await cookiesClient.models.Cart.listCartByStoreId(
        { storeId },
        { filter: { sessionId: { eq: sessionId } } }
      );

      if (guestCartResponse.data && guestCartResponse.data.length > 0) {
        rawCartData = guestCartResponse.data[0];
      }

      if (!rawCartData) {
        rawCartData = await this.createNewCart(storeId, sessionId);
      }

      if (!rawCartData) {
        throw new Error('Cart could not be retrieved or created.');
      }

      const { data: items } = await cookiesClient.models.CartItem.listCartItemByCartId({ cartId: rawCartData.id });

      // Transformar los items para incluir los atributos del productSnapshot
      const transformedItems = cartItemTransformer.transformCartItems(items);

      const cart: Cart = {
        ...rawCartData,
        items: transformedItems,
      } as unknown as Cart;

      return cart;
    } catch (error) {
      logger.error('Error getting or creating cart', error, 'CartFetcher');
      throw new Error('Failed to retrieve or create cart.');
    }
  }

  /**
   * Crea un nuevo carrito
   */
  private async createNewCart(storeId: string, sessionId: string): Promise<CartRaw | undefined> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    let detectedCurrency: string | undefined;
    try {
      const { data: store } = await cookiesClient.models.UserStore.get({ storeId });
      detectedCurrency = (store as UserStoreCurrency)?.storeCurrency || undefined;
    } catch {}

    const newCartData: any = {
      storeId,
      itemCount: 0,
      totalAmount: 0,
      expiresAt: expiresAt.toISOString(),
      sessionId: sessionId,
      currency: detectedCurrency,
    };

    const { data: createdCart } = await cookiesClient.models.Cart.create(newCartData);
    return createdCart || undefined;
  }

  /**
   * Agrega un producto al carrito o actualiza su cantidad si ya existe.
   */
  public async addToCart(request: AddToCartRequest): Promise<CartResponse> {
    try {
      const { storeId, productId, variantId, quantity = 1, sessionId, selectedAttributes } = request;

      const currentCart = await this.getCart(storeId, sessionId || '');
      if (!currentCart) {
        return { success: false, error: 'Cart not found or could not be created.' };
      }

      const product = await dataFetcher.getProduct(storeId, productId);
      if (!product) {
        return { success: false, error: 'Product not found.' };
      }

      const productSnapshot = cartItemTransformer.createProductSnapshot(product, selectedAttributes);

      const cartItemsResponse = await cookiesClient.models.CartItem.listCartItemByCartId(
        { cartId: currentCart.id },
        { filter: { productId: { eq: productId }, variantId: { eq: variantId || undefined } } }
      );

      let existingCartItem =
        cartItemsResponse.data && cartItemsResponse.data.length > 0 ? cartItemsResponse.data[0] : undefined;

      if (existingCartItem) {
        await this.updateExistingCartItem(existingCartItem, quantity);
      } else {
        await this.createNewCartItem(currentCart, productId, variantId, quantity, product.price || 0, productSnapshot);
      }

      await cartTotalsCalculator.recalculateCartTotals(currentCart.id);

      const updatedCart = await this.getCart(storeId, sessionId || '');
      return { success: true, cart: updatedCart };
    } catch (error) {
      logger.error('Error adding to cart', error, 'CartFetcher');
      return { success: false, error: 'Failed to add item to cart.' };
    }
  }

  /**
   * Actualiza un item existente del carrito
   */
  private async updateExistingCartItem(existingCartItem: any, quantity: number): Promise<void> {
    const updatedQuantity = existingCartItem.quantity + quantity;
    const updatedTotalPrice = updatedQuantity * existingCartItem.unitPrice;

    const { data: updatedItem } = await cookiesClient.models.CartItem.update({
      id: existingCartItem.id,
      quantity: updatedQuantity,
      totalPrice: updatedTotalPrice,
      owner: existingCartItem.owner,
    });

    if (!updatedItem) {
      throw new Error('Failed to update cart item.');
    }
  }

  /**
   * Crea un nuevo item del carrito
   */
  private async createNewCartItem(
    cart: Cart,
    productId: string,
    variantId: string | null | undefined,
    quantity: number,
    productPrice: number,
    productSnapshot: string
  ): Promise<void> {
    const newItemTotalPrice = productPrice * quantity;
    const { data: createdItem } = await cookiesClient.models.CartItem.create({
      cartId: cart.id,
      storeId: cart.storeId,
      productId: productId,
      variantId: variantId,
      quantity: quantity,
      unitPrice: productPrice,
      totalPrice: newItemTotalPrice,
      productSnapshot: productSnapshot,
      owner: cart.sessionId || 'public',
    });

    if (!createdItem) {
      throw new Error('Failed to create cart item.');
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
        await cookiesClient.models.CartItem.delete({ id: itemId });
      } else {
        const updatedTotalPrice = existingItem.unitPrice * quantity;
        await cookiesClient.models.CartItem.update({
          id: itemId,
          quantity: quantity,
          totalPrice: updatedTotalPrice,
        });
      }

      await cartTotalsCalculator.recalculateCartTotals(currentCart.id);

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

      await cartTotalsCalculator.recalculateCartTotals(currentCart.id);

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

      const { data: cartItems } = await cookiesClient.models.CartItem.listCartItemByCartId({
        cartId: currentCart.id,
      });

      for (const item of cartItems) {
        await cookiesClient.models.CartItem.delete({ id: item.id });
      }

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
  public transformCartToContext(cart: Cart) {
    return cartContextTransformer.transformCartToContext(cart);
  }
}

export const cartFetcher = new CartFetcher();
