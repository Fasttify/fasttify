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
