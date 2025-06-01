import { createHmac } from 'crypto'
import { WebhookValidator } from '../types'

export class MercadoPagoWebhookValidator implements WebhookValidator {
  constructor(private readonly webhookSecret: string) {}

  /**
   * Validates MercadoPago webhook signature
   * According to: https://www.mercadopago.cl/developers/en/docs/security/oauth/best-practices
   */
  validateSignature(
    signature: string,
    dataId: string,
    requestId: string,
    timestamp: string
  ): boolean {
    try {
      if (!signature) {
        throw new Error('Signature not provided in webhook')
      }

      const match = signature.match(/ts=([^,]+),v1=([^,]+)/)
      if (!match) {
        throw new Error('Invalid signature format')
      }

      const [, ts, v1] = match

      if (!dataId || !requestId) {
        throw new Error('Missing required parameters in notification')
      }

      const signatureTemplate = `id:${dataId};request-id:${requestId};ts:${ts};`
      const expectedSignature = createHmac('sha256', this.webhookSecret)
        .update(signatureTemplate)
        .digest('hex')

      const isValid = v1 === expectedSignature

      if (isValid) {
        console.log('✅ Webhook signature validated successfully')
      } else {
        console.error('❌ Invalid webhook signature')
      }

      return isValid
    } catch (error) {
      console.error('🔥 Error validating webhook signature:', error)
      return false
    }
  }

  /**
   * Extracts timestamp from signature for additional validations
   */
  extractTimestamp(signature: string): string | null {
    const match = signature.match(/ts=([^,]+),v1=([^,]+)/)
    return match ? match[1] : null
  }

  /**
   * Validates if the webhook is not too old (optional security measure)
   */
  isTimestampValid(timestamp: string, toleranceSeconds: number = 300): boolean {
    const now = Math.floor(Date.now() / 1000)
    const webhookTime = parseInt(timestamp, 10)

    return Math.abs(now - webhookTime) <= toleranceSeconds
  }
}
