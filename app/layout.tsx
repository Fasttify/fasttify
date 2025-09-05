import ConfigureAmplifyClientSide from '@/utils/client/ConfigureAmplify';
import { ReactQueryProvider } from '@/utils/client/ReactQueryProvider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.fasttify.com'),
  title: {
    template: '%s',
    default: 'Fasttify',
  },
  description: 'Crea tu tienda online en minutos con Fasttify',
  keywords: ['ecommerce', 'dropshipping', 'tienda online', 'Fasttify', 'compras online'],
  openGraph: {
    title: 'Fasttify',
    description: 'Fasttify potencia tu tienda online de dropshipping.',
    url: 'https://www.fasttify.com',
    siteName: 'Fasttify',
    images: [
      {
        url: 'https://cdn.fasttify.com/assets/b/fast@4x.webp',
        width: 800,
        height: 600,
        alt: 'Fasttify ',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fasttify - Ecommerce Dropshipping',
    description: 'Fasttify potencia tu tienda online de dropshipping.',
    images: ['https://cdn.fasttify.com/assets/b/fast@4x.webp'],
  },
  icons: {
    icon: 'https://cdn.fasttify.com/assets/b/fast@4x.webp',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <ConfigureAmplifyClientSide />
      {children}
    </ReactQueryProvider>
  );
}
