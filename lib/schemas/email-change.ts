import { z } from 'zod'

export const emailSchema = z.object({
  email: z.string().email('Por favor, introduce un correo electrónico válido'),
})

export const verificationCodeSchema = z.object({
  verificationCode: z.string().min(6, 'El código debe tener al menos 6 caracteres'),
})
