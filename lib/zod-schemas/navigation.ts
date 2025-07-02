import { z } from 'zod';

/**
 * Schema para validar un elemento de menú
 */
export const menuItemSchema = z
  .object({
    label: z.string().min(1, 'La etiqueta es requerida').max(50, 'La etiqueta no puede tener más de 50 caracteres'),
    type: z.enum(['internal', 'external', 'page', 'collection', 'product'], {
      errorMap: () => ({ message: 'Tipo de enlace inválido' }),
    }),
    isVisible: z.boolean(),
    target: z.enum(['_blank', '_self']).optional(),
    sortOrder: z.number().int().min(1),

    // Campos condicionales
    url: z.string().optional(),
    pageHandle: z.string().optional(),
    collectionHandle: z.string().optional(),
    productHandle: z.string().optional(),
  })
  .refine(
    (data) => {
      // Validaciones condicionales según el tipo
      switch (data.type) {
        case 'internal':
          if (!data.url) return false;
          if (!data.url.startsWith('/')) return false;
          return true;

        case 'external':
          if (!data.url) return false;
          if (!data.url.startsWith('http://') && !data.url.startsWith('https://')) return false;
          return true;

        case 'page':
          if (!data.pageHandle) return false;
          if (!/^[a-z0-9-]+$/.test(data.pageHandle)) return false;
          return true;

        case 'collection':
          // Permitir handle vacío para enlace a /collections
          if (data.collectionHandle && !/^[a-z0-9-]+$/.test(data.collectionHandle)) return false;
          return true;

        case 'product':
          // Permitir handle vacío para enlace a /products
          if (data.productHandle && !/^[a-z0-9-]+$/.test(data.productHandle)) return false;
          return true;

        default:
          return false;
      }
    },
    (data) => {
      // Mensajes de error específicos según el tipo
      switch (data.type) {
        case 'internal':
          if (!data.url) return { message: 'La URL interna es requerida', path: ['url'] };
          if (!data.url.startsWith('/')) return { message: 'La URL interna debe comenzar con /', path: ['url'] };
          break;

        case 'external':
          if (!data.url) return { message: 'La URL externa es requerida', path: ['url'] };
          if (!data.url.startsWith('http://') && !data.url.startsWith('https://')) {
            return { message: 'La URL externa debe comenzar con http:// o https://', path: ['url'] };
          }
          break;

        case 'page':
          if (!data.pageHandle) return { message: 'El handle de la página es requerido', path: ['pageHandle'] };
          if (!/^[a-z0-9-]+$/.test(data.pageHandle)) {
            return {
              message: 'El handle solo puede contener letras minúsculas, números y guiones',
              path: ['pageHandle'],
            };
          }
          break;

        case 'collection':
          if (data.collectionHandle && !/^[a-z0-9-]+$/.test(data.collectionHandle)) {
            return {
              message: 'El handle solo puede contener letras minúsculas, números y guiones',
              path: ['collectionHandle'],
            };
          }
          break;

        case 'product':
          if (data.productHandle && !/^[a-z0-9-]+$/.test(data.productHandle)) {
            return {
              message: 'El handle solo puede contener letras minúsculas, números y guiones',
              path: ['productHandle'],
            };
          }
          break;
      }
      return { message: 'Error de validación', path: ['type'] };
    }
  );

/**
 * Schema para validar un menú de navegación
 */
export const navigationMenuSchema = z.object({
  name: z.string().min(1, 'El nombre del menú es requerido').max(100, 'El nombre no puede tener más de 100 caracteres'),
  handle: z
    .string()
    .min(1, 'El handle es requerido')
    .max(100, 'El handle no puede tener más de 100 caracteres')
    .regex(/^[a-z0-9-]+$/, 'El handle solo puede contener letras minúsculas, números y guiones'),
  isMain: z.boolean(),
  isActive: z.boolean(),
  menuData: z.array(menuItemSchema).max(20, 'Un menú no puede tener más de 20 elementos'),
  storeId: z.string().min(1, 'Store ID es requerido'),
  domain: z.string().min(1, 'Dominio es requerido'),
});

/**
 * Schema para actualizar un menú (campos opcionales)
 */
export const updateNavigationMenuSchema = navigationMenuSchema.partial().extend({
  id: z.string().min(1, 'ID del menú es requerido'),
});

/**
 * Tipos TypeScript derivados de los schemas
 */
export type MenuItemValidation = z.infer<typeof menuItemSchema>;
export type NavigationMenuValidation = z.infer<typeof navigationMenuSchema>;
export type UpdateNavigationMenuValidation = z.infer<typeof updateNavigationMenuSchema>;

/**
 * Función helper para validar un menú
 */
export function validateNavigationMenu(data: unknown): NavigationMenuValidation {
  return navigationMenuSchema.parse(data);
}

/**
 * Función helper para validar una actualización de menú
 */
export function validateUpdateNavigationMenu(data: unknown): UpdateNavigationMenuValidation {
  return updateNavigationMenuSchema.parse(data);
}

/**
 * Función helper para validar un array de items
 */
export function validateMenuItems(items: unknown): MenuItemValidation[] {
  const schema = z.array(menuItemSchema);
  return schema.parse(items);
}
