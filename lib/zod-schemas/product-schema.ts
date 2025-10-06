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

import * as z from 'zod';

export const productFormSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre del producto debe tener al menos 2 caracteres.',
  }),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.coerce
      .number({
        invalid_type_error: 'El precio debe ser un número válido.',
        required_error: 'El precio es requerido.',
      })
      .positive({
        message: 'El precio debe ser un número positivo.',
      })
      .optional()
      .nullable()
  ),
  compareAtPrice: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.coerce
      .number({
        invalid_type_error: 'El precio de comparación debe ser un número válido.',
      })
      .positive({
        message: 'El precio de comparación debe ser un número positivo.',
      })
      .optional()
      .nullable()
  ),
  costPerItem: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.coerce
      .number({
        invalid_type_error: 'El costo por artículo debe ser un número válido.',
      })
      .positive({
        message: 'El costo por artículo debe ser un número positivo.',
      })
      .optional()
      .nullable()
  ),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  quantity: z.preprocess(
    (val) => (val === '' ? 0 : val),
    z.coerce
      .number({
        invalid_type_error: 'La cantidad debe ser un número válido.',
      })
      .int({
        message: 'La cantidad debe ser un número entero.',
      })
      .nonnegative({
        message: 'La cantidad debe ser un número entero no negativo.',
      })
  ),
  category: z.string({
    required_error: 'Por favor seleccione una categoría.',
  }),
  images: z
    .array(
      z.object({
        url: z.string(),
        alt: z.string().optional(),
      })
    )
    .optional(),
  attributes: z
    .array(
      z.object({
        name: z.string(),
        values: z.array(z.string()),
      })
    )
    .optional(),
  // Add variants field
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string(),
        price: z.number().optional(),
        sku: z.string().optional(),
        quantity: z.number().optional(),
        options: z.record(z.string()).optional(),
      })
    )
    .optional(),
  // Add tags field
  tags: z.array(z.string()).optional(),
  creationDate: z.date().optional(),
  lastModifiedDate: z.date().optional(),
  status: z.enum(['draft', 'pending', 'active', 'inactive']).default('draft'),
  collectionId: z.string().optional().nullable(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]*$/u, 'El slug solo puede contener letras minúsculas, números y guiones')
    .optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const defaultValues: Partial<ProductFormValues> = {
  name: '',
  description: '',
  price: undefined,
  compareAtPrice: undefined,
  costPerItem: undefined,
  sku: '',
  barcode: '',
  quantity: 0,
  category: '',
  images: [],
  attributes: [],
  variants: [],
  tags: [],
  creationDate: new Date(),
  lastModifiedDate: new Date(),
  status: 'draft',
  collectionId: undefined,
  slug: '',
};
