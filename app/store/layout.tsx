import '@/app/global.css';
import { StoreLayoutClient } from '@/app/store/layout/StoreLayoutClient';
import { inter } from '@/lib/fonts/fonts';
import { Suspense } from 'react';

export const metadata = {
  title: 'Mi tienda',
  description: 'Dashboard de tu tienda en Fasttify',
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Suspense>
          <StoreLayoutClient>{children}</StoreLayoutClient>
        </Suspense>
      </body>
    </html>
  );
}
