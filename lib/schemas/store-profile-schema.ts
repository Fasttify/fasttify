import * as z from 'zod'

export const storeProfileSchema = z.object({
  storeName: z
    .string()
    .min(3, { message: 'Mínimo 3 caracteres' })
    .max(50, { message: 'Máximo 50 caracteres' })
    .regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]+$/, {
      message: 'Caracteres especiales no permitidos',
    }),

  storePhone: z
    .string()
    .regex(/^(?:\+57|0057|57)?[ -]?(?:3[0-9]{2}|60[1-8])[ -]?[0-9]{3}[ -]?[0-9]{4}$/, {
      message: 'Número telefónico colombiano inválido',
    })
    .optional()
    .or(z.literal('')),

  storeEmail: z
    .string()
    .email({ message: 'Correo electrónico inválido' })
    .max(100, { message: 'Máximo 100 caracteres' })
    .refine(email => !email || email.endsWith('.co') || email.endsWith('.com'), {
      message: 'Dominio de correo no válido (.com o .co)',
    })
    .optional()
    .or(z.literal('')),
})

export type StoreProfileFormValues = z.infer<typeof storeProfileSchema>
