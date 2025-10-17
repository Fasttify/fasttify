'use client';

import { inter } from '@/lib/fonts';
import { useAuthInitializer } from '@/hooks/auth/useAuthInitializer';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import '@/app/global.css';

export default function WithoutNavbarLayout({ children }: { children: React.ReactNode }) {
  useAuthInitializer();

  return (
    <html lang="es">
      <body className={inter.className}>
        <AppProvider
          i18n={{
            locale: 'es',
            fallbackLocale: 'es',
            translations: {
              es: {
                common: {
                  ok: 'Aceptar',
                  cancel: 'Cancelar',
                  close: 'Cerrar',
                  save: 'Guardar',
                  delete: 'Eliminar',
                  edit: 'Editar',
                  add: 'Agregar',
                  remove: 'Quitar',
                  search: 'Buscar',
                  loading: 'Cargando...',
                  error: 'Error',
                  success: 'Éxito',
                },
              },
            },
          }}>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
