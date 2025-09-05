'use client';

import { inter } from '@/config/fonts';
import { useAuthInitializer } from '@/hooks/auth/useAuthInitializer';
import '@/app/global.css';

export default function WithoutNavbarLayout({ children }: { children: React.ReactNode }) {
  useAuthInitializer();

  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
