import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

// Webhook Event Types
export interface WebhookBody {
  type: string
  action: string
  data: {
    id: string
  }
}

// MercadoPago API Response Types
export interface SubscriptionData {
  id: string
  status: string
  external_reference: string
  next_payment_date: string
  reason: string
  auto_recurring: {
    transaction_amount: number
  }
}

export interface PaymentData {
  id: string
  status: string
  external_reference: string
  status_detail: string
  metadata?: {
    preapproval_id?: string
  }
  point_of_interaction?: {
    transaction_data?: {
      subscription_id?: string
    }
  }
  card?: {
    last_four_digits?: string
  }
}

// Cognito User Attributes
export interface CognitoUserAttribute {
  Name?: string
  Value?: string
}

// Response Types
export interface WebhookResponse {
  statusCode: number
  body: string
}

export interface LambdaHandler {
  (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>
}

// Service Interfaces
export interface WebhookValidator {
  validateSignature(
    signature: string,
    dataId: string,
    requestId: string,
    timestamp: string
  ): boolean
}

export interface PaymentProcessor {
  processSubscriptionUpdate(subscriptionId: string): Promise<void>
  processPayment(paymentId: string, paymentType: string): Promise<void>
}

export interface UserService {
  updateUserPlan(userId: string, planName: string): Promise<void>
  downgradeUser(userId: string): Promise<void>
}
