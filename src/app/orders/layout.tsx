import type { Metadata } from 'next';
import { nunitoSans } from '@/lib/fonts/fonts';
import StyledComponentsRegistry from './registry';
import { ReactQueryProvider } from '@/utils/client/ReactQueryProvider';

export const metadata: Metadata = {
  title: 'Sistema de Órdenes - Fasttify',
  description: 'Accede a tus órdenes de compra de forma segura',
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={nunitoSans.className}>
        <ReactQueryProvider>
          <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
