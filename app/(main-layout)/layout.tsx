import '@/app/global.css';
import { inter } from '@/config/fonts';
import { Navbar } from '@/app/(main-layout)/landing/components/NavBar';

export default function WithNavbarLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
