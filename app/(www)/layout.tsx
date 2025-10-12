import '@/app/global.css';
import { inter } from '@/lib/fonts';
import { Navbar } from '@/app/(www)/landing/components/NavBar';

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
