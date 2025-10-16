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
    // IDs por entorno
    const isProd = process.env && process.env.NODE_ENV === 'production';

    const DEV_ROYAL_ID = 'd889915d-bb1a-4c54-badd-de697857e624';
    const DEV_MAJESTIC_ID = '442aacda-1fa3-47cd-8fba-6ad028285218';
    const DEV_IMPERIAL_ID = '21e675ee-db9d-4cd7-9902-0fead14a85f5';

    const PROD_ROYAL_ID = 'e02f173f-1ca5-4f7b-a900-2e5c9413d8a6';
    const PROD_MAJESTIC_ID = '149c6595-1611-477d-b0b4-61700d33c069';
    const PROD_IMPERIAL_ID = '3a85e94a-7deb-4f94-8aa4-99a972406f0f';

    const ROYAL_ID = isProd ? PROD_ROYAL_ID : DEV_ROYAL_ID;
    const MAJESTIC_ID = isProd ? PROD_MAJESTIC_ID : DEV_MAJESTIC_ID;
    const IMPERIAL_ID = isProd ? PROD_IMPERIAL_ID : DEV_IMPERIAL_ID;

    // Mapeo de product_id a nombres de planes según entorno
    const productMap: Record<string, string> = {
      [ROYAL_ID]: 'Royal',
      [MAJESTIC_ID]: 'Majestic',
      [IMPERIAL_ID]: 'Imperial',
    };

    return productMap[productId];
  }
}
