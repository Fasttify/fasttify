import type { Metadata } from 'next';
import { inter } from '@/config/fonts';

export const metadata: Metadata = {
  title: 'Sistema de Órdenes - Fasttify',
  description: 'Accede a tus órdenes de compra de forma segura',
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
