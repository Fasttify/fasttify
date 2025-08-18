import { logger } from '@/renderer-engine/lib/logger';
import type {
  Cart,
  CartSnapshot,
  CheckoutContext,
  CheckoutResponse,
  CheckoutSession,
  CheckoutStatus,
  StartCheckoutRequest,
  UpdateCustomerInfoRequest,
} from '@/renderer-engine/types';
import { cookiesClient } from '@/utils/server/AmplifyServer';
import crypto from 'crypto';

interface UserStoreCurrency {
  storeCurrency?: string;
}

export class CheckoutFetcher {
  /**
   * Genera un token único para la sesión de checkout
   * Formato: cn_<base64url> similar a Shopify
   */
  private generateToken(): string {
    const raw = crypto.randomBytes(16).toString('base64url');
    return `fs_${raw}`;
  }

  /**
   * Obtiene el storeOwner (userId) basado en storeId
   */
  private async getStoreOwner(storeId: string): Promise<string> {
    try {
      const { data: store } = await cookiesClient.models.UserStore.get({ storeId });
      return (store as any)?.userId || '';
    } catch (error) {
      logger.error('Error getting store owner:', error);
      throw new Error('Store not found');
    }
  }

  /**
   * Inicia una nueva sesión de checkout
   */
  public async startCheckout(request: StartCheckoutRequest, cart: Cart): Promise<CheckoutResponse> {
    try {
      const token = this.generateToken();
      const storeOwner = await this.getStoreOwner(request.storeId);

      // Configurar expiración (2 horas por defecto)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2);

      // Calcular totales basados en el carrito
      const subtotal = cart.totalAmount || 0;
      const shippingCost = 0; // Por ahora, se puede calcular después
      const taxAmount = 0; // Por ahora, se puede calcular después
      const totalAmount = subtotal + shippingCost + taxAmount;

      // Crear snapshot de los items del carrito
      const itemsSnapshot: CartSnapshot = {
        items: cart.items || [],
        itemCount: cart.itemCount || 0,
        cartTotal: cart.totalAmount || 0,
        snapshotAt: new Date().toISOString(),
      };

      const sessionData = {
        token,
        storeId: request.storeId,
        cartId: request.cartId,
        sessionId: request.sessionId,
        status: 'open' as const,
        expiresAt: expiresAt.toISOString(),
        currency: cart.currency || 'COP',
        subtotal,
        shippingCost,
        taxAmount,
        totalAmount,
        itemsSnapshot: JSON.stringify(itemsSnapshot),
        customerInfo: request.customerInfo ? JSON.stringify(request.customerInfo) : null,
        shippingAddress: request.shippingAddress ? JSON.stringify(request.shippingAddress) : null,
        billingAddress: request.billingAddress ? JSON.stringify(request.billingAddress) : null,
        notes: request.notes,
        storeOwner,
      };

      const response = await cookiesClient.models.CheckoutSession.create(sessionData);

      if (response.data) {
        logger.info(`Checkout session created: ${token} for store ${request.storeId}`);
        return {
          success: true,
          session: this.transformToSession(response.data),
        };
      } else {
        logger.error('Failed to create checkout session:', response.errors);
        return {
          success: false,
          error: 'Failed to create checkout session',
        };
      }
    } catch (error) {
      logger.error('Error starting checkout:', error);
      return {
        success: false,
        error: 'Internal error starting checkout',
      };
    }
  }

  /**
   * Obtiene una sesión de checkout por token
   */
  public async getSessionByToken(token: string): Promise<CheckoutSession | null> {
    try {
      const response = await cookiesClient.models.CheckoutSession.listCheckoutSessionByToken({ token }, { limit: 1 });

      if (response.data && response.data.length > 0) {
        const session = response.data[0];

        // Verificar si la sesión ha expirado
        if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
          // Marcar como expirada si no lo está ya
          if (session.status === 'open') {
            await this.updateSessionStatus(token, 'expired');
          }
          return null;
        }

        return this.transformToSession(session);
      }

      return null;
    } catch (error) {
      logger.error('Error getting checkout session:', error);
      return null;
    }
  }

  /**
   * Actualiza los datos del cliente en la sesión de checkout
   */
  public async updateCustomerInfo(request: UpdateCustomerInfoRequest): Promise<CheckoutResponse> {
    try {
      const session = await this.getSessionByToken(request.token);
      if (!session || session.status !== 'open') {
        return {
          success: false,
          error: 'Checkout session not found or not available',
        };
      }

      const updateData: any = {};
      if (request.customerInfo) updateData.customerInfo = JSON.stringify(request.customerInfo);
      if (request.shippingAddress) updateData.shippingAddress = JSON.stringify(request.shippingAddress);
      if (request.billingAddress) updateData.billingAddress = JSON.stringify(request.billingAddress);
      if (request.notes !== undefined) updateData.notes = request.notes;

      const response = await cookiesClient.models.CheckoutSession.update({
        id: (session as any).id,
        ...updateData,
      });

      if (response.data) {
        return {
          success: true,
          session: this.transformToSession(response.data),
        };
      } else {
        return {
          success: false,
          error: 'Failed to update checkout session',
        };
      }
    } catch (error) {
      logger.error('Error updating checkout session:', error);
      return {
        success: false,
        error: 'Internal error updating checkout session',
      };
    }
  }

  /**
   * Actualiza el estado de una sesión de checkout
   */
  public async updateSessionStatus(token: string, status: CheckoutStatus): Promise<CheckoutResponse> {
    try {
      const session = await this.getSessionByToken(token);
      if (!session) {
        return {
          success: false,
          error: 'Checkout session not found',
        };
      }

      const response = await cookiesClient.models.CheckoutSession.update({
        id: (session as any).id,
        status,
      });

      if (response.data) {
        logger.info(`Checkout session ${token} updated to status: ${status}`);
        return {
          success: true,
          session: this.transformToSession(response.data),
        };
      } else {
        return {
          success: false,
          error: 'Failed to update checkout session status',
        };
      }
    } catch (error) {
      logger.error('Error updating checkout session status:', error);
      return {
        success: false,
        error: 'Internal error updating checkout session',
      };
    }
  }

  /**
   * Completa una sesión de checkout (la marca como completed)
   */
  public async completeCheckout(token: string): Promise<CheckoutResponse> {
    return this.updateSessionStatus(token, 'completed');
  }

  /**
   * Cancela una sesión de checkout
   */
  public async cancelCheckout(token: string): Promise<CheckoutResponse> {
    return this.updateSessionStatus(token, 'cancelled');
  }

  /**
   * Transforma los datos raw de Amplify a formato CheckoutSession
   */
  private transformToSession(rawData: any): CheckoutSession {
    return {
      token: rawData.token,
      storeId: rawData.storeId,
      cartId: rawData.cartId,
      sessionId: rawData.sessionId,
      status: rawData.status,
      expiresAt: rawData.expiresAt,
      currency: rawData.currency || 'COP',
      subtotal: rawData.subtotal || 0,
      shippingCost: rawData.shippingCost || 0,
      taxAmount: rawData.taxAmount || 0,
      totalAmount: rawData.totalAmount || 0,
      itemsSnapshot: rawData.itemsSnapshot ? JSON.parse(rawData.itemsSnapshot) : null,
      customerInfo: rawData.customerInfo ? JSON.parse(rawData.customerInfo) : null,
      shippingAddress: rawData.shippingAddress ? JSON.parse(rawData.shippingAddress) : null,
      billingAddress: rawData.billingAddress ? JSON.parse(rawData.billingAddress) : null,
      notes: rawData.notes,
      storeOwner: rawData.storeOwner,
    };
  }

  /**
   * Transforma sesión de checkout para uso en contexto Liquid
   */
  public transformSessionToContext(session: CheckoutSession): CheckoutContext {
    return {
      token: session.token,
      line_items: session.itemsSnapshot?.items || [],
      item_count: session.itemsSnapshot?.itemCount || 0,
      total_price: session.totalAmount,
      subtotal_price: session.subtotal,
      shipping_price: session.shippingCost,
      tax_price: session.taxAmount,
      currency: session.currency,
      customer: session.customerInfo || {},
      shipping_address: session.shippingAddress || {},
      billing_address: session.billingAddress || {},
      note: session.notes,
      requires_shipping: true, // Por ahora siempre true
      expires_at: session.expiresAt,
    };
  }
}

export const checkoutFetcher = new CheckoutFetcher();
