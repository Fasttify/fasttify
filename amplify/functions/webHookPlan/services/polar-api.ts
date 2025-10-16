import { Polar } from '@polar-sh/sdk';
import { SubscriptionData, PaymentData } from '../types';

export class PolarApiService {
  private polar: Polar;

  constructor(accessToken: string) {
    this.polar = new Polar({
      accessToken,
      server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    });
  }

  /**
   * Obtiene información de una suscripción
   */
  async getSubscription(subscriptionId: string): Promise<SubscriptionData> {
    try {
      const response = await this.polar.subscriptions.get({
        id: subscriptionId,
      });

      if (!response) {
        throw new Error(`Subscription not found: ${subscriptionId}`);
      }

      const subscription: SubscriptionData = {
        id: response.id,
        status: response.status,
        external_reference: (response.customer?.externalId as string) || '',
        current_period_end: response.currentPeriodEnd
          ? response.currentPeriodEnd instanceof Date
            ? response.currentPeriodEnd.toISOString()
            : String(response.currentPeriodEnd)
          : '',
        cancel_at_period_end: response.cancelAtPeriodEnd,
        amount: response.amount,
        product_id: response.productId || '',
      };

      return subscription;
    } catch (error) {
      console.error('Error getting subscription data:', error);
      throw error;
    }
  }

  /**
   * Obtiene información de un pago/orden
   */
  async getOrder(orderId: string): Promise<PaymentData> {
    try {
      const response = await this.polar.orders.get({
        id: orderId,
      });

      if (!response) {
        throw new Error(`Order not found: ${orderId}`);
      }

      const order: PaymentData = {
        id: response.id,
        status: response.status,
        external_reference: (response.customer?.externalId as string) || '',
        amount: response.totalAmount,
        net_amount: response.netAmount,
        subscription_id: response.subscriptionId || undefined,
        customer_id: response.customerId || undefined,
      };

      return order;
    } catch (error) {
      console.error('Error getting order data:', error);
      throw error;
    }
  }

  /**
   * Verifica si un pago fue exitoso
   */
  isPaymentSuccessful(paymentData: PaymentData): boolean {
    const successStatuses = ['completed', 'paid', 'succeeded'];
    return successStatuses.includes(paymentData.status);
  }
}
