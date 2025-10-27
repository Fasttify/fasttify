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

import { logger } from '../../../lib/logger';
import type { CheckoutContext, CheckoutSession } from '../../../types';

/**
 * Transformador de datos específico para checkout
 * Convierte los datos de CheckoutSession al formato esperado por Liquid templates
 */
export class CheckoutDataTransformer {
  /**
   * Transforma un item del carrito al formato esperado por checkout.liquid
   */
  public transformCartItem(item: any): any {
    try {
      // Parsear el productSnapshot que viene como JSON string
      const productSnapshot = item.productSnapshot ? JSON.parse(item.productSnapshot) : {};

      return {
        id: item.id,
        title: productSnapshot.title || productSnapshot.name || 'Producto',
        variant_title: item.variantId ? 'Variante personalizada' : null,
        quantity: item.quantity || 1,
        price: item.unitPrice || productSnapshot.price || 0,
        line_price: item.totalPrice || item.unitPrice * item.quantity || 0,
        image: productSnapshot.featured_image || (productSnapshot.images && productSnapshot.images[0]) || null,
        url: productSnapshot.url || `/products/${productSnapshot.slug || item.productId}`,
        product_id: item.productId,
        variant_id: item.variantId,
        handle: productSnapshot.slug,
        selectedAttributes: productSnapshot.selectedAttributes || {},
        // Propiedades adicionales del producto
        product: {
          id: item.productId,
          title: productSnapshot.title || productSnapshot.name,
          images: productSnapshot.images || [],
          price: productSnapshot.price || 0,
          compare_at_price: productSnapshot.compare_at_price || null,
          description: productSnapshot.description || '',
          category: productSnapshot.category || '',
          status: productSnapshot.status || 'active',
        },
      };
    } catch (error) {
      logger.error('Error transforming cart item:', error);

      // Fallback en caso de error
      return this.createFallbackCartItem(item);
    }
  }

  /**
   * Crea un item de carrito de fallback en caso de error
   */
  private createFallbackCartItem(item: any): any {
    return {
      id: item.id,
      title: 'Producto',
      variant_title: null,
      quantity: item.quantity || 1,
      price: item.unitPrice || 0,
      line_price: item.totalPrice || 0,
      image: null,
      url: `/products/${item.productId}`,
      product_id: item.productId,
      variant_id: item.variantId,
      handle: item.productId,
      selectedAttributes: {},
      product: {
        id: item.productId,
        title: 'Producto',
        images: [],
        price: item.unitPrice || 0,
        compare_at_price: null,
        description: '',
        category: '',
        status: 'active',
      },
    };
  }

  /**
   * Transforma la dirección al formato esperado por Liquid
   */
  public transformAddress(address: any): any {
    if (!address) {
      return this.createDefaultAddress();
    }

    return {
      address1: address.address1 || '',
      address2: address.address2 || '',
      city: address.city || '',
      province: address.province || address.state || '',
      zip: address.zip || '',
      country: address.country || 'CO',
      first_name: address.first_name || '',
      last_name: address.last_name || '',
      phone: address.phone || '',
    };
  }

  /**
   * Crea una dirección por defecto
   */
  private createDefaultAddress(): any {
    return {
      address1: '',
      address2: '',
      city: '',
      province: '',
      zip: '',
      country: 'CO',
      first_name: '',
      last_name: '',
      phone: '',
    };
  }

  /**
   * Transforma la información del cliente al formato esperado por Liquid
   */
  public transformCustomerInfo(customerInfo: any): any {
    if (!customerInfo) {
      return this.createDefaultCustomerInfo();
    }

    return {
      email: customerInfo.email || '',
      firstName: customerInfo.firstName || '',
      lastName: customerInfo.lastName || '',
      phone: customerInfo.phone || '',
    };
  }

  /**
   * Crea información de cliente por defecto
   */
  private createDefaultCustomerInfo(): any {
    return {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
    };
  }

  /**
   * Transforma una sesión de checkout completa al formato Liquid
   */
  public transformSessionToContext(session: CheckoutSession): CheckoutContext {
    try {
      // Transformar items del carrito
      const transformedItems = (session.itemsSnapshot?.items || []).map((item) => this.transformCartItem(item));

      // Transformar direcciones y información del cliente
      const customerInfo = this.transformCustomerInfo(session.customerInfo);
      const shippingAddress = this.transformAddress(session.shippingAddress);
      const billingAddress = this.transformAddress(session.billingAddress);

      return {
        storeId: session.storeId,
        token: session.token,
        line_items: transformedItems,
        item_count: session.itemsSnapshot?.itemCount || transformedItems.length || 0,
        total_price: session.totalAmount || 0,
        subtotal_price: session.subtotal || 0,
        shipping_price: session.shippingCost || 0,
        tax_price: session.taxAmount || 0,
        currency: session.currency || 'COP',
        customer: customerInfo,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        note: session.notes || '',
        requires_shipping: true,
        expires_at: session.expiresAt,

        // Propiedades adicionales útiles
        created_at: session.createdAt,
        updated_at: session.updatedAt,
        status: session.status,
        session_id: session.sessionId,
        cart_id: session.cartId,

        // Información de totales adicional
        totals: {
          subtotal: session.subtotal || 0,
          shipping: session.shippingCost || 0,
          tax: session.taxAmount || 0,
          total: session.totalAmount || 0,
        },
      };
    } catch (error) {
      logger.error('Error transforming checkout session to context:', error);

      // Retornar estructura mínima válida en caso de error
      return this.createFallbackCheckoutContext(session);
    }
  }

  /**
   * Crea un contexto de checkout de fallback en caso de error
   */
  private createFallbackCheckoutContext(session: CheckoutSession): CheckoutContext {
    return {
      storeId: session.storeId || '',
      token: session.token || '',
      line_items: [],
      item_count: 0,
      total_price: 0,
      subtotal_price: 0,
      shipping_price: 0,
      tax_price: 0,
      currency: 'COP',
      customer: this.createDefaultCustomerInfo(),
      shipping_address: this.createDefaultAddress(),
      billing_address: this.createDefaultAddress(),
      note: '',
      requires_shipping: true,
      expires_at: session.expiresAt || new Date().toISOString(),
    };
  }

  /**
   * Valida que una sesión de checkout tenga los datos mínimos requeridos
   */
  public validateCheckoutSession(session: CheckoutSession): boolean {
    if (!session || !session.token || !session.storeId) {
      logger.warn('Invalid checkout session: missing required fields');
      return false;
    }

    if (session.status !== 'open') {
      logger.warn(`Checkout session ${session.token} is not open (status: ${session.status})`);
      return false;
    }

    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      logger.warn(`Checkout session ${session.token} has expired`);
      return false;
    }

    return true;
  }
}

export const checkoutDataTransformer = new CheckoutDataTransformer();
