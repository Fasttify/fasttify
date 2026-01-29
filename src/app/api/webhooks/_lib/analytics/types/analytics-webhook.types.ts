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

import { z } from 'zod';

/**
 * Esquemas Zod para validación de webhooks de analíticas
 */

// Esquema para el tipo de evento
export const AnalyticsWebhookEventTypeSchema = z.enum([
  'ORDER_CREATED',
  'ORDER_CANCELLED',
  'ORDER_REFUNDED',
  'INVENTORY_LOW',
  'INVENTORY_OUT',
  'NEW_CUSTOMER',
  'CUSTOMER_LOGIN',
  'STORE_VIEW',
]);

// Esquemas para datos específicos de eventos
export const OrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
});

export const OrderCreatedDataSchema = z.object({
  orderId: z.string().min(1),
  totalAmount: z.number().nonnegative(),
  currency: z.string().min(3).max(3),
  customerId: z.string().optional(),
  customerType: z.enum(['registered', 'guest']),
  items: z.array(OrderItemSchema).min(1),
  discountAmount: z.number().nonnegative().default(0),
  subtotal: z.number().nonnegative().optional(),
});

export const OrderCancelledDataSchema = z.object({
  orderId: z.string().min(1),
  totalAmount: z.number().nonnegative(),
  currency: z.string().min(3).max(3),
  customerId: z.string().optional(),
  reason: z.string().optional(),
});

export const OrderRefundedDataSchema = z.object({
  orderId: z.string().min(1),
  refundAmount: z.number().nonnegative(),
  currency: z.string().min(3).max(3),
  customerId: z.string().optional(),
  reason: z.string().optional(),
});

export const InventoryLowDataSchema = z.object({
  productId: z.string().min(1),
  currentQuantity: z.number().int().nonnegative(),
  threshold: z.number().int().positive(),
});

export const InventoryOutDataSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
});

export const NewCustomerDataSchema = z.object({
  customerId: z.string().min(1),
  customerType: z.enum(['registered', 'guest']),
  registrationDate: z.string().datetime(),
});

export const CustomerLoginDataSchema = z.object({
  customerId: z.string().min(1),
  customerType: z.enum(['registered', 'guest']),
  loginDate: z.string().datetime(),
});

export const StoreViewDataSchema = z.object({
  sessionId: z.string().min(1),
  ip: z.string().min(1),
  userAgent: z.string().min(1),
  referrer: z.string().optional(),
  country: z.string().optional(),
  url: z.string().url(),
  path: z.string().min(1),
  deviceType: z.enum(['mobile', 'desktop', 'tablet']).optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  referrerCategory: z.string().optional(),
});

// Esquema principal del webhook
export const AnalyticsWebhookEventSchema = z.object({
  type: AnalyticsWebhookEventTypeSchema,
  storeId: z.string().min(1),
  timestamp: z.string().datetime(),
  data: z.union([
    OrderCreatedDataSchema,
    OrderCancelledDataSchema,
    OrderRefundedDataSchema,
    InventoryLowDataSchema,
    InventoryOutDataSchema,
    NewCustomerDataSchema,
    CustomerLoginDataSchema,
    StoreViewDataSchema,
  ]),
});

export const AnalyticsWebhookResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
});

/**
 * Tipos TypeScript inferidos de los esquemas Zod
 */
export type AnalyticsWebhookEventType = z.infer<typeof AnalyticsWebhookEventTypeSchema>;
export type AnalyticsWebhookEvent = z.infer<typeof AnalyticsWebhookEventSchema>;
export type AnalyticsWebhookResponse = z.infer<typeof AnalyticsWebhookResponseSchema>;

export type OrderCreatedData = z.infer<typeof OrderCreatedDataSchema>;
export type OrderCancelledData = z.infer<typeof OrderCancelledDataSchema>;
export type OrderRefundedData = z.infer<typeof OrderRefundedDataSchema>;
export type InventoryLowData = z.infer<typeof InventoryLowDataSchema>;
export type InventoryOutData = z.infer<typeof InventoryOutDataSchema>;
export type NewCustomerData = z.infer<typeof NewCustomerDataSchema>;
export type CustomerLoginData = z.infer<typeof CustomerLoginDataSchema>;
export type StoreViewData = z.infer<typeof StoreViewDataSchema>;

/**
 * Unión de todos los tipos de datos de eventos
 */
export type AnalyticsWebhookEventData =
  | OrderCreatedData
  | OrderCancelledData
  | OrderRefundedData
  | InventoryLowData
  | InventoryOutData
  | NewCustomerData
  | CustomerLoginData
  | StoreViewData;
