import type { Metadata } from 'next'
import { inter } from '@/config/fonts'
import { ReactQueryProvider } from '@/utils/ReactQueryProvider'
import { Toaster } from '@/components/ui/sonner'
import ConfigureAmplifyClientSide from '@/utils/ConfigureAmplify'
import { Amplify } from 'aws-amplify'
import outputs from '@/amplify_outputs.json'

Amplify.configure(outputs)
const existingConfig = Amplify.getConfig()
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
})

import './global.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.fasttify.com'),
  title: {
    default: 'Fasttify',
    template: '%s | Fasttify',
  },
  description:
    'Fasttify es una plataforma ecommerce de dropshipping que te permite gestionar y escalar tu tienda online sin complicaciones, ofreciendo productos de calidad y una experiencia de compra excepcional.',
  keywords: ['ecommerce', 'dropshipping', 'tienda online', 'Fasttify', 'compras online'],
  openGraph: {
    title: 'Fasttify',
    description: 'Fasttify potencia tu tienda online de dropshipping.',
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
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fasttify - Ecommerce Dropshipping',
    description: 'Fasttify potencia tu tienda online de dropshipping.',
    images: ['https://www.fasttify.com/icons/fast@4x.webp'],
  },
  icons: {
    icon: '/icons/fast@4x.webp',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ConfigureAmplifyClientSide />
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
