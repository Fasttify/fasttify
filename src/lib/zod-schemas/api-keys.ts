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

export const PAYMENT_GATEWAYS = {
  mercadoPago: {
    name: 'Mercado Pago',
    transactionFee: 3.99,
    publicKeyPrefix: 'APP_USR-',
    privateKeyPrefix: 'TEST-',
    publicKeyPattern: /^APP_USR-[a-zA-Z0-9-]+$/,
    privateKeyPattern: /^TEST-[a-zA-Z0-9-]+$/,
    publicKeyPlaceholder: 'APP_USR-1234567890123456',
    privateKeyPlaceholder: 'Kw4aC0rZVgLZQn209NbEKPuXLzBD28Zx',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Popular en América Latina con amplio soporte regional.',
    publicKeyLabel: 'Access Token',
    privateKeyLabel: 'Clave Secreta',
  },
  wompi: {
    name: 'Wompi',
    transactionFee: 2.9,
    publicKeyPrefix: 'pub_',
    privateKeyPrefix: 'prv_',
    publicKeyPattern: /^(pub_test|pub_prod|prod)_[a-zA-Z0-9]{16,}$/,
    privateKeyPattern: /^[a-zA-Z0-9_-]+$/,
    publicKeyPlaceholder: 'pub_prod_1234567890abcdef',
    privateKeyPlaceholder: 'prod_integrity_Z5mMke9x0k8gpErbDqwrJXMqs',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Tarifas más bajas con fuerte soporte en Colombia y otras regiones.',
    publicKeyLabel: 'Llave Pública',
    privateKeyLabel: 'Firma (Signature)',
  },
} as const;

export type PaymentGatewayType = keyof typeof PAYMENT_GATEWAYS;

export const createApiKeySchema = (gateway: PaymentGatewayType) => {
  const config = PAYMENT_GATEWAYS[gateway];

  if (gateway === 'wompi') {
    return z.object({
      publicKey: z
        .string()
        .min(16, { message: 'La llave pública debe tener al menos 16 caracteres' })
        .regex(config.publicKeyPattern, {
          message: 'Formato de llave pública inválido. Debe comenzar con pub_ o prod_',
        }),
      privateKey: z
        .string()
        .min(32, { message: 'La firma debe tener al menos 32 caracteres' })
        .max(128, { message: 'La firma no puede exceder 128 caracteres' })
        .regex(config.privateKeyPattern, {
          message: 'La firma solo puede contener caracteres alfanuméricos, guiones y guiones bajos',
        }),
    });
  }

  return z.object({
    publicKey: z
      .string()
      .min(10, { message: 'La clave pública debe tener al menos 10 caracteres' })
      .regex(config.publicKeyPattern, {
        message: `La clave pública debe comenzar con '${config.publicKeyPrefix}' seguido del formato correcto`,
      }),
    privateKey: z
      .string()
      .min(10, { message: 'La clave privada debe tener al menos 10 caracteres' })
      .regex(config.privateKeyPattern, {
        message: `La clave privada debe comenzar con '${config.privateKeyPrefix}' seguido del formato correcto`,
      }),
  });
};
