import * as z from 'zod'

const colombianPhoneRegex =
  /^(?:\+57|0057|57)?[ -]?(?:3[0-9]{2}|60[1-8])[ -]?[0-9]{3}[ -]?[0-9]{4}$/
const documentNumberRegex = /^[0-9]{6,12}$/
const allowedDocumentTypes = ['CC', 'CE', 'NIT', 'TI', 'PP', 'DNI', 'RG'] as const

const wompiKeyRegex = /^(pub_test|pub_prod|prod)_[a-zA-Z0-9]{16,}$/

export const wompiConfigSchema = z.object({
  publicKey: z
    .string()
    .min(16, { message: 'La llave pública debe tener al menos 16 caracteres' })
    .regex(wompiKeyRegex, {
      message: 'Formato de llave pública inválido. Debe comenzar con pub_ o prod_',
    }),
  signature: z
    .string()
    .min(32, { message: 'La firma debe tener al menos 32 caracteres' })
    .max(128, { message: 'La firma no puede exceder 128 caracteres' })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: 'La firma solo puede contener caracteres alfanuméricos, guiones y guiones bajos',
    }),
})

export const additionalSettingsSchema = z.object({
  wompiConfig: wompiConfigSchema,
})

// Schema para Información Personal
export const personalInfoSchema = z
  .object({
    fullName: z
      .string()
      .min(5, { message: 'Mínimo 5 caracteres' })
      .max(100, { message: 'Máximo 100 caracteres' })
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
        message: 'Solo se permiten letras y espacios',
      })
      .transform(str => str.trim().replace(/\s+/g, ' ')),

    email: z
      .string()
      .email({ message: 'Correo electrónico inválido' })
      .max(100, { message: 'Máximo 100 caracteres' })
      .refine(email => email.endsWith('.co') || email.endsWith('.com'), {
        message: 'Dominio de correo no válido (.com o .co)',
      }),

    phone: z
      .string()
      .regex(colombianPhoneRegex, {
        message: 'Número telefónico colombiano inválido',
      })
      .transform(num => num.replace(/[^0-9]/g, '')),

    documentType: z.enum(allowedDocumentTypes, {
      errorMap: () => ({ message: 'Tipo de documento no válido' }),
    }),

    documentNumber: z.string().regex(documentNumberRegex, {
      message: 'Número de documento inválido (6-12 dígitos)',
    }),
  })
  .refine(
    data => {
      const { documentType, documentNumber } = data
      if (documentType === 'CC' && documentNumber.length !== 8 && documentNumber.length !== 10)
        return false
      if (documentType === 'NIT' && documentNumber.length < 9) return false
      return true
    },
    {
      message: 'Longitud incorrecta para este tipo de documento',
      path: ['documentNumber'], // Indica a Zod dónde mostrar el error
    }
  )
// Schema para la Tienda
export const storeInfoSchema = z.object({
  storeName: z
    .string()
    .min(3, { message: 'Mínimo 3 caracteres' })
    .max(50, { message: 'Máximo 50 caracteres' })
    .regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]+$/, {
      message: 'Caracteres especiales no permitidos',
    }),

  description: z.string().max(500, { message: 'Máximo 500 caracteres' }).optional(),

  location: z
    .string()
    .min(5, { message: 'Mínimo 5 caracteres' })
    .max(100, { message: 'Máximo 100 caracteres' })
    .regex(/^[a-zA-Z0-9\s#-.,áéíóúÁÉÍÓÚñÑ]+$/),

  category: z
    .string()
    .min(1, { message: 'Requerido' })
    .refine(
      val =>
        [
          'Ropa y Accesorios',
          'Electrónica',
          'Hogar y Jardín',
          'Alimentos y Bebidas',
          'Arte y Artesanías',
          'Otros',
        ].includes(val),
      {
        message: 'Categoría no válida',
      }
    ),
})
