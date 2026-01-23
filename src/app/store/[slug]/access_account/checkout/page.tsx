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

import { CheckoutModalClient } from '@/app/store/[slug]/access_account/checkout/CheckoutModalClient';

interface CheckoutPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Página de checkout para usuarios con suscripción expirada que necesitan reactivar
 */
export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug: storeId } = await params;

  // El middleware ya validó todo, solo renderizar el modal
  return <CheckoutModalClient storeId={storeId} />;
}
