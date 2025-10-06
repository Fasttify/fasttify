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

// Esquema para creación de colección: título requerido sí o sí
export const createCollectionSchema = z.object({
  storeId: z.string().min(1, 'El ID de la tienda es requerido'),
  title: z
    .string()
    .min(1, 'El título de la colección es requerido')
    .max(100, 'El título no puede exceder los 100 caracteres'),
  description: z.string().optional(),
  image: z.string().optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]*$/u, 'El slug solo puede contener letras minúsculas, números y guiones')
    .optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().optional(),
  owner: z.string().min(1, 'El propietario es requerido'),
});

// Esquema para actualización de colección: todos opcionales
export const updateCollectionSchema = createCollectionSchema.partial().extend({
  id: z.string().min(1, 'El ID de la colección es requerido'),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
