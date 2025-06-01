import axios, { AxiosResponse } from 'axios'
import { SubscriptionData, PaymentData } from '../types'

export class MercadoPagoApiService {
  private readonly baseUrl = 'https://api.mercadopago.com'
  private readonly paymentsSearchUrl = 'https://api.mercadopago.com/v1/payments/'
  private readonly authorizedPaymentsUrl = 'https://api.mercadopago.com/authorized_payments/'

  constructor(private readonly accessToken: string) {}

  /**
   * Gets subscription details from MercadoPago
   */
  async getSubscription(subscriptionId: string): Promise<SubscriptionData> {
    try {
      console.log(`🔍 Fetching subscription details for ID: ${subscriptionId}`)

      const response: AxiosResponse<SubscriptionData> = await axios.get(
        `${this.baseUrl}/preapproval/${subscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      console.log(`✅ Subscription data retrieved successfully`)
      return response.data
    } catch (error) {
      console.error(`❌ Error fetching subscription ${subscriptionId}:`, error)
      throw new Error(`Failed to fetch subscription: ${subscriptionId}`)
    }
  }

  /**
   * Gets payment details for standard payments
   */
  async getStandardPayment(paymentId: string): Promise<PaymentData> {
    try {
      console.log(`🔍 Fetching standard payment details for ID: ${paymentId}`)

      const response: AxiosResponse<PaymentData> = await axios.get(
        `${this.paymentsSearchUrl}${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      console.log(`✅ Standard payment data retrieved successfully`)
      return response.data
    } catch (error) {
      console.error(`❌ Error fetching standard payment ${paymentId}:`, error)
      throw new Error(`Failed to fetch payment: ${paymentId}`)
    }
  }

  /**
   * Gets payment details for authorized payments (recurring)
   */
  async getAuthorizedPayment(paymentId: string): Promise<PaymentData> {
    try {
      console.log(`🔍 Fetching authorized payment details for ID: ${paymentId}`)

      const response: AxiosResponse<PaymentData> = await axios.get(
        `${this.authorizedPaymentsUrl}${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      console.log(`✅ Authorized payment data retrieved successfully`)
      return response.data
    } catch (error) {
      console.error(`❌ Error fetching authorized payment ${paymentId}:`, error)
      throw new Error(`Failed to fetch authorized payment: ${paymentId}`)
    }
  }

  /**
   * Validates if payment is approved and accredited
   */
  isPaymentSuccessful(payment: PaymentData): boolean {
    const isApproved = payment?.status === 'approved'
    const isAccredited = payment?.status_detail === 'accredited'

    console.log(`💰 Payment status: ${payment.status}, detail: ${payment?.status_detail}`)

    return isApproved && isAccredited
  }

  /**
   * Gets the payment method based on event type
   */
  getPaymentUrl(eventType: string, paymentId: string): string {
    if (eventType === 'subscription_authorized_payment') {
      return `${this.authorizedPaymentsUrl}${paymentId}`
    } else if (eventType === 'payment') {
      return `${this.paymentsSearchUrl}${paymentId}`
    } else {
      throw new Error(`Unsupported event type: ${eventType}`)
    }
  }
}
