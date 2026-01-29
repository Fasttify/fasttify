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

import { NextRequest } from 'next/server';
import { analyticsWebhookController } from '@/api/webhooks/_lib/analytics/controllers/analytics-webhook-controller';

/**
 * POST /api/webhooks/analytics
 * Recibe webhooks del motor para actualizar analíticas en tiempo real
 *
 * Eventos soportados:
 * - ORDER_CREATED: Nueva orden creada
 * - ORDER_CANCELLED: Orden cancelada
 * - ORDER_REFUNDED: Orden reembolsada
 * - INVENTORY_LOW: Inventario bajo
 * - INVENTORY_OUT: Inventario agotado
 * - NEW_CUSTOMER: Cliente nuevo
 * - CUSTOMER_LOGIN: Login de cliente
 */
export async function POST(request: NextRequest) {
  return analyticsWebhookController(request);
}

/**
 * OPTIONS /api/webhooks/analytics
 * Maneja las solicitudes CORS preflight
 */
export async function OPTIONS(_request: NextRequest) {
  return new Response(null, { status: 200 });
}
