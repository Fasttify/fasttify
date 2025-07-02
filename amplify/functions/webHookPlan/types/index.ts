import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Webhook Event Types
export interface WebhookBody {
  event_type: string;
  data: {
    id: string;
    [key: string]: any;
  };
}

// Polar API Response Types
export interface SubscriptionData {
  id: string;
  status: string;
  external_reference: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  amount: number;
  product_id: string;
}

export interface PaymentData {
  id: string;
  status: string;
  external_reference: string;
  amount: number;
  net_amount: number;
  subscription_id?: string;
  customer_id?: string;
}

// Cognito User Attributes
export interface CognitoUserAttribute {
  Name?: string;
  Value?: string;
}

// Response Types
export interface WebhookResponse {
  statusCode: number;
  body: string;
  headers: {
    [key: string]: string;
  };
}

export interface LambdaHandler {
  (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>;
}

// Service Interfaces
export interface WebhookValidator {
  validateSignature(signature: string, payload: string, requestId: string, timestamp: string): boolean;
}

export interface PaymentProcessor {
  processSubscriptionUpdate(subscriptionId: string): Promise<void>;
}

export interface UserService {
  updateUserPlan(userId: string, planName: string): Promise<void>;
  downgradeUser(userId: string): Promise<void>;
}

// Polar Webhook Event Types
export interface PolarWebhookEvent {
  type: string;
  data: PolarWebhookData;
}

export type PolarWebhookData = {
  id: string;
  subscription_id?: string;
  [key: string]: any;
};
