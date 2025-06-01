import { PaymentProcessor } from '../types'
import { MercadoPagoApiService } from './mercadopago-api'
import { CognitoUserService } from './user-service'

export class MercadoPagoPaymentProcessor implements PaymentProcessor {
  constructor(
    private readonly mpApiService: MercadoPagoApiService,
    private readonly userService: CognitoUserService
  ) {}

  /**
   * Processes subscription update events (cancellations, etc.)
   */
  async processSubscriptionUpdate(subscriptionId: string): Promise<void> {
    try {
      console.log('🛑 Processing subscription update')

      const subscriptionData = await this.mpApiService.getSubscription(subscriptionId)

      // Handle subscription cancellation
      if (subscriptionData.status === 'cancelled') {
        const userId = subscriptionData.external_reference
        console.log(`⚠️ Detected cancellation for user: ${userId}`)

        await this.userService.downgradeUser(userId)
      }

      console.log('✅ Subscription update processed successfully')
    } catch (error) {
      console.error('❌ Error processing subscription update:', error)
      throw error
    }
  }

  /**
   * Processes payment events (approved payments)
   */
  async processPayment(paymentId: string, paymentType: string): Promise<void> {
    try {
      console.log(`💰 Processing ${paymentType} payment: ${paymentId}`)

      // Get payment data based on type
      const paymentData =
        paymentType === 'subscription_authorized_payment'
          ? await this.mpApiService.getAuthorizedPayment(paymentId)
          : await this.mpApiService.getStandardPayment(paymentId)

      console.log('💡 Payment data:', JSON.stringify(paymentData, null, 2))

      // Validate payment status
      if (!this.mpApiService.isPaymentSuccessful(paymentData)) {
        console.warn('⚠️ Payment not completed successfully')
        return
      }

      // Get subscription information
      const subscriptionId =
        paymentData.point_of_interaction?.transaction_data?.subscription_id ||
        paymentData.metadata?.preapproval_id ||
        paymentData.external_reference

      if (!subscriptionId) {
        console.warn('⚠️ No subscription ID found in payment data')
        return
      }

      const subscriptionData = await this.mpApiService.getSubscription(subscriptionId)
      const userId = subscriptionData.external_reference
      const newPlanName = subscriptionData.reason
      const newAmountFromMP = subscriptionData.auto_recurring.transaction_amount
      const nextPaymentDate = subscriptionData.next_payment_date

      console.log(`👤 User: ${userId}`)
      console.log(`📦 New plan: ${newPlanName}`)
      console.log(`💰 Amount: ${newAmountFromMP}`)
      console.log(`📅 Next payment: ${nextPaymentDate}`)

      // Update user plan in Cognito
      await this.userService.updateUserPlan(userId, newPlanName)

      // Update subscription data in DynamoDB
      await this.userService.updateSubscription(userId, {
        subscriptionId,
        planName: newPlanName,
        nextPaymentDate,
        lastFourDigits: this.extractLastFourDigits(paymentData),
      })

      console.log('✅ Payment processed successfully')
    } catch (error) {
      console.error('❌ Error processing payment:', error)
      throw error
    }
  }

  /**
   * Extracts last four digits from payment data
   * This is a simplified implementation - adjust based on actual MercadoPago response
   */
  private extractLastFourDigits(paymentData: any): number | undefined {
    // MercadoPago might provide card info in different ways
    // Adjust this based on the actual API response structure
    try {
      if (paymentData.card?.last_four_digits) {
        return parseInt(paymentData.card.last_four_digits, 10)
      }
      if (paymentData.payment_method?.last_four_digits) {
        return parseInt(paymentData.payment_method.last_four_digits, 10)
      }
      return undefined
    } catch (error) {
      console.warn('⚠️ Could not extract last four digits from payment data')
      return undefined
    }
  }

  /**
   * Determines if the webhook event should be processed
   */
  shouldProcessEvent(eventType: string, eventAction: string): boolean {
    const supportedEvents = [
      'subscription_preapproval',
      'subscription_authorized_payment',
      'payment',
    ]

    const supportedActions = ['updated', 'created', 'payment.created']

    const isSupported = supportedEvents.includes(eventType)

    if (!isSupported) {
      console.warn(`⚠️ Unsupported event type: ${eventType}`)
    }

    return isSupported
  }

  /**
   * Gets event processing priority (for future queue implementation)
   */
  getEventPriority(eventType: string): number {
    switch (eventType) {
      case 'subscription_preapproval':
        return 1 // High priority for cancellations
      case 'subscription_authorized_payment':
        return 2 // Medium priority for recurring payments
      case 'payment':
        return 3 // Lower priority for one-time payments
      default:
        return 10 // Lowest priority
    }
  }
}
