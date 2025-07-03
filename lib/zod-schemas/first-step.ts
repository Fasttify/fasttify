import * as z from 'zod';

export const personalInfoSchema = z.object({
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Por favor, ingresa un correo electrónico válido'),
});

export const storeInfoSchema = z.object({
  storeName: z.string().min(3, 'El nombre de la tienda debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
});
