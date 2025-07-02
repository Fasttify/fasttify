import { inter } from '@/config/fonts';
import '@/app/global.css';

export default function WithoutNavbarLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
