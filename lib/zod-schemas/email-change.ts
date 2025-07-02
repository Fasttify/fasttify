import * as z from 'zod';

export const emailSchema = z.object({
  email: z.string().email('Por favor, introduce un correo electrónico válido'),
});

export const verificationCodeSchema = z.object({
  verificationCode: z.string().min(6, 'El código debe tener al menos 6 caracteres'),
});

export const formSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 caracteres'),
  bio: z.string(),
});
