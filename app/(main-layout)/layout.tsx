'use client';

import '@/app/global.css';
import 'aws-amplify/auth/enable-oauth-listener';
import { inter } from '@/config/fonts';
import { Navbar } from '@/app/(main-layout)/landing/components/NavBar';
import { useAuthInitializer } from '@/hooks/auth/useAuthInitializer';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';

Amplify.configure(outputs);
const existingConfig = Amplify.getConfig();
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
});

export default function WithNavbarLayout({ children }: { children: React.ReactNode }) {
  useAuthInitializer();

  return (
    <html lang="es">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
