import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { ReactQueryProvider } from '@/utils/ReactQueryProvider'
import { Toaster } from '@/components/ui/sonner'
import { Amplify } from 'aws-amplify'
import ConfigureAmplifyClientSide from '@/utils/ConfigureAmplify'
import outputs from '@/amplify_outputs.json'
import './global.css'

Amplify.configure(outputs)
const existingConfig = Amplify.getConfig()
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  // URL base para resolver rutas relativas en metadatos (por ejemplo, en imágenes)
  metadataBase: new URL('https://www.fasttify.com'),
  title: {
    default: 'Fasttify - Ecommerce Dropshipping',
    template: '%s | Fasttify Dropshipping',
  },
  description:
    'Fasttify es una plataforma ecommerce de dropshipping que te permite gestionar y escalar tu tienda online sin complicaciones, ofreciendo productos de calidad y una experiencia de compra excepcional.',
  keywords: ['ecommerce', 'dropshipping', 'tienda online', 'Fasttify', 'compras online'],
  openGraph: {
    title: 'Fasttify',
    description:
      'Descubre Fasttify, la plataforma ecommerce de dropshipping que facilita la gestión de tu tienda online y te ayuda a escalar tus ventas sin complicaciones.',
    url: 'https://www.fasttify.com',
    siteName: 'Fasttify',
    images: [
      {
        url: 'https://www.fasttify.com/icons/fast@4x.webp',
        width: 800,
        height: 600,
        alt: 'Fasttify Dropshipping',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fasttify - Ecommerce Dropshipping',
    description:
      'Fasttify potencia tu tienda online de dropshipping, facilitando la gestión de productos y escalabilidad de ventas.',
    images: ['https://www.fasttify.com/icons/fast@4x.webp'],
  },
  icons: {
    icon: '/icons/fast@4x.webp',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={plusJakartaSans.className}>
        <ConfigureAmplifyClientSide />
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster
          toastOptions={{
            classNames: {
              description: '!important',
            },
          }}
        />
      </body>
    </html>
  )
}
