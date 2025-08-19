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

// Esquema para la creación de una página
export const createPageSchema = z.object({
  storeId: z.string().min(1, 'El ID de la tienda es requerido'),
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede exceder los 100 caracteres'),
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres'),
  slug: z
    .string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*(\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/,
      'El slug solo puede contener letras, números, guiones y barras (/) para anidar.'
    ),
  status: z.enum(['published', 'draft']),
  isVisible: z.boolean(),
  metaTitle: z.string().max(60, 'El meta título no puede exceder los 60 caracteres').optional(),
  metaDescription: z.string().max(160, 'La meta descripción no puede exceder los 160 caracteres').optional(),
  template: z.string().optional(),
  pageType: z.string().optional(),
});

// Esquema para la actualización de una página (todos los campos son opcionales)
export const updatePageSchema = createPageSchema.partial().extend({
  storeId: z.string().min(1, 'El ID de la tienda es requerido').optional(),
  pageType: z.string().optional(),
});

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
