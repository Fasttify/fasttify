import '@/app/global.css';
import { inter } from '@/lib/fonts/fonts';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
