import { PaymentProcessor } from '../types';
import { PolarApiService } from './polar-api';
import { CognitoUserService } from './user-service';

export class PolarPaymentProcessor implements PaymentProcessor {
  constructor(
    private readonly polarApiService: PolarApiService,
    private readonly userService: CognitoUserService
  ) {}

  /**
   * Procesa actualizaciones de suscripción (cancelaciones, etc.)
   */
  async processSubscriptionUpdate(subscriptionId: string): Promise<void> {
    try {
      const subscriptionData = await this.polarApiService.getSubscription(subscriptionId);

      // Manejar cancelación de suscripción
      if (
        subscriptionData.status === 'canceled' ||
        subscriptionData.status === 'incomplete_expired' ||
        subscriptionData.status === 'unpaid'
      ) {
        const userId = subscriptionData.external_reference;

        if (!userId) {
          console.error('No user id found in external_reference');
          return;
        }

        await this.userService.downgradeUser(userId);
      }
      // Manejar actualización de suscripción
      else if (subscriptionData.status === 'active') {
        const userId = subscriptionData.external_reference;

        if (!userId) {
          console.error('No user id found in external_reference');
          return;
        }

        const planName = this.getPlanFromProductId(subscriptionData.product_id);

        await this.userService.updateUserPlan(userId, planName);
      }
    } catch (error) {
      console.error('Error processing subscription update:', error);
      throw error;
    }
  }

  /**
   * Determina el nombre del plan basado en el ID del producto
   */
  private getPlanFromProductId(productId: string): string {
    // Mapeo de product_id a nombres de planes
    // Esto debe configurarse según tus productos en Polar
    const productMap: Record<string, string> = {
      'e02f173f-1ca5-4f7b-a900-2e5c9413d8a6': 'Royal',
      '149c6595-1611-477d-b0b4-61700d33c069': 'Majestic',
      '3a85e94a-7deb-4f94-8aa4-99a972406f0f': 'Imperial',
      // Añadir más mapeos según sea necesario
    };

    return productMap[productId];
  }
}
